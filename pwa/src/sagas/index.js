import { fork } from 'redux-saga/effects';

import trmostatoSaga from './trmostato';

function* appSaga(): Saga<void> {
    yield fork(trmostatoSaga);
}

export default appSaga;
