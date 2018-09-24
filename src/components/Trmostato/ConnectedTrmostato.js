import { connect } from 'react-redux';

import TrmostatoComponent from './Trmostato';

function mapStateToProps(state: StateType) {
    return state.trmostato;
}

export default connect(mapStateToProps)(TrmostatoComponent);
