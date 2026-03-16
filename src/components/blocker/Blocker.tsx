import React from 'react';
import {FC} from "react";
import styles from "./Blocker.module.scss";

interface BlockerProps {
    children?: React.ReactNode;
}

const Blocker:FC<BlockerProps> = ({children}) => {
    return (
        <div className={styles.blocker}>
            {children}
        </div>
    );
};

export default Blocker;