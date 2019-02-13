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
local btn_pin = 5

gpio.mode(btn_pin, gpio.INT)

local function commitOverride(level)
    node.restart()
end

gpio.trig(btn_pin, 'up', commitOverride)

-- Callbacks

local getState
local syncState

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

    return syncState()
end

local function onTemperatureReady(ind, rom, res, t, tdec, par)
    state.temperature = math.floor(t)
    print('Sensor: ' .. state.temperature)

    return syncRelay()
end

getState = function ()
    return http.get(
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
                    state.override = true
                end
            end

            return ds18b20.read(onTemperatureReady, {})
        end
    )
end

syncState = function ()
    return http.put(
        TEMPERATURE_URL,
        'Content-Type: application/json\r\n',
        state.temperature,
        function (code)
            if code >= 200 and code < 300 then
                print('Sync: OK')
            else
                print('Sync: Failed to store temperature on cloud, ' .. code)
            end

            return getState()
        end
    )
end

-- Main

http.put(
    OVERRIDE_URL,
    'Content-Type: application/json\r\n',
    "true",
    function (code)
        return getState()
    end
)
