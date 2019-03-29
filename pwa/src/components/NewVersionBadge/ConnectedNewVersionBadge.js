import { connect } from 'react-redux';

import type { StateType } from 'trmostato/types';

import NewVersionBadge from './NewVersionBadge';

function mapStateToProps(state: StateType) {
    return {
        version: state.trmostato.version
    };
}

export default connect(mapStateToProps)(NewVersionBadge);
