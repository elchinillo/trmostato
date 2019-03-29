import classnames from 'classnames';
import React from 'react';
import { defineMessages, injectIntl, type IntlShape } from 'react-intl';

import styles from './newVersionBadge.css';

const i18nMessages = defineMessages({
    newVersion: {
        defaultMessage: 'New version available',
        id: 'version.newVersion'
    }
})

type PropsType = {
    intl: IntlShape,
    version: string
};

type StateType = {
    show: boolean,
    version: ?string
};

class NewVersionBadge extends React.PureComponent<PropsType, StateType> {
    static getDerivedStateFromProps(props: PropsType, state: StateType) {
        return {
            show: typeof state.version === 'string' && props.version !== state.version,
            version: props.version
        };
    }

    state = {}

    reloadPage() {
        window.location.reload();
    }

    render() {
        const { intl } = this.props;
        const { show } = this.state;

        return (
            <section className={classnames(styles.container, { [styles.visible]: show })}>
                {(
                    <button className={styles.button} onClick={this.reloadPage}>
                        {intl.formatMessage(i18nMessages.newVersion)}
                    </button>
                )}
            </section>
        );
    }
}

export default injectIntl(NewVersionBadge);
