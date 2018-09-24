import { SET_OVERRIDE, SET_TEMPERATURE, SET_THRESHOLD } from 'trmostato/types/trmostato';
import type { SetOverrideAction, SetTemperatureAction, SetThresholdAction } from 'trmostato/types/trmostato';

export const setOverride = (override: number): SetOverrideAction => ({ type: SET_OVERRIDE, payload: override });

export const setTemperature = (temperature: number): SetTemperatureAction => ({ type: SET_TEMPERATURE, payload: temperature });

export const setThreshold = (threshold: number):SetThresholdAction => ({ type: SET_THRESHOLD, payload: threshold });
