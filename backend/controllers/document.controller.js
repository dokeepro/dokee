const Document = require('../models/document.model');
const PendingOrder = require('../models/pendingOrder.model');
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
        const lastDoc = await Document.findOne().sort({ order: -1 });
        const order = lastDoc ? lastDoc.order + 1 : 1;

        const { name, languageTariffs, samples, documentCountry } = req.body;

        let parsedLanguageTariffs = [];
        let parsedSamples = [];

        // Parse tariffs
        if (typeof languageTariffs === 'string') {
            try {
                parsedLanguageTariffs = JSON.parse(languageTariffs);
            } catch (e) {
                console.error('Failed to parse languageTariffs:', e);
            }
        } else if (Array.isArray(languageTariffs)) {
            parsedLanguageTariffs = languageTariffs;
        }

        // Parse samples
        if (typeof samples === 'string') {
            try {
                parsedSamples = JSON.parse(samples);
            } catch (e) {
                console.error('Failed to parse samples:', e);
            }
        }

        // Upload images for samples (if present)
        if (req.files) {
            const sampleEntries = Object.entries(req.files).filter(([key]) =>
                key.startsWith('samples')
            );

            if (sampleEntries.length > 0) {
                parsedSamples = [];
                for (const [key, file] of sampleEntries) {
                    const match = key.match(/samples\[(\d+)\]\[image\]/);
                    const idx = match ? Number(match[1]) : 0;
                    const titleKey = `samples[${idx}][title]`;
                    const title = req.body[titleKey] || `Sample ${idx + 1}`;
                    const ext = file.name ? file.name.substring(file.name.lastIndexOf('.')) : '';
                    const fileName = `document-dokee-image-${order}-${idx + 1}${ext}`;
                    const imageUrl = await uploadImage(file, fileName);
                    parsedSamples.push({ title, imageUrl });
                }
            } else if (req.files.sampleImage) {
                const file = req.files.sampleImage;
                const ext = file.name ? file.name.substring(file.name.lastIndexOf('.')) : '';
                const fileName = `document-dokee-image-${order}-1${ext}`;
                const imageUrl = await uploadImage(file, fileName);
                parsedSamples = [{ title: req.body.sampleTitle, imageUrl }];
            }
        }

        // Inject tariffs into each sample
        const samplesWithTariffs = (parsedSamples || []).map(sample => ({
            ...sample,
            languageTariffs: parsedLanguageTariffs || []
        }));

        // Save document
        const doc = new Document({
            name,
            order,
            documentCountry,
            languageTariffs: parsedLanguageTariffs,
            samples: samplesWithTariffs
        });

        await doc.save();
        res.status(201).json(doc);
    } catch (err) {
        console.error('Error in createDocument:', err);
        res.status(500).json({ error: err.message });
    }
};


const getAllDocuments = async (req, res) => {
    try {
        const documents = await Document.find().sort({ order: 1 });
        res.status(200).json(documents);
    } catch (err) {
        console.error('Error in getAllDocuments:', err);
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
            }
        }
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

        const files = [];
        if (req.files) {
            const fileArray = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
            fileArray.forEach((file) => {
                const ext = file.name?.split('.').pop() || 'pdf';
                const randomId = Math.floor(100000 + Math.random() * 900000);
                files.push({
                    filename: `dokee-${randomId}.${ext}`,
                    content: Buffer.from(file.data)
                });
            });
        }

        // Respond immediately — payment gateway and client must not wait for email
        res.json({ success: true });

        // Build email HTML and send in the background
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

        const docNames = [...new Set(samples.map(s => s.docName))];
        const docs = await Document.find({ name: { $in: docNames } });
        const docMap = Object.fromEntries(docs.map(d => [d.name, d]));

        for (const sample of samples) {
            const doc = docMap[sample.docName];
            let price = 0;
            if (doc) {
                const dbSample = doc.samples.find(s => s.title === sample.sampleTitle);
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

        await sendEmail(email, 'Новая заявка на перевод', '', files.length ? files : undefined, html);
    } catch (err) {
        console.error('Error in sendData:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
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
            }
        }
    } catch (err) {
        console.error('Error in initRussianTariffForUaSamples:', err);
    }
};

const updateSample = async (req, res) => {
    try {
        const { docId, sampleIdx } = req.params;
        const doc = await Document.findById(docId);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const sampleIndex = parseInt(sampleIdx, 10);
        if (isNaN(sampleIndex) || sampleIndex < 0 || sampleIndex >= doc.samples.length) {
            return res.status(400).json({ error: 'Invalid sample index' });
        }

        const sample = doc.samples[sampleIndex];

        // Обновление текста
        const { title, languageTariffs, removeImage } = req.body;
        if (title !== undefined) sample.title = title;
        if (languageTariffs !== undefined) {
            sample.languageTariffs = Array.isArray(languageTariffs)
                ? languageTariffs
                : JSON.parse(languageTariffs);
        }

        // Замена изображения
        if (req.files && req.files.image) {
            const ext = req.files.image.name ? req.files.image.name.split('.').pop() : 'jpg';
            const fileName = `document-sample-${docId}-${sampleIndex}.${ext}`;
            const imageUrl = await uploadImage(req.files.image, fileName);
            sample.imageUrl = imageUrl;
        }

        // Удаление изображения
        if (removeImage === 'true') {
            sample.imageUrl = '';
        }

        await doc.save();
        res.json(sample);
    } catch (err) {
        console.error('updateSample error:', err);
        res.status(500).json({ error: err.message });
    }
};

const newRequest = async (req, res) => {
    try {
        const files = [];
        if (req.files) {
            const fileArray = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
            fileArray.forEach((file) => {
                const ext = file.name?.split('.').pop() || 'pdf';
                const randomId = Math.floor(100000 + Math.random() * 900000);
                files.push({
                    filename: `offer-document-${randomId}.${ext}`,
                    content: file.data
                });
            });
        }

        const html = `<h2>Предложение на перевод документа</h2>
                      <p>Документ прикреплённый ниже</p>`;

        await sendEmail(
            "yaroslav7v@gmail.com",
            "Предложение на перевод документа",
            "",
            files.length ? files : undefined,
            html
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Error in newRequest:', err);
        res.status(500).json({ error: err.message });
    }
};

const savePendingOrder = async (req, res) => {
    try {
        const { orderReference, languagePair, tariff, totalValue, selectedDate, samples, files } = req.body;

        await PendingOrder.findOneAndUpdate(
            { orderReference },
            { orderReference, languagePair, tariff, totalValue, selectedDate, samples, files, status: 'pending' },
            { upsert: true, new: true }
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Error in savePendingOrder:', err);
        res.status(500).json({ error: err.message });
    }
};

const claimPendingOrder = async (req, res) => {
    try {
        const { orderRef } = req.params;

        const order = await PendingOrder.findOneAndUpdate(
            { orderReference: orderRef, status: 'pending' },
            { $set: { status: 'processing' } },
            { new: true }
        );

        if (!order) {
            const existing = await PendingOrder.findOne({ orderReference: orderRef });
            if (existing) {
                return res.json({ success: true, alreadyProcessed: true, status: existing.status });
            }
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ success: true, order });
    } catch (err) {
        console.error('Error in claimPendingOrder:', err);
        res.status(500).json({ error: err.message });
    }
};

const markOrderCompleted = async (req, res) => {
    try {
        const { orderRef } = req.params;

        await PendingOrder.findOneAndUpdate(
            { orderReference: orderRef },
            { $set: { status: 'completed' } }
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Error in markOrderCompleted:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createDocument,
    getAllDocuments,
    sendData,
    initTariffsForSamples,
    updateSample,
    newRequest,
    savePendingOrder,
    claimPendingOrder,
    markOrderCompleted,
};