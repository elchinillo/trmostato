import { defineMessages } from 'react-intl';
import { eventChannel } from 'redux-saga';
import { call, put, takeEvery } from 'redux-saga/effects';
import firebase from 'firebase';

import { setError } from 'trmostato/actions/app';
import { setOverride, setTemperature, setThreshold } from 'trmostato/actions/trmostato';

const i18nMessages = defineMessages({
    failedToInit: {
        defaultMessage: 'Ooops... Something went wrong while trying to subscribe to notification service.',
        id: 'firebase.error.init'
    }
});

type OverrideTag = 'OVERRIDE';
const OVERRIDE: OverrideTag = 'OVERRIDE';
type OverrideEvent = {
    type: OverrideTag,
    payload: number
};

type TemperatureTag = 'TEMPERATURE';
const TEMPERATURE: TemperatureTag = 'TEMPERATURE';
type TemperatureEvent = {
    type: TemperatureTag,
    payload: number
};

type ThresholdTag = 'THRESHOLD';
const THRESHOLD: ThresholdTag = 'THRESHOLD';
type ThresholdEvent = {
    type: ThresholdTag,
    payload: number
};

type FirebaseEvent = OverrideEvent | TemperatureEvent | ThresholdEvent;

function subscribeToFirebase(emitter) {
    firebase.database().ref('me/state/override').on('value', snapshot => emitter({
        type: 'OVERRIDE',
        payload: snapshot.val()
    }));

    firebase.database().ref('me/state/temperature').on('value', snapshot => emitter({
        type: 'TEMPERATURE',
        payload: snapshot.val()
    }));

    firebase.database().ref('me/config/threshold').on('value', snapshot => emitter({
        type: 'THRESHOLD',
        payload: snapshot.val()
    }));

    return () => {
        console.error('Unsubscribing from Firebase is not supported');
    };
}

function* mapFirebaseEventToReduxAction(firebaseEvent: FirebaseEvent) {
    switch (firebaseEvent.type) {
        case OVERRIDE:
            yield put(setOverride(firebaseEvent.payload));
            break;

        case TEMPERATURE:
            yield put(setTemperature(firebaseEvent.payload));
            break;

        case THRESHOLD:
            yield put(setThreshold(firebaseEvent.payload));
            break;

        default:
            console.error(`Got unsupported firebase event '${firebaseEvent.type}'`);
            break;
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
}

export default trmostatoSaga;
