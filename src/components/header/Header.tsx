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
import { usePathname } from 'next/navigation';

const Header = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const isMobileView = useMediaQuery('(max-width:1028px)');

    const pathname = usePathname();

    if (pathname === '/admin') {
        return null;
    }

    const toggleDrawer = (open: boolean) => () => {
        setIsDrawerOpen(open);
    };

    const scrollToSection = (id: string) => {
        if (id === "header") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            const section = document.getElementById(id);
            if (section) {
                const offset = id === "footer" ? 0 : window.innerHeight * 0.2;
                const top = id === "footer"
                    ? document.body.scrollHeight - window.innerHeight
                    : section.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: "smooth" });
                setIsDrawerOpen(false)
            } else {
                console.error(`Element with id "${id}" not found.`);
            }
        }
    };

    return (
        <header className={styles.header} id="header">
            <Link href="/">
                <Image src={logo} alt="logo" width={132} height={30}/>
            </Link>
            <div className={styles.nav}>
                <div className={styles.navLinks}>
                    <button onClick={() => scrollToSection("calculator")}>Калькулятор</button>
                    <button onClick={() => scrollToSection("propose-document")}>Предложить документ</button>
                    <button onClick={() => scrollToSection("footer")}>Контакты</button>
                    <button onClick={() => scrollToSection("faq")}>Частые вопросы</button>
                </div>
                {isMobileView ? (
                    <ButtonOutlined onClick={toggleDrawer(true)}>
                        <Image src={burgerIcon} alt={"icon"} width={24} height={24}/>
                    </ButtonOutlined>
                ) : (
                    <ButtonOutlined
                        onClick={() => window.open("https://wa.me/+380972796855", "_blank")}>
                        <Image src={whatsIcon} alt={"icon"} width={24} height={24}/>
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
                        <Image src={logoWhite} alt="logo" width={132} height={30}/>
                        <ButtonOutlined white={true} onClick={toggleDrawer(false)}>
                            <Image src={burgerIconBlue} alt={"icon"} width={24} height={24}/>
                        </ButtonOutlined>
                    </div>
                    <div className={styles.drawerContentLinks}>
                        <button onClick={() => scrollToSection("calculator")}>Калькулятор</button>
                        <button onClick={() => scrollToSection("propose-document")}>Предложить документ</button>
                        <button onClick={() => scrollToSection("footer")}>Контакты</button>
                        <button onClick={() => scrollToSection("faq")}>Частые вопросы</button>
                    </div>
                    <ButtonOutlined
                        white={true}
                        sx={{width: "fit-content"}}
                        onClick={() => window.open("https://wa.me/+380972796855", "_blank")}>
                        <Image src={whatsIcon} alt={"icon"} width={24} height={24}/>
                        Whatsapp
                    </ButtonOutlined>
                </div>
            </Drawer>
        </header>
    );
};

export default Header;