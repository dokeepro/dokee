"use client";

import React from 'react';
import logoFooter from "@/assets/logos/dokee-footer.svg";
import styles from "./Footer.module.scss"
import {MdOutlineKeyboardArrowUp} from "react-icons/md";
import {Button, IconButton, Link, Tooltip} from "@mui/material";
import {FaInstagram} from "react-icons/fa";
import {FaFacebookF} from "react-icons/fa";
import {BsTwitterX} from "react-icons/bs";
import Image from "next/image";

const Footer = () => {

    const scrollToSection = (id: string) => {
        if (id === "header") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            const section = document.getElementById(id);
            if (section) {
                section.scrollIntoView({ behavior: "smooth" });
            } else {
                console.error(`Element with id "${id}" not found.`);
            }
        }
    };

    return (
        <footer className={styles.footer} id="footer">
            <div className={styles.footerSection}>
                <Button onClick={() => scrollToSection("header")}
                    sx={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '20px',
                        backgroundColor: '#565add',
                        color: '#ffffff',
                        minWidth: '90px',
                        fontSize: '2rem',
                        '&:hover': {
                            backgroundColor: '#464acb',
                        },
                    }}>
                    <MdOutlineKeyboardArrowUp/>
                </Button>
                <div className={styles.footerLinksWrapper}>
                    <div className={styles.footerLinks}>
                        <button onClick={() => scrollToSection("calculator")}>Калькулятор</button>
                        <button onClick={() => scrollToSection("propose-document")}>Предложить документ</button>
                        <button onClick={() => scrollToSection("footer")}>Контакты</button>
                        <button onClick={() => scrollToSection("faq")}>Частые вопросы</button>
                    </div>
                    <div className={styles.footerLinks}>
                        <a href="tel:+380930560388">+ 380 0509517841</a>
                        <a href="mailto:dokee.pro@gmail.com">dokee@gmail.com</a>
                    </div>
                </div>
                <div className={styles.footerSocials}>
                    <Tooltip title="Instagram">
                        <IconButton component={Link} sx={{color: "#a7a9eb"}} href="#" color="primary">
                            <FaInstagram/>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Facebook">
                        <IconButton component={Link} sx={{color: "#a7a9eb"}} href="#" color="primary">
                            <FaFacebookF/>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Twitter">
                        <IconButton component={Link} sx={{color: "#a7a9eb"}} href="#" color="primary">
                            <BsTwitterX />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            <Image src={logoFooter} alt="logo footer" width={1440} height={340} className={styles.footerImage}/>
        </footer>
    );
};

export default Footer;