import React, {FC} from 'react';
import styles from "./Separator.module.scss";

interface SeparatorProps {
    title: string;
    description?: string
}

const Separator:FC<SeparatorProps> = ({title, description}) => {
    return (
        <div className={styles.wrapper}>
            <h2>{title}</h2>
            <p>{description}</p>
            <hr/>
        </div>
    );
};

export default Separator;