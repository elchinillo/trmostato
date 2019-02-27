import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as StoreProvider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import AppShellComponent from './components/AppShell';
import TrmostatoComponent from './components/Trmostato';
import rootReducer from './reducers';
import registerServiceWorker from './registerServiceWorker';
import rootSaga from './sagas';
import createStore from './store';

ReactDOM.render(
    <StoreProvider store={createStore(rootReducer, rootSaga)}>
        <Router>
            <AppShellComponent>
                <Route exact path="/" component={TrmostatoComponent} />
            </AppShellComponent>
        </Router>
    </StoreProvider>,
    document.getElementById('trmostato')
);

registerServiceWorker();
