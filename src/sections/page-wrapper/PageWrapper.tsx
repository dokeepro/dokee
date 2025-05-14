import React, {FC} from 'react';
import styles from "./PageWrapper.module.scss"

interface PageWrapperProps {
    children: React.ReactNode;
}

const PageWrapper:FC<PageWrapperProps> = ({children}) => {
    return (
        <main className={styles.main}>
            {children}
        </main>
    );
};

export default PageWrapper;