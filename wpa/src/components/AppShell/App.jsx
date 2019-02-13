import * as React from 'react';
import { IntlProvider } from 'react-intl';

import styles from './appShell.css';

type PropsType = {
    children: React.Node,
    locale: string
};

class App extends React.PureComponent<PropsType> {
    componentDidMount() {
        window.addEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
    }

    onBeforeInstallPrompt = (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        e.prompt();
    }

    render() {
        const { children, locale } = this.props;

        return (
            <IntlProvider locale={locale}>
                <React.Fragment>
                    <div className={styles.mbg} />
                    <div className={styles.content}>
                        {children}
                    </div>
                </React.Fragment>
            </IntlProvider>
        );
    }
}

export default App;
