import React, { FC } from 'react';
import styles from './Tariffitem.module.scss';
import { Button } from '@mui/material';
import Image from 'next/image';

interface Benefit {
    iconSrc: string;
    text: string;
}

interface TariffItemProps {
    title: 'Normal' | 'Express' | 'Fast';
    description: string;
    benefits: Benefit[];
    price: number;
    borderRadius?: string[];
    onSelect: () => void;
    isSelected: boolean;
    selectedTariff?: string;
}

const TariffItem: FC<TariffItemProps> = ({
                                             title, description, benefits, price, borderRadius = ['30px'],
                                             onSelect, isSelected, selectedTariff
                                         }) => {
    const getBackgroundColor = () => {
        switch (title) {
            case 'Normal':
                return '#ffffff';
            case 'Express':
                return '#eff0ff';
            case 'Fast':
                return '#565add';
            default:
                return '#ffffff';
        }
    };

    const getTextColor = () => {
        switch (title) {
            case 'Normal':
                return 'var(--black)';
            case 'Express':
                return '#565add';
            case 'Fast':
                return '#ffffff';
            default:
                return 'var(--black)';
        }
    };

    const getBorderColor = () => {
        switch (title) {
            case 'Normal':
                return '#eff3f7';
            case 'Express':
                return '#d0d2f8';
            case 'Fast':
                return '#ffffff';
            default:
                return '#fff';
        }
    };

    const getButtonBackground = () => {
        switch (title) {
            case 'Normal':
                return '#ffffff';
            case 'Express':
                return '#eff0ff';
            case 'Fast':
                return '#565add';
            default:
                return '#ffffff';
        }
    };

    const getButtonBorder = () => {
        switch (title) {
            case 'Normal':
            case 'Express':
                return isSelected ? '1px solid #565add' : '1px solid #d6e0ec';
            case 'Fast':
                return '1px solid #565add';
            default:
                return '1px solid #d6e0ec';
        }
    };

    const getButtonTextColor = () => {
        switch (title) {
            case 'Fast':
                return '#fff';
            default:
                return '#000';
        }
    };

    const getBorderRadius = () => {
        switch (title) {
            case 'Normal':
                return '0 0 30px 30px';
            case 'Express':
                return '0 0 0 0';
            case 'Fast':
                return '0 0 30px 0';
            default:
                return '0';
        }
    };

    const opacity = selectedTariff && !isSelected ? 0.5 : 1;

    return (
        <div
            className={styles.tariffItem}
            style={{
                background: getBackgroundColor(),
                borderRadius: borderRadius.join(' '),
                opacity,
                transition: 'opacity 0.3s'
            }}>
            <div className={styles.tariffItemInner}>
                <div className={styles.tariffTitle} >
                    <h2 style={{ color: getTextColor() }}>{title}</h2>
                    <p style={{ color: title === "Fast" ? "#fff" : "#000" }}>{description}</p>
                </div>
                <div className={styles.advantages} >
                    {benefits.map((benefit, index) => (
                        <div key={index} className={styles.advantageItem} style={{ color: getTextColor(), borderColor: getBorderColor() }}>
                            <Image src={benefit.iconSrc} alt="icon" width={20} height={20} />
                            {benefit.text}
                        </div>
                    ))}
                </div>
                <h3 style={{ color: getTextColor() }}>{price} ₸</h3>
            </div>
            <div className={styles.tariffButton} style={{borderRadius: getBorderRadius()}}>
                <Button
                    onClick={onSelect}
                    sx={{
                        backgroundColor: getButtonBackground(),
                        color: getButtonTextColor(),
                        border: getButtonBorder(),
                        textTransform: 'none',
                        padding: '24px 16px',
                        width: '100%',
                        borderRadius: '15px',
                        '&:hover': {
                            backgroundColor: title === 'Fast' ? '#4447b0' : '#f9f9f9',
                            borderColor: '#c0c0c0',
                        },
                    }}>
                    {isSelected ? 'Пакет выбран' : 'Выбрать пакет'}
                </Button>
            </div>
        </div>
    );
};

export default TariffItem;