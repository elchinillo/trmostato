import { defineMessages } from 'react-intl';
import { eventChannel } from 'redux-saga';
import { call, put, takeEvery } from 'redux-saga/effects';
import firebase from 'firebase';

import { setError } from 'trmostato/actions/app';
import { setKeepPowerOff, setTemperature, setThreshold, setVersion } from 'trmostato/actions/trmostato';
import { SET_KEEP_POWER_OFF, SET_THRESHOLD, type SetKeepPowerOffAction, type SetThresholdAction } from 'trmostato/types/trmostato';


const i18nMessages = defineMessages({
    failedToInit: {
        defaultMessage: 'Ooops... Something went wrong while trying to subscribe to notification service.',
        id: 'firebase.error.init'
    }
});

const firebaseMetaKey = '@@firebase';
const injectFirebaseMetadata = action => ({ ...action, meta: { ...action.meta, [firebaseMetaKey]: true } });
const isFirebaseAction = action => (action.meta && action.meta[firebaseMetaKey]);

const KEEP_POWER_OFF_CHANGE_EVENT: 'KEEP_POWER_OFF_CHANGE_EVENT' = 'KEEP_POWER_OFF_CHANGE_EVENT';
type KeepPowerOffChangeEvent = {
    type: typeof KEEP_POWER_OFF_CHANGE_EVENT,
    payload: boolean
};

const TEMPERATURE_CHANGE_EVENT: 'TEMPERATURE_CHANGE_EVENT' = 'TEMPERATURE_CHANGE_EVENT';
type TemperatureChangeEvent = {
    type: typeof TEMPERATURE_CHANGE_EVENT,
    payload: number
};

const THRESHOLD_CHANGE_EVENT: 'THRESHOLD' = 'THRESHOLD';
type ThresholdChangeEvent = {
    type: typeof THRESHOLD_CHANGE_EVENT,
    payload: number
};

const VERSION_CHANGE_EVENT: 'VERSION' = 'VERSION';
type VersionChangeEvent = {
    type: typeof VERSION_CHANGE_EVENT,
    payload: string
};

type FirebaseEvent = KeepPowerOffChangeEvent | TemperatureChangeEvent | ThresholdChangeEvent | VersionChangeEvent;

function subscribeToFirebase(emitter) {
    firebase.database().ref('version').on('value', snapshot => emitter({
        type: VERSION_CHANGE_EVENT,
        payload: snapshot.val()
    }));

    firebase.database().ref('me/state/keepPowerOff').on('value', snapshot => emitter({
        type: KEEP_POWER_OFF_CHANGE_EVENT,
        payload: snapshot.val()
    }));

    firebase.database().ref('me/state/temperature').on('value', snapshot => emitter({
        type: TEMPERATURE_CHANGE_EVENT,
        payload: snapshot.val()
    }));

    firebase.database().ref('me/config/threshold').on('value', snapshot => emitter({
        type: THRESHOLD_CHANGE_EVENT,
        payload: snapshot.val()
    }));

    return () => {
        console.error('Unsubscribing from Firebase is not supported');
    };
}

function* mapFirebaseEventToReduxAction(firebaseEvent: FirebaseEvent) {
    switch (firebaseEvent.type) {
        case KEEP_POWER_OFF_CHANGE_EVENT:
            yield put(injectFirebaseMetadata(setKeepPowerOff(firebaseEvent.payload)));
            break;

        case TEMPERATURE_CHANGE_EVENT:
            yield put(injectFirebaseMetadata(setTemperature(firebaseEvent.payload)));
            break;

        case THRESHOLD_CHANGE_EVENT:
            yield put(injectFirebaseMetadata(setThreshold(firebaseEvent.payload)));
            break;

        case VERSION_CHANGE_EVENT:
            yield put(injectFirebaseMetadata(setVersion(firebaseEvent.payload)));
            break;

        default:
            console.error(`Got unsupported firebase event '${firebaseEvent.type}'`);
            break;
    }
}

type UpdateTrmostatoConfigActions = SetThresholdAction;
function updateTrmostatoConfig(action: UpdateTrmostatoConfigActions) {
    // Ignore actions dispatched from this saga
    if (isFirebaseAction(action)) return;

    switch (action.type) {
        case SET_THRESHOLD:
            firebase.database().ref('me/config/threshold').set(action.payload);
            break;
        default:
            return;
    }
}

type UpdateTrmostatoStateActions = SetKeepPowerOffAction;
function updateTrmostatoState(action: UpdateTrmostatoStateActions) {
    // Ignore actions dispatched from this saga
    if (isFirebaseAction(action)) return;

    switch (action.type) {
        case SET_KEEP_POWER_OFF:
            firebase.database().ref('me/state/keepPowerOff').set(action.payload);
            break;
        default:
            return;
    }
}

function* trmostatoSaga() {
    let firebaseChannel;

    try {
        firebaseChannel = yield call(eventChannel, subscribeToFirebase);
    } catch(e) {
        yield put(setError(i18nMessages.failedToInit));
        console.error(`Oops... something went wrong while subscribing to firebase events:  '${e.message}'`);

        return;
    }

    yield takeEvery(firebaseChannel, mapFirebaseEventToReduxAction);
    yield takeEvery(SET_KEEP_POWER_OFF, updateTrmostatoState);
    yield takeEvery(SET_THRESHOLD, updateTrmostatoConfig);
}

export default trmostatoSaga;
