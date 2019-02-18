-- Setup Constants
local FIREBASE_HOME = 'https://trmostato.firebaseio.com'
local ME_URL = string.format('%s/me.json', FIREBASE_HOME)
local OVERRIDE_URL = string.format('%s/me/state/override.json', FIREBASE_HOME)
local TEMPERATURE_URL = string.format('%s/me/state/temperature.json', FIREBASE_HOME)
local OVERRIDE_TIMEOUT = 30000

-- Init state
local state = {
    temperature = 0,
    threshold = 0,
    override = true,
    firstFail = nil
}

-- Setup relay
local relay_pin = 2

gpio.mode(relay_pin, gpio.OUTPUT)
gpio.write(relay_pin, gpio.LOW)

-- Setup sensor
local sensor_pin = 3

ds18b20.setup(sensor_pin)

-- Setup btn
local rstBtn_pin = 4

gpio.mode(rstBtn_pin, gpio.INT)

gpio.trig(rstBtn_pin, 'up', function () node.dsleep(1000000) end)

-- Timers

local relayTimer = tmr.create()
local sensorTimer = tmr.create()
local httpTimer = tmr.create()

-- Callbacks

local function syncRelay()
    if state.override then
        print('Relay: off (override)')
        gpio.write(relay_pin, gpio.LOW)
    elseif state.temperature < state.threshold then
        print('Relay: on')
        gpio.write(relay_pin, gpio.HIGH)
    else
        print('Relay: off')
        gpio.write(relay_pin, gpio.LOW)
    end
end

local function onTemperatureReady(ind, rom, res, t, tdec, par)
    state.temperature = math.floor(t)
    print('Sensor: ' .. state.temperature)
end

local function senseTemperature()
    ds18b20.read(onTemperatureReady, {})
end

local function getState()
    http.get(
        ME_URL,
        nil,
        function (code, jsonResponse)
            if code >= 200 and code < 300 then
                snapshot = sjson.decode(jsonResponse)
                print('Threshold: ' .. snapshot.config.threshold)
                state.threshold = snapshot.config.threshold
                state.override = snapshot.state.override
                state.firstFail = nil
            else
                print('Error: (' .. code .. ') Failed to get state from cloud')
                if not state.firstFail then
                    state.firstFail = tmr.time()
                end

                if tmr.time() - state.firstFail > OVERRIDE_TIMEOUT then
                    node.dsleep(1000000)
                end
            end

            httpTimer:start()
        end
    )
end

local function syncState()
    httpTimer:stop()

    http.put(
        TEMPERATURE_URL,
        'Content-Type: application/json\r\n',
        state.temperature,
        function (code)
            if code == 200 then
                print('Sync: OK')
                getState()
            else
                httpTimer:start()
                print('Sync: Failed to store temperature on cloud, ' .. code)
            end
        end
    )
end

-- Set up timers

relayTimer:register(5000, tmr.ALARM_AUTO, syncRelay)

sensorTimer:register(5000, tmr.ALARM_AUTO, senseTemperature)

httpTimer:register(5000, tmr.ALARM_AUTO, syncState)

-- Main

print('Override relay state')
http.put(
    OVERRIDE_URL,
    'Content-Type: application/json\r\n',
    "true",
    function (code)
        if code == 200 then
            print('Done')
            senseTemperature()
            print('Start sensor timer')
            sensorTimer:start()
            print('Start relay timer')
            relayTimer:start()
            print('Start http timer')
            httpTimer:start()
        else
            print('Failed to override relay, sleep')
            node.dsleep(1000000)
        end
    end
)
