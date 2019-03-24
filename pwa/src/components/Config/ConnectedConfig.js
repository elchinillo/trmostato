import { connect } from 'react-redux';
import { withRouter } from "react-router";

import ConfigComponent from './Config';

import { setKeepPowerOff, setThreshold } from '../../actions/trmostato';
import type { StateType } from '../../types';

function mapStateToProps(state: StateType) {
    return {
        keepPowerOff: state.trmostato.keepPowerOff,
        threshold: state.trmostato.threshold
    };
}

const mapDispatchToProps = {
    setKeepPowerOff,
    setThreshold
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ConfigComponent));
