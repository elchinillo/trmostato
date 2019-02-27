export type TrmostatoType = {
    keepPowerOff: boolean,
    temperature: number,
    threshold: number
};

// Actions
export const SET_KEEP_POWER_OFF: 'SET_KEEP_POWER_OFF' = 'SET_KEEP_POWER_OFF';

export type SetKeepPowerOffAction = {
    type: typeof SET_KEEP_POWER_OFF,
    payload: boolean
};

export const SET_TEMPERATURE: 'SET_TEMPERATURE' = 'SET_TEMPERATURE';

export type SetTemperatureAction = {
    type: typeof SET_TEMPERATURE,
    payload: number
};

export const SET_THRESHOLD: 'SET_THRESHOLD' = 'SET_THRESHOLD';

export type SetThresholdAction = {
    type: typeof SET_THRESHOLD,
    payload: number
};
