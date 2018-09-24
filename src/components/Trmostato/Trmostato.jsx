import classnames from 'classnames';
import * as React from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import styles from './trmostato.css';

const OVERRIDE = 'override';
const HEATING_ON = 'on';
const HEATING_OFF = 'off';

type PropsType = {
    override: boolean,
    temperature: number,
    threshold: number
};

function Trmostato({ override, temperature, threshold }: PropsType) {
    const trmostatoState = override ? OVERRIDE : temperature < threshold ? HEATING_ON : HEATING_OFF;

    const trmostatoStateClassNames = {
        [styles.heatingOff]: HEATING_OFF === trmostatoState,
        [styles.heatingOn]: HEATING_ON === trmostatoState,
        [styles.override]: OVERRIDE === trmostatoState
    };

    const trmostatoStateIconClassNames = {
        'fa-snowflake': HEATING_OFF === trmostatoState,
        'fa-fire': HEATING_ON === trmostatoState,
        'fa-ban': OVERRIDE === trmostatoState
    };

    return (
        <section className={styles.trmostato}>
            <div className={styles.stage}>
                <figure className={styles.ball}>
                    <span className={styles.iris}>
                        <FormattedNumber value={temperature} maximumFractionDigits={0}>
                            {formattedTemperature => (
                                <div className={styles.temperature}>
                                    {formattedTemperature}
                                </div>
                            )}
                        </FormattedNumber>
                        <FormattedMessage defaultMessage="State:" id="trmostato.state" values={{ state: trmostatoState }}>
                            {formattedState => (
                                <div className={classnames(styles.state, trmostatoStateClassNames)}>
                                    {formattedState} <i className={classnames('fas', trmostatoStateIconClassNames)} />
                                </div>
                            )}
                        </FormattedMessage>
                        <FormattedMessage defaultMessage="Threshold: {threshold}" id="trmostato.threshold" values={{ threshold }}>
                            {formattedState => (
                                <div className={styles.threshold}>
                                    {formattedState}
                                </div>
                            )}
                        </FormattedMessage>
                    </span>
                </figure>
            </div>
        </section>
    )
}

export default Trmostato;
