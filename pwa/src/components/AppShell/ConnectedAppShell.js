import { connect } from 'react-redux';

import { StateType } from '../../types';

import AppShellComponent from './AppShell';

function mapStateToProps(state: StateType) {
    return {
        locale: state.i18n.locale
    };
}

export default connect(mapStateToProps)(AppShellComponent);
