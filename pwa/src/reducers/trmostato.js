import { SET_KEEP_POWER_OFF, SET_TEMPERATURE, SET_THRESHOLD, SET_VERSION } from 'trmostato/types/trmostato';
import type { SetKeepPowerOffAction, SetTemperatureAction, SetThresholdAction, SetVersionAction, TrmostatoType } from 'trmostato/types/trmostato';

const initialState: TrmostatoType = {
    keepPowerOff: false,
    temperature: 0,
    threshold: 0,
    version: null
};

type TrmostatoActions = SetKeepPowerOffAction | SetTemperatureAction | SetThresholdAction | SetVersionAction;

function trmostatoReducer (state = initialState, action: TrmostatoActions): TrmostatoType {
    switch (action.type) {
        case SET_KEEP_POWER_OFF:
            return { ...state, keepPowerOff: action.payload };

        case SET_TEMPERATURE:
            return { ...state, temperature: action.payload };

        case SET_THRESHOLD:
            return { ...state, threshold: action.payload };

        case SET_VERSION:
            return { ...state, version: action.payload };

        default:
            return state;
    }
}

export default trmostatoReducer;
