import { combineReducers } from 'redux';

import i18nReducer from './i18n';
import trmostatoReducer from './trmostato';

export default combineReducers({
    i18n: i18nReducer,
    trmostato: trmostatoReducer
});
