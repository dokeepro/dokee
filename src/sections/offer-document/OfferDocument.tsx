import React, { useRef, useState } from 'react';
import styles from "./OfferDocument.module.scss";
import { Button, useMediaQuery } from "@mui/material";
import Image from "next/image";
import doc from "@/assets/icons/file-download.svg";
import { GrSend } from "react-icons/gr";
import IconButton from '@mui/material/IconButton';
import { TiTimes } from "react-icons/ti";
import {newRequest} from "@/utils/newRequest";
import {useAlert} from "@/context/AlertContext";

const OfferDocument = () => {
    const isMobileView = useMediaQuery('(max-width:768px)');
    const [files, setFiles] = useState<File[]>([]);
    const {showAlert} = useAlert();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...droppedFiles]);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleSend = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });

        try {
            const res = await newRequest.post("/documents/new-request", formData);
            if (res.data?.success) {
                showAlert('Документ отправлен', 'success');
                setFiles([]);
                setTimeout(() => window.location.reload(), 1200);
            } else {
                showAlert('Ошибка при отправке', 'error');
            }
        } catch {
            showAlert('Ошибка при отправке', 'success');
        }
    };

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
                    <div
                        className={styles.dropArea}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={handleClick}
                        style={{ cursor: 'pointer' }}>
                        <Image src={doc} alt={"document"} width={120} height={120} />
                        {isMobileView
                            ? <p><span>Загрузите</span> файлы в это окно</p>
                            : <p>Перетяните или <span>загрузите</span> файлы в это окно</p>
                        }
                        <input
                            type="file"
                            multiple
                            ref={inputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileInput}
                        />
                        {files.length > 0 && (
                            <ol className={styles.uploadedList} style={{ paddingLeft: 20, margin: 0 }}>
                                {files.map((file, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, listStyle: 'decimal' }}>
                                        {idx + 1}. {file.name}
                                        <IconButton
                                            size="small"
                                            sx={{
                                                marginLeft: 1,
                                                color: '#fff',
                                                backgroundColor: '#f44336',
                                                '&:hover': { backgroundColor: '#d32f2f' },
                                                width: 24,
                                                height: 24,
                                            }}
                                            onClick={e => {
                                                e.stopPropagation();
                                                setFiles(prev => prev.filter((_, i) => i !== idx));
                                            }}
                                        >
                                            <TiTimes size={16} />
                                        </IconButton>
                                    </li>
                                ))}
                            </ol>
                        )}
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
                        endIcon={<GrSend />}
                        onClick={handleSend}
                    >
                        Отправить
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default OfferDocument;