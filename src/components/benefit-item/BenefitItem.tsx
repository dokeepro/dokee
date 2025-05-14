import React, {FC} from 'react';
import styles from "./BenefitItem.module.scss"
import Image from "next/image";

interface BenefitItemProps {
    title: string;
    description: string;
    image: string;
}

const BenefitItem: FC<BenefitItemProps> = ({title, description, image}) => {
    return (
        <div className={styles.wrapper}>
            <Image src={image} alt="image" width={256} height={256}/>
            <div className={styles.text}>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
        </div>
    );
};

export default BenefitItem;