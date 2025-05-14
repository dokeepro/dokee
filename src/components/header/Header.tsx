import React from 'react';
import styles from "./Header.module.scss";
import Image from "next/image";
import logo from "@/assets/logos/dokee-logo.svg"
import whatsIcon from "@/assets/icons/whatsapp-icon.svg"
import ButtonOutlined from "@/components/custom-button/ButtonOutlined";
import Link from "next/link";

const Header = () => {
    return (
        <header className={styles.header}>
            <Image src={logo} alt="logo" width={132} height={30}/>
            <div className={styles.nav}>
                <div className={styles.navLinks}>
                    <Link href="/#">Калькулятор</Link>
                    <Link href="/#">Предложить документ</Link>
                    <Link href="/#">Контакты</Link>
                    <Link href="/#">Частые вопросы</Link>
                </div>
                <ButtonOutlined>
                    <Image src={whatsIcon} alt={"icon"} width={20} height={20}/>
                    Whatsapp
                </ButtonOutlined>
            </div>
        </header>
    );
};

export default Header;