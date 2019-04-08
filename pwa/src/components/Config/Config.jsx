import React from 'react';

import styles from './config.css';
import { defineMessages, injectIntl, type IntlShape } from 'react-intl';
import { withRouter } from 'react-router';

const KEEP_POWER_OFF: 'keepPowerOff' = 'keepPowerOff';
const THRESHOLD: 'threshold' = 'threshold';

const i18nMessages = defineMessages({
    keepPowerOff: {
        defaultMessage: 'Keep power off:',
        id: 'config.keepPowerOff'
    },
    threshold: {
        defaultMessage: 'Threshold:',
        id: 'config.threshold'
    }
});

type PropsType = {
    intl: IntlShape,
    keepPowerOff: boolean,
    setKeepPowerOff: (boolean) => void,
    setThreshold: (number) => void,
    threshold: number
};

class Config extends React.PureComponent<PropsType> {
    componentDidMount() {
        window.addEventListener('dblclick', this.goBack);
    }

    componentWillUnmount() {
        window.removeEventListener(this.goBack);
    }

    goBack = () => {
        const { history } = this.props;

        history.replace('/');
    }

    onFieldChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
        const { setKeepPowerOff, setThreshold } = this.props;
        const { currentTarget, currentTarget: { name } } = e;

        switch (name) {
            case KEEP_POWER_OFF:
                const { checked } = currentTarget;

                setKeepPowerOff(checked);
                break;

            case THRESHOLD:
                const { value } = currentTarget;

                setThreshold(+value);
                break;

            default:
                break;
        }
    }

    render() {
        const { intl, keepPowerOff, threshold } = this.props;

        return (
            <section className={styles.config}>
                <form onSubmit={this.preventSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor={styles.keepPowerOff}>
                            {intl.formatMessage(i18nMessages.keepPowerOff)}
                        </label>
                        <input id={styles.keepPowerOff} name={KEEP_POWER_OFF} type="checkbox" checked={keepPowerOff} onChange={this.onFieldChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor={styles.threshold}>
                            {intl.formatMessage(i18nMessages.threshold)}
                        </label>
                        <select id={styles.threshold} name={THRESHOLD} value={threshold} onChange={this.onFieldChange}>
                            {Array.apply(null, {length: 30}).map(Number.call, Number).map((_, idx) => (
                                <option key={idx} value={idx+1}>{idx+1}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </section>
        );
    }
}

export default withRouter(injectIntl(Config));
