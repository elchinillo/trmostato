import type { MessageDescriptor } from 'react-intl';

type ErrorType = MessageDescriptor & { values?: { [string]: mixed } };
export const setError = (error: ErrorType, section: string = 'APP') => ({ type: `SET_${section}_ERROR`, payload: { error } });
