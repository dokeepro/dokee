import React from 'react';
import styles from "./OfferDocument.module.scss";
import {Button, useMediaQuery} from "@mui/material";
import Image from "next/image";
import doc from "@/assets/icons/file-download.svg"
import { GrSend } from "react-icons/gr";

const OfferDocument = () => {

    const isMobileView = useMediaQuery('(max-width:768px)');

    return (
        <div className={styles.wrapper} id="propose-document">
            <div className={styles.titles}>
                <h1>Хотите <span>предложить</span></h1>
                <h1>ваш документ?</h1>
                <p>Мы регулярно обновляем список личных документов, доступных для перевода. Если вам часто требуется
                    перевод документов одного типа и его нет в нашем списке, отправьте его нам, мы рассмотрим
                    возможность добавления образца в сервис. Отправляйте только качественное фото или скан-копию,
                    это повлияет на принятие решения. В случае утверждения, документ появится в сервисе в течение 14
                    рабочих дней.</p>
            </div>
            <div className={styles.formSection}>
                <p>Загрузить документ</p>
                <form>
                    <div className={styles.dropArea}>
                        <Image src={doc} alt={"document"} width={120} height={120}/>
                        {isMobileView ? <p><a href="#">Загрузите</a>файлы в это окно</p> :
                            <p>Перетяните или<a href="#">загрузите</a>файлы в это окно</p>}
                    </div>
                    <Button
                        sx={{
                            backgroundColor: '#565add',
                            color: '#fff',
                            textTransform: 'none',
                            padding: '10px 20px',
                            borderRadius: '20px',
                            fontSize: "15px",
                            maxWidth: "207px",
                            margin: "0px auto",
                            gap: "10px",
                            '&:hover': {
                                backgroundColor: '#4343c9',
                            },
                        }}
                        endIcon={<GrSend/>}
                    >
                        Отправить
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default OfferDocument;