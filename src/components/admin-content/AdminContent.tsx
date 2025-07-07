import React, {useState} from 'react';
import styles from "./AdminContent.module.scss";
import {DialogActions, FormControl, InputLabel, MenuItem, Select, Stack, Switch, TextField } from '@mui/material';
import ButtonOutlined from '../custom-button/ButtonOutlined';
import { useGeneral } from "@/context/GeneralContext";
import { newRequest } from '@/utils/newRequest';
import { useAlert } from "@/context/AlertContext";
import { Formik, Form } from 'formik';
import Dialog from "@mui/material/Dialog";
import Separator from '../separator/Separator';
import {FaTengeSign} from "react-icons/fa6";
import {HiOutlineDocumentAdd} from "react-icons/hi";
import {FiImage} from "react-icons/fi";
import Image from "next/image";

interface LanguageTariff {
    language: string;
    normal: number;
    express: number;
    fast: number;
    _id?: string;
}

interface Sample {
    title: string;
    languageTariffs?: LanguageTariff[];
    imageUrl?: string;
}

const languageOptions = [
    { label: 'Украинский', value: 'uk' },
    { label: 'Английский', value: 'en' },
    { label: 'Немецкий', value: 'de' },
    { label: 'Французский/Итальянский/Испанский', value: 'fr_it_es' },
    { label: 'Польский/Чешский', value: 'pl_cz' },
    { label: 'Литовский/Португальский', value: 'lt_pt' },
];

const AdminContent = () => {
    const { general, documents } = useGeneral();
    const { showAlert } = useAlert();
    const [open, setOpen] = useState(false);
    const [docName, setDocName] = useState('');
    const [samples, setSamples] = useState<{ title: string, imageFile: File, imageUrl?: string }[]>([]);
    const [documentCountry, setDocumentCountry] = useState<'ua' | 'kz'>('ua');
    const [sampleDialogOpen, setSampleDialogOpen] = useState(false);
    const [sampleTitle, setSampleTitle] = useState('');
    const [sampleImage, setSampleImage] = useState<File | null>(null);
    const [samplePreview, setSamplePreview] = useState<string | null>(null);
    const [tariffs, setTariffs] = useState<{ [key: string]: { normal: string, express: string, fast: string } }>(
        Object.fromEntries(languageOptions.map(opt => [opt.value, { normal: '', express: '', fast: '' }]))
    );

    const [editSampleDialogOpen, setEditSampleDialogOpen] = useState(false);
    const [editingSample, setEditingSample] = useState<{
        docId: string;
        sampleIdx: number;
        sample: Sample;
    } | null>(null);

    const handleEditSample = (docId: string, sampleIdx: number, sample: Sample) => {
        setEditingSample({ docId, sampleIdx, sample: { ...sample } });
        setEditSampleDialogOpen(true);
    };

    const handleEditSampleTariffChange = (
        lang: string,
        field: keyof Omit<LanguageTariff, 'language' | '_id'>,
        value: string
    ) => {
        if (editingSample) {
            const tariffs = (editingSample.sample.languageTariffs ?? []).map((t) =>
                t.language === lang ? { ...t, [field]: Number(value) } : t
            );
            setEditingSample({
                ...editingSample,
                sample: { ...editingSample.sample, languageTariffs: tariffs }
            });
        }
    };

    const handleEditSampleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingSample) {
            setEditingSample({
                ...editingSample,
                sample: { ...editingSample.sample, title: e.target.value }
            });
        }
    };

    const handleSaveEditedSample = async () => {
        if (!editingSample) return;
        await newRequest.patch(`/documents/${editingSample.docId}/samples/${editingSample.sampleIdx}`, {
            title: editingSample.sample.title,
            languageTariffs: editingSample.sample.languageTariffs,
        });
        showAlert('Образец успешно изменен', 'success');
        setEditSampleDialogOpen(false);
        setEditingSample(null);
    };

    const initialValues = {
        sitePaused: general?.sitePaused || false,
        normalSlots: general?.normalSlots || '',
        expressSlots: general?.expressSlots || '',
        fastSlots: general?.fastSlots || '',
    };

    const handleSampleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSampleImage(e.target.files[0]);
            setSamplePreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleAddSample = () => {
        if (sampleTitle && sampleImage) {
            setSamples([...samples, { title: sampleTitle, imageFile: sampleImage }]);
            setSampleTitle('');
            setSampleImage(null);
            setSamplePreview(null);
            setSampleDialogOpen(false);
        }
    };
    const handleTariffChange = (lang: string, field: string, value: string) => {
        setTariffs(prev => ({
            ...prev,
            [lang]: { ...prev[lang], [field]: value }
        }));
    };
    const handleSaveDocument = async () => {
        try {
            const tariffsArr = languageOptions.map(opt => ({
                language: opt.value,
                normal: Number(tariffs[opt.value].normal) || 0,
                express: Number(tariffs[opt.value].express) || 0,
                fast: Number(tariffs[opt.value].fast) || 0,
            }));

            const formData = new FormData();
            formData.append('name', docName);
            formData.append('documentCountry', documentCountry);
            formData.append('order', Date.now().toString()); // or your logic for order
            formData.append('languageTariffs', JSON.stringify(tariffsArr));
            samples.forEach((sample, idx) => {
                formData.append(`samples[${idx}][title]`, sample.title);
                formData.append(`samples[${idx}][image]`, sample.imageFile);
            });

            await newRequest.post('/documents/create-document', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showAlert('Документ успешно добавлен', 'success');
            setOpen(false);
            setDocName('');
            setSamples([]);
            setTariffs(Object.fromEntries(languageOptions.map(opt => [opt.value, { normal: '', express: '', fast: '' }])));
        } catch {
            showAlert('Ошибка при добавлении документа', 'error');
        }
    };

    const handleSubmit = async (
        values: typeof initialValues,
        { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
    ) => {
        try {
            await newRequest.put('/general-settings/update-general', {
                sitePaused: values.sitePaused,
                normalSlots: Number(values.normalSlots),
                expressSlots: Number(values.expressSlots),
                fastSlots: Number(values.fastSlots),
            });
            showAlert('Изменения успешно сохранены', 'success');
        } catch {
            showAlert('Ошибка при сохранении', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const langCodeToName: Record<string, string> = {
        en: 'Английский',
        de: 'Немецкий',
        fr: 'Французский',
        it: 'Итальянский',
        es: 'Испанский',
        pl: 'Польский',
        cz: 'Чешский',
        ru: 'Русский',
        uk: 'Украинский',
        lt: 'Литовский',
        pt: 'Португальский',
        'fr_it_es': 'Французский/Итальянский/Испанский',
        'pl_cz': 'Польский/Чешский',
        'lt_pt': 'Литовский/Португальский',
    };

    return (
        <Formik initialValues={initialValues} enableReinitialize onSubmit={handleSubmit}>
            {({ values, handleChange, setFieldValue, isSubmitting }) => (
                <Form>
                    <Dialog open={editSampleDialogOpen} onClose={() => setEditSampleDialogOpen(false)}>
                        <div className={styles.sampleEditContent}>
                            <Separator title="Изменить Образец" description="Тут вы сможете изменить заголовок образца и его цены" />
                            <TextField
                                label="Заголовок"
                                value={editingSample?.sample.title || ''}
                                onChange={handleEditSampleTitleChange}
                                fullWidth
                                style={{ marginTop: 16 }}
                            />
                            {editingSample?.sample.languageTariffs?.map(
                                (tariff: {
                                    language: string;
                                    normal: number;
                                    express: number;
                                    fast: number;
                                    _id?: string;
                                }) => (
                                    <div key={tariff.language} style={{ marginBottom: 12 }}>
                                        <Separator
                                            title={langCodeToName[tariff.language] || tariff.language}
                                            description="Тарифы для этого языка"
                                        />
                                        <div className={styles.flex}>
                                            <TextField
                                                label="Normal"
                                                type="number"
                                                value={tariff.normal}
                                                onChange={e =>
                                                    handleEditSampleTariffChange(
                                                        tariff.language,
                                                        'normal',
                                                        e.target.value
                                                    )
                                                }
                                                style={{ marginRight: 8 }}
                                            />
                                            <TextField
                                                label="Express"
                                                type="number"
                                                value={tariff.express}
                                                onChange={e =>
                                                    handleEditSampleTariffChange(
                                                        tariff.language,
                                                        'express',
                                                        e.target.value
                                                    )
                                                }
                                                style={{ marginRight: 8 }}
                                            />
                                            <TextField
                                                label="Fast"
                                                type="number"
                                                value={tariff.fast}
                                                onChange={e =>
                                                    handleEditSampleTariffChange(
                                                        tariff.language,
                                                        'fast',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                )
                            )}
                            <DialogActions>
                                <ButtonOutlined onClick={() => setEditSampleDialogOpen(false)} white>
                                    Отменить
                                </ButtonOutlined>
                                <ButtonOutlined variant="contained" onClick={handleSaveEditedSample}>
                                    Сохранить
                                </ButtonOutlined>
                            </DialogActions>
                        </div>
                    </Dialog>
                    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                        <div className={styles.dialogContent}>
                            <Separator title="Добавить документ" description="Пожалуйста, заполните ниже все данные" />
                            <Stack spacing={2}>
                                <TextField
                                    label="Название документа"
                                    value={docName}
                                    onChange={e => setDocName(e.target.value)}
                                    fullWidth
                                />
                                <Separator title="Документ для страны" description="Укажите для какой страны документ" />
                                <FormControl fullWidth>
                                    <InputLabel id="country-label">Страна</InputLabel>
                                    <Select
                                        labelId="country-label"
                                        value={documentCountry}
                                        label="Страна"
                                        onChange={e => setDocumentCountry(e.target.value as 'ua' | 'kz')}
                                    >
                                        <MenuItem value="ua">Украина</MenuItem>
                                        <MenuItem value="kz">Казахстан</MenuItem>
                                    </Select>
                                </FormControl>
                                <div className={styles.tariffsContent}>
                                    <Separator title="Цены за языки для перевода" description="Пожалуйста, заполните ниже все данные" />
                                    {languageOptions.map((lang) => (
                                        <div key={lang.value} className={styles.langTariff}>
                                            <Separator title={lang.label} description="Цены по тарифам за конкретный язык" />
                                            <div className={styles.inputs}>
                                                <TextField
                                                    label="Normal"
                                                    type="number"
                                                    value={tariffs[lang.value].normal}
                                                    onChange={e => handleTariffChange(lang.value, 'normal', e.target.value)}
                                                    fullWidth
                                                    InputProps={{ endAdornment: <FaTengeSign style={{ marginLeft: 4, color: '#888' }} /> }}
                                                />
                                                <TextField
                                                    label="Express"
                                                    type="number"
                                                    value={tariffs[lang.value].express}
                                                    onChange={e => handleTariffChange(lang.value, 'express', e.target.value)}
                                                    fullWidth
                                                    InputProps={{ endAdornment: <FaTengeSign style={{ marginLeft: 4, color: '#888' }} /> }}
                                                />
                                                <TextField
                                                    label="Fast"
                                                    type="number"
                                                    value={tariffs[lang.value].fast}
                                                    onChange={e => handleTariffChange(lang.value, 'fast', e.target.value)}
                                                    fullWidth
                                                    InputProps={{ endAdornment: <FaTengeSign style={{ marginLeft: 4, color: '#888' }} /> }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <ButtonOutlined variant="outlined" startIcon={<HiOutlineDocumentAdd />} onClick={() => setSampleDialogOpen(true)}>
                                    Добавить образец
                                </ButtonOutlined>
                                {samples.length > 0 && (
                                    <div>
                                        <Separator title="Образцы" />
                                        <Stack direction="row" spacing={2}>
                                            {samples.map((sample, idx) => (
                                                <div key={idx} style={{ textAlign: 'center' }}>
                                                    <div>{sample.title}</div>
                                                    <Image src={URL.createObjectURL(sample.imageFile)} alt={sample.title} style={{ maxWidth: 120, marginTop: 8 }} />
                                                </div>
                                            ))}
                                        </Stack>
                                    </div>
                                )}
                            </Stack>
                            <DialogActions>
                                <ButtonOutlined white onClick={() => setOpen(false)}>Отмена</ButtonOutlined>
                                <ButtonOutlined variant="contained" onClick={handleSaveDocument}>Сохранить</ButtonOutlined>
                            </DialogActions>
                        </div>
                    </Dialog>
                    <Dialog open={sampleDialogOpen} onClose={() => setSampleDialogOpen(false)}>
                        <div className={styles.sampleImageWrapper}>
                            <Separator title="Добавить образец" description="Для добавления образца нужно добавить картинку и название" />
                            <TextField label="Название образца" value={sampleTitle} onChange={e => setSampleTitle(e.target.value)} fullWidth />
                            <ButtonOutlined variant="outlined" component="label" fullWidth startIcon={<FiImage />}>
                                Загрузить изображение
                                <input type="file" accept="image/*" hidden onChange={handleSampleImageChange} />
                            </ButtonOutlined>
                            {samplePreview && <Image src={samplePreview} alt="preview" style={{ maxWidth: 120, marginTop: 8 }} />}
                        </div>
                        <DialogActions>
                            <ButtonOutlined white onClick={() => setSampleDialogOpen(false)}>Отмена</ButtonOutlined>
                            <ButtonOutlined variant="contained" onClick={handleAddSample} disabled={!sampleTitle || !sampleImage}>Сохранить</ButtonOutlined>
                        </DialogActions>
                    </Dialog>
                    <div className={styles.wrapper}>
                        <div className={styles.absoluteButton}>
                            <ButtonOutlined loading={isSubmitting} type="submit" disabled={isSubmitting}>
                                Сохранить изменения
                            </ButtonOutlined>
                        </div>
                        <div className={styles.mainHeading}>
                            <h2>Админ-панель</h2>
                            <p>Управляйте доступом в любой момент</p>
                            <hr/>
                        </div>
                        <div className={styles.switchWrapper}>
                            <h2>Блок с управлением показа вебсайта</h2>
                            <p>Когда сайт на паузе, пользователи не будут иметь возможности загрузить документы</p>
                            <hr/>
                            <div className={styles.switch}>
                                <h4>{values.sitePaused ? 'Убрать с паузы' : 'Поставить сайт на паузу'}</h4>
                                <Switch
                                    checked={values.sitePaused}
                                    onChange={e => setFieldValue('sitePaused', e.target.checked)}
                                    color="primary"
                                />
                            </div>
                        </div>
                        <div className={styles.selectorWrapper}>
                            <h2>Блок с управлением тарифов</h2>
                            <p>Управление доступных слотов для тарифов</p>
                            <hr/>
                            <div className={styles.selectors}>
                                <div className={styles.tariffInputs}>
                                    <TextField
                                        label="Normal Slots"
                                        type="number"
                                        name="normalSlots"
                                        value={values.normalSlots}
                                        onChange={handleChange}
                                        fullWidth
                                    />
                                </div>
                                <div className={styles.tariffInputs}>
                                    <TextField
                                        label="Express Slots"
                                        type="number"
                                        name="expressSlots"
                                        value={values.expressSlots}
                                        onChange={handleChange}
                                        fullWidth
                                    />
                                </div>
                                <div className={styles.tariffInputs}>
                                    <TextField
                                        label="Fast Slots"
                                        type="number"
                                        name="fastSlots"
                                        value={values.fastSlots}
                                        onChange={handleChange}
                                        fullWidth
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.selectorWrapper}>
                            <h2>Добавить документ</h2>
                            <p>Здесь вы можете добавить новый документ в систему. Просто введите название и загрузите
                                файл.</p>
                            <hr/>
                            <ButtonOutlined variant="outlined" onClick={() => setOpen(true)}>
                                Добавить документ
                            </ButtonOutlined>
                        </div>
                        <div className={styles.selectorWrapper}>
                            {documents.length === 0 ? (
                                <div>Пока нету документов</div>
                            ) : (
                                <>
                                    <Separator title="Документы для Украины" description="Документы, относящиеся к Украине" />
                                    <div className={styles.documentsList}>
                                        {documents.filter(doc => doc.documentCountry === 'ua').length === 0 ? (
                                            <div>Нет документов для Украины</div>
                                        ) : (
                                            documents.filter(doc => doc.documentCountry === 'ua').map(doc => (
                                                <div key={doc._id} className={styles.documentCard}>
                                                    <h3>{doc.name} <span className={styles.order}>#{doc.order}</span></h3>
                                                    <div className={styles.samplesBlock}>
                                                        <strong>Образцы:</strong>
                                                        <div className={styles.samplesList}>
                                                            {doc.samples.map((sample, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className={styles.sampleCard}
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => handleEditSample(doc._id, idx, sample)}
                                                                >
                                                                    <Image src={sample.imageUrl || ""} alt={sample.title} width={100} height={100} className={styles.sampleImage}/>
                                                                    <div>
                                                                        {sample.title.length > 10 ? sample.title.slice(0, 10) + '...' : sample.title}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <Separator title="Документы для Казахстана" description="Документы, относящиеся к Казахстану" />
                                    <div className={styles.documentsList}>
                                        {documents.filter(doc => doc.documentCountry === 'kz').length === 0 ? (
                                            <div>Нет документов для Казахстана</div>
                                        ) : (
                                            documents.filter(doc => doc.documentCountry === 'kz').map(doc => (
                                                <div key={doc._id} className={styles.documentCard}>
                                                    <h3>{doc.name} <span className={styles.order}>#{doc.order}</span></h3>
                                                    <div className={styles.samplesBlock}>
                                                        <strong>Образцы:</strong>
                                                        <div className={styles.samplesList}>
                                                            {doc.samples.map((sample, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className={styles.sampleCard}
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => handleEditSample(doc._id, idx, sample)}
                                                                >
                                                                    <Image src={sample.imageUrl || ""} alt={sample.title} width={100} height={100}
                                                                           className={styles.sampleImage}/>
                                                                    <div>{sample.title}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default AdminContent;