import * as React from 'react';
import { IntlProvider } from 'react-intl';

import styles from './appShell.css';

type PropsType = {
    children: React.Node,
    locale: string
};

function App({ children, locale }: PropsType) {
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

export default App;
