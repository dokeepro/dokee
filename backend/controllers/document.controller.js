const Document = require('../models/document.model');
const { uploadImage } = require('../utils/uploadImage');
const sendEmail = require('../utils/sendEmail');
const General = require('../models/general.model');

const langMap = {
    'русский': 'ru',
    'украинский': 'uk',
    'английский': 'en',
    'немецкий': 'de',
    'польский': 'pl',
    'французский': 'fr',
    'итальянский': 'it',
    'испанский': 'es',
    'литовский': 'lt',
    'португальский': 'pt',
    'чешский': 'cz',
};

const createDocument = async (req, res) => {
    try {
        console.log('--- Incoming request to /create-document ---');
        console.log('req.body:', req.body);
        console.log('req.files:', req.files);
        const lastDoc = await Document.findOne().sort({ order: -1 });
        const order = lastDoc ? lastDoc.order + 1 : 1;
        const { name, languageTariffs, samples, documentCountry } = req.body;
        let parsedSamples = samples;
        let parsedLanguageTariffs = languageTariffs;
        if (typeof languageTariffs === 'string') {
            try {
                parsedLanguageTariffs = JSON.parse(languageTariffs);
                console.log('Parsed languageTariffs:', parsedLanguageTariffs);
            } catch (e) {
                console.log('Failed to parse languageTariffs:', e);
            }
        }
        if (typeof samples === 'string') {
            try {
                parsedSamples = JSON.parse(samples);
                console.log('Parsed samples:', parsedSamples);
            } catch (e) {
                console.log('Failed to parse samples:', e);
            }
        }
        if (req.files) {
            const sampleEntries = Object.entries(req.files).filter(([key]) => key.startsWith('samples'));
            if (sampleEntries.length > 0) {
                parsedSamples = [];
                for (const [key, file] of sampleEntries) {
                    const match = key.match(/samples\[(\d+)\]\[image\]/);
                    const idx = match ? Number(match[1]) : 0;
                    const titleKey = `samples[${idx}][title]`;
                    const title = req.body[titleKey] || `Sample ${idx}`;
                    const ext = file.name ? file.name.substring(file.name.lastIndexOf('.')) : '';
                    const fileName = `document-dokee-image-${order}-${idx + 1}${ext}`;
                    console.log(`Uploading sample image for sample #${idx}:`, fileName);
                    const imageUrl = await uploadImage(file, fileName);
                    parsedSamples.push({ title, imageUrl });
                }
                console.log('All sample images uploaded:', parsedSamples);
            } else if (req.files.sampleImage) {
                const file = req.files.sampleImage;
                const ext = file.name ? file.name.substring(file.name.lastIndexOf('.')) : '';
                const fileName = `document-dokee-image-${order}-1${ext}`;
                console.log('Uploading single sample image:', fileName);
                const imageUrl = await uploadImage(file, fileName);
                parsedSamples = [{ title: req.body.sampleTitle, imageUrl }];
            }
        }

        console.log('Final name:', name);
        console.log('Final languageTariffs:', parsedLanguageTariffs);
        console.log('Final samples:', parsedSamples);
        console.log('Final order:', order);

        const doc = new Document({ name, order, documentCountry, languageTariffs: parsedLanguageTariffs, samples: parsedSamples });
        await doc.save();
        console.log('Document saved:', doc);
        res.status(201).json(doc);
    } catch (err) {
        console.log('Error in createDocument:', err);
        res.status(500).json({ error: err.message });
    }
};

const getAllDocuments = async (req, res) => {
    try {
        const documents = await Document.find().sort({ order: 1 });
        res.status(200).json(documents);
    } catch (err) {
        console.log('Error in getAllDocuments:', err);
        res.status(500).json({ error: err.message });
    }
};

const initTariffsForSamples = async () => {
    try {
        const documents = await Document.find();
        for (const doc of documents) {
            if (Array.isArray(doc.samples) && Array.isArray(doc.languageTariffs)) {
                doc.samples = doc.samples.map(sample => ({
                    ...sample.toObject ? sample.toObject() : sample,
                    languageTariffs: doc.languageTariffs
                }));
                await doc.save();
                console.log(`Updated document ${doc._id} samples with languageTariffs`);
            }
        }
        console.log('All documents updated.');
    } catch (err) {
        console.error('Error in initTariffsForSamples:', err);
    }
};


const sendData = async (req, res) => {
    try {
        const { email, languagePair, tariff, totalValue, selectedDate } = req.body;
        let samples = req.body.samples;
        if (typeof samples === 'string') samples = JSON.parse(samples);

        const tariffKey = tariff ? tariff.toLowerCase() : 'normal';

        let slotField = '';
        if (tariffKey === 'normal') slotField = 'normalSlots';
        else if (tariffKey === 'express') slotField = 'expressSlots';
        else if (tariffKey === 'fast') slotField = 'fastSlots';

        if (slotField) {
            await General.findOneAndUpdate({}, { $inc: { [slotField]: -1 } });
        }

        let toLang = '';
        if (languagePair) {
            const parts = languagePair.split('-');
            toLang = parts[1] ? parts[1].trim().toLowerCase() : '';
            toLang = langMap[toLang] || toLang;
        }

        let html = `<h2>Новая заявка на перевод</h2>
        <p><b>Языковая пара:</b> ${languagePair}</p>
        <p><b>Тариф:</b> ${tariff}</p>
        <p><b>Общая стоимость:</b> ${totalValue} ₸</p>`;
        if (selectedDate) {
            html += `<p><b>Выбранная дата:</b> ${selectedDate}</p>`;
        }
        html += `<hr/>`;

        for (const sample of samples) {
            const doc = await Document.findOne({ name: sample.docName });
            let dbSample = null;
            let price = 0;
            if (doc) {
                dbSample = doc.samples.find(s => s.title === sample.sampleTitle);
                const tariffs = dbSample?.languageTariffs || doc.languageTariffs || [];
                const langTariff = tariffs.find(t => {
                    if (!t.language) return false;
                    const lang = t.language.toLowerCase();
                    if (lang.includes('_') || lang.includes('-')) {
                        return lang.split(/[_\s-]+/).includes(toLang);
                    }
                    return lang === toLang;
                });
                price = langTariff ? langTariff[tariffKey] || 0 : 0;
            }

            const baseName = sample.docName.replace(/\s*\(.*?\)/, '');
            const fullName = `${baseName}${sample.sampleTitle ? ` (${sample.sampleTitle})` : ''}`;

            html += `
                <h3>${baseName}</h3>
                <b>Документ</b>: ${fullName}<br/>
                <b>Языковая пара</b>: ${languagePair}<br/>
                <b>Тариф</b>: ${tariff}<br/>
                <b>Стоимость</b>: ${price}₸<br/>
                <b>ФИО латиницей</b>: ${sample.fioLatin || '-'}<br/>
                <b>Печать</b>: ${sample.sealText || '-'}<br/>
                <b>Штамп</b>: ${sample.stampText || '-'}<br/>
                <hr/>
            `;
        }

        const files = [];
        if (req.files) {
            const fileArray = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
            fileArray.forEach((file) => {
                const ext = file.name?.split('.').pop() || 'pdf';
                const randomId = Math.floor(100000 + Math.random() * 900000);
                files.push({
                    filename: `dokee-${randomId}.${ext}`,
                    content: file.data
                });
            });
        }

        await sendEmail(email, 'Новая заявка на перевод', '', files.length ? files : undefined, html);

        res.json({ success: true });
    } catch (err) {
        console.error('Error in sendData:', err);
        res.status(500).json({ error: err.message });
    }
};

const initRussianTariffForUaSamples = async () => {
    try {
        const documents = await Document.find({ documentCountry: 'ua' });
        for (const doc of documents) {
            let updated = false;
            if (Array.isArray(doc.samples)) {
                doc.samples.forEach(sample => {
                    if (Array.isArray(sample.languageTariffs)) {
                        sample.languageTariffs.forEach(tariff => {
                            if (tariff.language === 'русский') {
                                tariff.language = 'ru';
                                updated = true;
                            }
                        });
                    }
                });
            }
            if (updated) {
                await doc.save();
                console.log(`Updated document ${doc._id}: changed "русский" to "ru" in sample tariffs`);
            }
        }
        console.log('All UA documents processed.');
    } catch (err) {
        console.error('Error in initRussianTariffForUaSamples:', err);
    }
};

const updateSample = async (req, res) => {
    try {
        const { docId, sampleIdx } = req.params;
        const { title, languageTariffs } = req.body;
        const doc = await Document.findById(docId);
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        if (!doc.samples[sampleIdx]) return res.status(404).json({ error: 'Sample not found' });

        if (title !== undefined) doc.samples[sampleIdx].title = title;
        if (languageTariffs !== undefined) doc.samples[sampleIdx].languageTariffs = languageTariffs;

        await doc.save();
        res.json(doc.samples[sampleIdx]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createDocument,
    getAllDocuments,
    sendData,
    initTariffsForSamples,
    updateSample
};