import { applyMiddleware, compose, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';

const sagaMiddleware = createSagaMiddleware();

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default (rootReducer, rootSaga) => {
    const store = createStore(rootReducer, composeEnhancers(applyMiddleware(sagaMiddleware)));

    sagaMiddleware.run(rootSaga);

    return store;
};
