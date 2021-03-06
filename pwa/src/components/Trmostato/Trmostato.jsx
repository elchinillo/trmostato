import classnames from 'classnames';
import * as React from 'react';
import { defineMessages, injectIntl, type IntlShape } from 'react-intl';
import { withRouter } from 'react-router';

import styles from './trmostato.css';

const i18nMessages = defineMessages({
    threshold: {
        defaultMessage: 'Threshold: {threshold}',
        id: 'trmostato.threshold'
    }
});

const COOL = 'cool';
const HEATING_OFF = 'off';
const HEATING_ON = 'on';
const OVERRIDE = 'override';

type PropsType = {
    intl: IntlShape,
    keepPowerOff: boolean,
    temperature: number,
    threshold: number
};

class Trmostato extends React.PureComponent<PropsType> {
    componentDidMount() {
        window.addEventListener('dblclick', this.goToConfig);
    }

    componentWillUnmount() {
        window.removeEventListener(this.goToConfig);
    }

    goToConfig = () => {
        const { history } = this.props;

        history.replace('/config');
    }

    render() {
        const { intl, keepPowerOff, temperature, threshold } = this.props;

        const trmostatoState = keepPowerOff ? OVERRIDE : temperature < threshold ? HEATING_ON : temperature === threshold ? COOL : HEATING_OFF;

        const trmostatoFeelsIconClassName = {
            [`fa-check-circle ${styles.cool}`]: COOL === trmostatoState,
            [`fa-snowflake ${styles.heatingOff}`]: HEATING_OFF === trmostatoState,
            [`fa-fire ${styles.heatingOn}`]: HEATING_ON === trmostatoState,
            [`fa-ban ${styles.override}`]: OVERRIDE === trmostatoState
        };

        const trmostatoStateIconClassName = {
            [`fa-flag-checkered ${styles.cool}`]: COOL === trmostatoState,
            [`fa-angle-down ${styles.heatingOff}`]: HEATING_OFF === trmostatoState,
            [`fa-angle-up ${styles.heatingOn}`]: HEATING_ON === trmostatoState,
            [`fa-angle-down ${styles.override}`]: OVERRIDE === trmostatoState
        };

        return (
            <section className={styles.trmostato}>
                <div className={styles.state}>
                    <div className={styles.temperature}>
                        {intl.formatNumber(temperature)}
                    </div>
                    <div className={classnames(styles.status)}>
                        <i className={classnames('fas', trmostatoFeelsIconClassName, styles.temperatureIcon)} />
                        <i className={classnames('fas', trmostatoStateIconClassName)} />
                        <i className={classnames('fas', trmostatoStateIconClassName)} />
                        <i className={classnames('fas', trmostatoStateIconClassName)} />
                        <i className={classnames('fas', trmostatoFeelsIconClassName, styles.temperatureIcon)} />
                    </div>
                </div>
                <div className={styles.config}>
                    {intl.formatMessage(i18nMessages.threshold, { threshold })}
                </div>
            </section>
        );
    }
}

export default withRouter(injectIntl(Trmostato));
