-- Setup Constants
local LOCAL_STATE_FILE = 'state.json'
local FIREBASE_HOME = 'https://trmostato.firebaseio.com'
local LONG_TIMEOUT = 60000 -- 60 secs
local SHORT_TIMEOUT = 1000 -- 1 sec

local RELAY_PIN = 2
local SENSOR_PIN = 3
local BTN_PIN = 4

-- local vars

local getState
local updateState

-- Init state
local state

if file.exists(LOCAL_STATE_FILE) and file.open(LOCAL_STATE_FILE, 'r') then
    print('Load prev state')
    state = sjson.decode(file.read('\n'))
    file.close()
else
    state = {
        temperature = 0,
        threshold = 0
    }
end

print('Inital state: ' .. sjson.encode(state))

state.keepPowerOff = true
state.pendingUpdate = nil
state.failures = 0

-- Setup relay
gpio.mode(RELAY_PIN, gpio.OUTPUT)
gpio.write(RELAY_PIN, gpio.LOW)

-- Setup sensor
ds18b20.setup(SENSOR_PIN)

-- Create execution thread

local threadTimer = tmr.create()

-- Update relay

local function updateRelay()
    if state.keepPowerOff then
        print('Relay: off (keepPowerOff)')
        gpio.write(RELAY_PIN, gpio.LOW)
    elseif state.temperature < state.threshold then
        print('Relay: on')
        gpio.write(RELAY_PIN, gpio.HIGH)
    elseif state.temperature > state.threshold  then
        print('Relay: off')
        gpio.write(RELAY_PIN, gpio.LOW)
    else
        print('Relay: noop')
    end
end

-- Setup btn
gpio.mode(BTN_PIN, gpio.INT)

local lastBtnPush = tmr.now()
gpio.trig(BTN_PIN, 'down', function (level, pushTimestamp)
    local delta = pushTimestamp - lastBtnPush
    if delta < 0 then delta = delta + 2147483647 end -- proposed because of delta rolling over, https://github.com/hackhitchin/esp8266-co-uk/issues/2
    if delta < 2000000 then return end

    lastBtnPush = pushTimestamp

    state.keepPowerOff = state.keepPowerOff ~= true
    state.pendingUpdate = true
    print('KeepPowerOff: ' .. tostring(state.keepPowerOff))
    updateRelay()
end)

-- Callbacks

local function senseTemperature()
    threadTimer:register(SHORT_TIMEOUT, tmr.ALARM_SINGLE, updateState)

    ds18b20.read(
        function (ind, rom, res, t, t_dec)
            -- Round temperature
            if t_dec > 500 then
                state.temperature = t + 1
            else
                state.temperature = t
            end
            print('Temperature: ' .. t .. '.' .. t_dec)

            updateRelay()

            threadTimer:start()
        end,
        {}
    )
end

getState = function()
    threadTimer:register(SHORT_TIMEOUT, tmr.ALARM_SINGLE, senseTemperature)

    http.get(
        string.format('%s/me.json', FIREBASE_HOME),
        nil,
        function (code, jsonResponse)
            if code >= 200 and code < 300 then
                snapshot = sjson.decode(jsonResponse)
                print('State: ' .. jsonResponse)

                state.failures = 0
                state.threshold = snapshot.config.threshold

                if not state.pendingUpdate then
                    state.keepPowerOff = snapshot.state.keepPowerOff
                end
            else
                print('Error(' .. code .. '): Failed to get state from cloud')

                state.failures = state.failures + 1

                if state.failures >= 10 then -- OVERRIDE_MAX_FAILURES
                    print('Too many failures to call home, save state and sleep')

                    if file.open(LOCAL_STATE_FILE, 'w') then
                        -- save current state
                        file.write(sjson.encode({
                            threshold = state.threshold,
                            temperature = state.temperature
                        }))
                        file.close()
                    end

                    wifi.sta.disconnect(function ()
                        node.dsleep(60000000) -- 10 min
                    end)
                end
            end

            threadTimer:start()
        end
    )
end

updateState = function ()
    local stateJson = {
        ['temperature'] = state.temperature
    }

    if state.pendingUpdate then
        stateJson['keepPowerOff'] = state.keepPowerOff
    end

    http.request(
        string.format('%s/me/state.json', FIREBASE_HOME),
        'PATCH',
        'Content-Type: application/json\r\n',
        sjson.encode(stateJson),
        function (code)
            if code == 200 then
                print('State: In sync')

                state.pendingUpdate = false

                threadTimer:register(LONG_TIMEOUT, tmr.ALARM_SEMI, getState)
            else
                print('Error(' .. code .. '): Failed to store state on cloud')

                threadTimer:register(SHORT_TIMEOUT, tmr.ALARM_SEMI, getState)
            end

            threadTimer:start()
        end
    )
end

-- Main

print('Get current state from cloud')
getState()
