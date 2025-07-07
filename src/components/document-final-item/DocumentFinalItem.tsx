import React, {FC} from 'react';
import styles from "./DocumentFinalitem.module.scss";

interface DocumentFinalItemProps {
    documentName: string;
    documentFullName: string;
    tariff: string;
    languagePair: string;
    documentPrice: number;
}

const DocumentFinalItem: FC<DocumentFinalItemProps> = ({documentName, documentFullName, tariff, languagePair, documentPrice}) => {

    return (
        <div className={styles.wrapper}>
            <h3>{documentName.replace(/[()]/g, '')}</h3>
            <div className={styles.documents}>
                <div className={styles.document}>
                    <label>Документ</label>
                    <h4>{documentFullName}</h4>
                </div>
                <div className={styles.document}>
                    <label>Языковая пара</label>
                    <h4>{languagePair}</h4>
                </div>
                <div className={styles.document}>
                    <label>Тариф</label>
                    <h4>{tariff}</h4>
                </div>
            </div>
            <p>Стоимость: <span>{documentPrice}₸</span></p>
        </div>
    );
};

export default DocumentFinalItem;