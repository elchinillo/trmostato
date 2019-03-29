import { connect } from 'react-redux';
import { withRouter } from "react-router";

import TrmostatoComponent from './Trmostato';

function mapStateToProps(state: StateType) {
    return state.trmostato;
}

export default withRouter(connect(mapStateToProps)(TrmostatoComponent));
