import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as StoreProvider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import AppComponent from './components/AppShell';
import TrmostatoComponent from './components/Trmostato';
import rootReducer from './reducers';
import registerServiceWorker from './registerServiceWorker';
import rootSaga from './sagas';
import createStore from './store';

ReactDOM.render(
    <StoreProvider store={createStore(rootReducer, rootSaga)}>
        <Router>
            <AppComponent>
                <Route exact path="/" component={TrmostatoComponent} />
            </AppComponent>
        </Router>
    </StoreProvider>,
    document.getElementById('trmostato')
);

registerServiceWorker();
