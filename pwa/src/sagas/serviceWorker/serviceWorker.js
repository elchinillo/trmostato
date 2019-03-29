import { defineMessages } from 'react-intl';
import { eventChannel } from 'redux-saga';
import { call, put, takeEvery } from 'redux-saga/effects';

import { setError } from 'trmostato/actions/app';
import { setVersion } from 'trmostato/actions/serviceWorker';

import registerServiceWorker from './registerServiceWorker';

const i18nMessages = defineMessages({
    failedToInit: {
        defaultMessage: 'Ooops... Something went wrong while trying to subscribe to serviceWorker notifications.',
        id: 'serviceWorker.error.init'
    }
});

const INSTALLED_EVENT: 'INSTALLED' = 'INSTALLED';
type InstalledEvent = {
    type: typeof INSTALLED_EVENT,
    payload: string
};

type ServiceWorkerEvent = InstalledEvent;

function createMessageEventListener(emitter) {
    return (event) => {
        console.log(event.data);
        emitter(event.data);
    };
}

function subscribeToServiceWorker(emitter) {
    const messageEventListener = createMessageEventListener(emitter);

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', messageEventListener);
    }

    return () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.removeEventListener('message', messageEventListener);
        }
    };
}

function* mapServiceWorkerEventToReduxAction(serviceWorkerEvent: ServiceWorkerEvent) {
    switch (serviceWorkerEvent.type) {
        case INSTALLED_EVENT:
            yield put(setVersion('new version'));
            break;

        default:
            console.error(`Got unsupported service worker event '${serviceWorkerEvent.type}'`);
            break;
    }
}

function* serviceWorkerSaga(): Saga<void> {
    let serviceWorkerChannel;

    try {
        serviceWorkerChannel = yield call(eventChannel, subscribeToServiceWorker);
    } catch(e) {
        yield put(setError(i18nMessages.failedToInit));
        console.error(`Oops... something went wrong while subscribing to service worker events:  '${e.message}'`);

        return;
    }

    yield call(registerServiceWorker);

    yield takeEvery(serviceWorkerChannel, mapServiceWorkerEventToReduxAction);
}

export default serviceWorkerSaga;
