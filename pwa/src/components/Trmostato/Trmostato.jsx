import classnames from 'classnames';
import * as React from 'react';
import { defineMessages, injectIntl, type IntlShape } from 'react-intl';

import styles from './trmostato.css';

const i18nMessages = defineMessages({
    threshold: {
        defaultMessage: 'Threshold: {threshold}',
        id: 'trmostato.threshold'
    }
});

const OVERRIDE = 'override';
const HEATING_ON = 'on';
const HEATING_OFF = 'off';

type PropsType = {
    intl: IntlShape,
    keepPowerOff: boolean,
    temperature: number,
    threshold: number
};

function Trmostato({ intl, keepPowerOff, temperature, threshold }: PropsType) {
    const trmostatoState = keepPowerOff ? OVERRIDE : temperature < threshold ? HEATING_ON : HEATING_OFF;

    const trmostatoFeelsIconClassName = {
        [`fa-snowflake ${styles.heatingOff}`]: HEATING_OFF === trmostatoState,
        [`fa-fire ${styles.heatingOn}`]: HEATING_ON === trmostatoState,
        [`fa-ban ${styles.override}`]: OVERRIDE === trmostatoState
    };

    const trmostatoStateIconClassName = {
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
    )
}

export default injectIntl(Trmostato);
