-- Setup Constants
local LOCAL_STATE_FILE = 'state.json'
local FIREBASE_HOME = 'https://trmostato.firebaseio.com'
local TIMER_TIMEOUT = 5000

local getState
local syncState

-- Init state
local state

if file.exists(LOCAL_STATE_FILE) and file.open(LOCAL_STATE_FILE, 'r') then
    print('Load prev state')
    state = sjson.decode(file.read('\n'))
    file.close()
else
    state = {
        keepPowerOff = true,
        temperature = 0,
        threshold = 0
    }
end

print('Inital state: ' .. sjson.encode(state))

state.inSync = nil
state.failures = 0

-- Setup relay
local relay_pin = 2

gpio.mode(relay_pin, gpio.OUTPUT)
gpio.write(relay_pin, gpio.LOW)

-- Setup sensor
ds18b20.setup(3)

-- Create timers

local relayTimer = tmr.create()
local sensorTimer = tmr.create()
local httpTimer = tmr.create()

-- Setup btn
gpio.mode(4, gpio.INT)

local lastBtnPush = tmr.now()
gpio.trig(4, 'down', function ()
    local delta = tmr.now() - lastBtnPush
    if delta < 0 then delta = delta + 2147483647 end -- proposed because of delta rolling over, https://github.com/hackhitchin/esp8266-co-uk/issues/2
    if delta < 2000000 then return end

    lastBtnPush = tmr.now()

    state.keepPowerOff = state.keepPowerOff ~= true
    state.inSync = false
    print('KeepPowerOff: ' .. tostring(state.keepPowerOff))
end)

-- Callbacks

local function syncRelay()
    if state.keepPowerOff then
        print('Relay: off (keepPowerOff)')
        gpio.write(relay_pin, gpio.LOW)
    elseif state.temperature < (state.threshold - 1) then
        print('Relay: on')
        gpio.write(relay_pin, gpio.HIGH)
    elseif state.temperature > state.threshold then
        print('Relay: off')
        gpio.write(relay_pin, gpio.LOW)
    else
        print('Relay: noop (heating)')
    end
    relayTimer:start()
end

local function senseTemperature()
    ds18b20.read(
        function (ind, rom, res, t)
            state.temperature = math.floor(t)
            print('Sensor: ' .. state.temperature)
            sensorTimer:start()
        end,
        {}
    )
end

getState = function()
    httpTimer:register(TIMER_TIMEOUT, tmr.ALARM_SINGLE, syncState)

    http.get(
        string.format('%s/me.json', FIREBASE_HOME),
        nil,
        function (code, jsonResponse)
            if code >= 200 and code < 300 then
                snapshot = sjson.decode(jsonResponse)
                print('State: ' .. jsonResponse)

                state.failures = 0
                state.threshold = snapshot.config.threshold

                if state.inSync == nil or state.inSync then
                    state.keepPowerOff = snapshot.state.keepPowerOff
                end

                state.inSync = true
                state.hasBeenOnline = true
            else
                print('Error(' .. code .. '): Failed to get state from cloud')

                state.failures = state.failures + 1

                if state.failures >= 10 then -- OVERRIDE_MAX_FAILURES
                    print('Too many failures to call home, sleep')
                    wifi.sta.disconnect(function ()
                        node.dsleep(60000000) -- 1 min
                    end)
                end
            end

            httpTimer:start()
        end
    )
end

syncState = function ()
    httpTimer:register(TIMER_TIMEOUT, tmr.ALARM_SINGLE, getState)

    local stateJson = {
        ['temperature'] = state.temperature
    }

    if state.inSync ~= nil then
        stateJson['keepPowerOff'] = state.keepPowerOff
    end

    print('Sync state')

    http.request(
        string.format('%s/me/state.json', FIREBASE_HOME),
        'PATCH',
        'Content-Type: application/json\r\n',
        sjson.encode(stateJson),
        function (code)
            if code == 200 then
                print('Sync state: OK')
            else
                print('Error(' .. code .. '): Failed to store state on cloud')
            end

            httpTimer:start()
        end
    )
end

-- Set up timers

relayTimer:register(TIMER_TIMEOUT, tmr.ALARM_SEMI, syncRelay)

sensorTimer:register(TIMER_TIMEOUT, tmr.ALARM_SEMI, senseTemperature)

httpTimer:register(TIMER_TIMEOUT, tmr.ALARM_SINGLE, getState)

-- Main

senseTemperature()
print('Start sensor timer')
sensorTimer:start()
print('Start relay timer')
relayTimer:start()
print('Start http timer')
httpTimer:start()
