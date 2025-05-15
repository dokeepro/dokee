"use client";

import React, { useState } from 'react';
import styles from "./Header.module.scss";
import Image from "next/image";
import whatsIcon from "@/assets/icons/whatsapp-icon.svg";
import burgerIcon from "@/assets/icons/burger-icon.svg";
import burgerIconBlue from "@/assets/icons/burger-icon-blue.svg";
import logo from "@/assets/logos/dokee-logo.svg";
import logoWhite from "@/assets/logos/logo-white.svg";
import ButtonOutlined from "@/components/custom-button/ButtonOutlined";
import { Drawer, useMediaQuery } from "@mui/material";
import Link from 'next/link';

const Header = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const isMobileView = useMediaQuery('(max-width:1028px)');

    const toggleDrawer = (open: boolean) => () => {
        setIsDrawerOpen(open);
    };

    return (
        <header className={styles.header}>
            <Image src={logo} alt="logo" width={132} height={30} />
            <div className={styles.nav}>
                <div className={styles.navLinks}>
                    <Link href="/#">Калькулятор</Link>
                    <Link href="/#">Предложить документ</Link>
                    <Link href="/#">Контакты</Link>
                    <Link href="/#">Частые вопросы</Link>
                </div>
                {isMobileView ? (
                    <ButtonOutlined onClick={toggleDrawer(true)}>
                        <Image src={burgerIcon} alt={"icon"} width={24} height={24} />
                    </ButtonOutlined>
                ) : (
                    <ButtonOutlined>
                        <Image src={whatsIcon} alt={"icon"} width={24} height={24} />
                        Whatsapp
                    </ButtonOutlined>
                )}
            </div>
            <Drawer
                anchor="top"
                open={isDrawerOpen}
                onClose={toggleDrawer(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: "#565add",
                    },
                }}>
                <div className={styles.drawerContent}>
                    <div className={styles.drawerContentHeader}>
                        <Image src={logoWhite} alt="logo" width={132} height={30} />
                        <ButtonOutlined white={true} onClick={toggleDrawer(false)}>
                            <Image src={burgerIconBlue} alt={"icon"} width={24} height={24} />
                        </ButtonOutlined>
                    </div>
                    <div className={styles.drawerContentLinks}>
                        <Link href="/#">Калькулятор</Link>
                        <Link href="/#">Предложить документ</Link>
                        <Link href="/#">Контакты</Link>
                        <Link href="/#">Частые вопросы</Link>
                    </div>
                    <ButtonOutlined white={true} sx={{width: "fit-content"}}>
                        <Image src={whatsIcon} alt={"icon"} width={24} height={24} />
                        Whatsapp
                    </ButtonOutlined>
                </div>
            </Drawer>
        </header>
    );
};

export default Header;