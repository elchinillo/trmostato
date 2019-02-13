import { SET_OVERRIDE, SET_TEMPERATURE, SET_THRESHOLD } from 'trmostato/types/trmostato';
import type { SetOverrideAction, SetTemperatureAction, SetThresholdAction, TrmostatoType } from 'trmostato/types/trmostato';

const initialState: TrmostatoType = {
    override: false,
    temperature: 0,
    threshold: 0
};

type TrmostatoActions = SetOverrideAction | SetTemperatureAction | SetThresholdAction;

function trmostatoReducer (state = initialState, action: TrmostatoActions): TrmostatoType {
    switch (action.type) {
        case SET_OVERRIDE:
            return { ...state, override: action.payload };

        case SET_TEMPERATURE:
            return { ...state, temperature: action.payload };

        case SET_THRESHOLD:
            return { ...state, threshold: action.payload };

        default:
            return state;
    }
}

export default trmostatoReducer;
