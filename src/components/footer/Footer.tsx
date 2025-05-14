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
    return (
        <footer className={styles.footer}>
            <div className={styles.footerSection}>
                <Button
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
                    }}
                >
                    <MdOutlineKeyboardArrowUp/>
                </Button>
                <div className={styles.footerLinks}>
                    <Link href="#">Калькулятор</Link>
                    <Link href="#">Предложить документ</Link>
                    <Link href="#">Контакты</Link>
                    <Link href="#">Частые вопросы</Link>
                </div>
                <div className={styles.footerLinks}>
                    <Link href="#">+ 380 0509517841</Link>
                    <Link href="#">dokee@gmail.com</Link>
                </div>
                <div>
                    <Tooltip title="Instagram">
                        <IconButton component={Link} sx={{color: "#a7a9eb"}} href="#" color="primary">
                            <FaInstagram />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Facebook">
                        <IconButton component={Link} sx={{color: "#a7a9eb"}} href="#" color="primary">
                            <FaFacebookF />
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