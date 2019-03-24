import { SET_KEEP_POWER_OFF, SET_TEMPERATURE, SET_THRESHOLD, SET_VERSION } from 'trmostato/types/trmostato';
import type { SetKeepPowerOffAction, SetTemperatureAction, SetThresholdAction, SetVersionAction } from 'trmostato/types/trmostato';

export const setKeepPowerOff = (value: boolean): SetKeepPowerOffAction => ({ type: SET_KEEP_POWER_OFF, payload: value });

export const setTemperature = (temperature: number): SetTemperatureAction => ({ type: SET_TEMPERATURE, payload: temperature });

export const setThreshold = (threshold: number): SetThresholdAction => ({ type: SET_THRESHOLD, payload: threshold });

export const setVersion = (version: string): SetVersionAction => ({ type: SET_VERSION, payload: version });
