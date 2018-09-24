export type TrmostatoType = {
    override: boolean,
    temperature: number,
    threshold: number
};

// Actions
type SetOverrideTag = 'SET_OVERRIDE';
export const SET_OVERRIDE: SetOverrideTag = 'SET_OVERRIDE';

export type SetOverrideAction = {
    type: SetOverrideTag,
    payload: number
};

type SetTemperatureTag = 'SET_TEMPERATURE';
export const SET_TEMPERATURE: SetTemperatureTag = 'SET_TEMPERATURE';

export type SetTemperatureAction = {
    type: SetTemperatureTag,
    payload: number
};

type SetThresholdTag = 'SET_THRESHOLD';
export const SET_THRESHOLD: SetThresholdTag = 'SET_THRESHOLD';

export type SetThresholdAction = {
    type: SetThresholdTag,
    payload: number
};
