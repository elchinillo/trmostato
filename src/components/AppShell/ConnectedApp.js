import { connect } from 'react-redux';

import { StateType } from '../../types';

import AppComponent from './App';

function mapStateToProps(state: StateType) {
    return {
        locale: state.i18n.locale
    };
}

export default connect(mapStateToProps)(AppComponent);
