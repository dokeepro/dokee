import React, {FC, useState} from 'react';
import styles from './Tariffitem.module.scss';
import {Button, Popover} from '@mui/material';
import Image from 'next/image';
import boxTime from "@/assets/icons/BoxTime.svg"
import calendar from "@/assets/icons/calendar-24-24.svg"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import {useSampleStore} from "@/store/sampleStore";

interface Benefit {
    iconSrc: string;
    text: string;
}

interface TariffItemProps {
    title: 'Normal' | 'Express' | 'Fast';
    description: string;
    benefits: Benefit[];
    price: number;
    availableSlots: number;
    borderRadius?: string[];
    onSelect: () => void;
    isSelected: boolean;
    selectedTariff?: string;
}

const TariffItem: FC<TariffItemProps> = ({
                                             title, description, benefits, price, borderRadius = ['30px'],
                                             onSelect, isSelected, selectedTariff, availableSlots
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
    const isUnavailable = availableSlots <= 0;
    const selectedDate = useSampleStore(state => state.selectedDate);
    const setSelectedDate = useSampleStore(state => state.setSelectedDate);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDateChange = (newValue: Dayjs | null) => {
        setSelectedDate(newValue);
        handleClose();
    };

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
                <div className={styles.tariffTitle}>
                    <h2 style={{color: getTextColor()}}>{title}</h2>
                    <p style={{color: title === "Fast" ? "#fff" : "#000"}}>{description}</p>
                </div>
                {!isUnavailable ? (
                    <div className={styles.advantages}>
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className={styles.advantageItem}
                                style={{color: getTextColor(), borderColor: getBorderColor()}}>
                                <Image src={benefit.iconSrc} alt="icon" width={20} height={20}/>
                                {benefit.text}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.warning}>
                        <div className={styles.warningContent}>
                            <div className={styles.warningContentInner}>
                                <Image src={boxTime} alt="Warning Icon" width={20} height={20}/>
                                <div className={styles.warningText}>
                                    <h4>К сожалению, в звязи с повышенной загрузкой у нас не осталось свободных ресурсов
                                        для перевода на &quot;сегодня&quot;-&quot;завтра&quot;</h4>
                                    <p>Предлагаем ниже выбрать доступные тарифы на &quot;завтра-послезавтра&quot;</p>
                                </div>
                            </div>
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={handleButtonClick}
                                className={styles.fakeButton}
                                style={{
                                    padding: '16px',
                                    borderRadius: '10px',
                                    gap: '4px',
                                    backgroundColor: '#ffffff',
                                    boxShadow: 'none',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#000',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: '13px',
                                    maxHeight: '48px',
                                    fontFamily: "'CraftworkGrotesk', 'Involve', Arial, sans-serif",
                                    cursor: 'pointer',
                                    marginTop: '16px'
                                }}>
                                <Image src={calendar} alt="icon" width={24} height={24}/>
                                {selectedDate ? `Выбрано: ${selectedDate.format('DD.MM.YYYY')}` : 'Выбрать ближайшее время'}
                            </div>
                            <Popover
                                open={Boolean(anchorEl)}
                                anchorEl={anchorEl}
                                onClose={handleClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}>
                                <div style={{ padding: 16, background: '#fff' }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <StaticDatePicker
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                            disablePast
                                            minDate={dayjs().add(1, 'day')}
                                            displayStaticWrapperAs="desktop"
                                        />
                                    </LocalizationProvider>
                                </div>
                            </Popover>
                        </div>
                    </div>
                )}
                <h3 style={{color: getTextColor()}}>{price} ₸</h3>
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