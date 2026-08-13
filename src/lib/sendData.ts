import { dbConnect } from "@/lib/db";
import DocumentModel from "@/models/Document";
import GeneralModel from "@/models/General";
import { sendEmail, type MailAttachment } from "@/lib/sendEmail";

const langMap: Record<string, string> = {
    русский: "ru",
    украинский: "uk",
    английский: "en",
    немецкий: "de",
    польский: "pl",
    французский: "fr",
    итальянский: "it",
    испанский: "es",
    литовский: "lt",
    португальский: "pt",
    чешский: "cz",
};

export interface SendDataSample {
    docName?: string;
    sampleTitle?: string;
    fioLatin?: string;
    sealText?: string;
    stampText?: string;
}

export interface SendDataInput {
    email: string;
    languagePair?: string;
    tariff?: string;
    totalValue?: number | string;
    selectedDate?: string;
    samples: SendDataSample[];
    files?: MailAttachment[];
}

export async function sendOrderData(input: SendDataInput): Promise<void> {
    const { email, languagePair, tariff, totalValue, selectedDate, samples, files = [] } = input;

    await dbConnect();

    const tariffKey = tariff ? tariff.toLowerCase() : "normal";

    let slotField = "";
    if (tariffKey === "normal") slotField = "normalSlots";
    else if (tariffKey === "express") slotField = "expressSlots";
    else if (tariffKey === "fast") slotField = "fastSlots";

    if (slotField) {
        await GeneralModel.findOneAndUpdate({}, { $inc: { [slotField]: -1 } });
    }

    let toLang = "";
    if (languagePair) {
        const parts = languagePair.split("-");
        toLang = parts[1] ? parts[1].trim().toLowerCase() : "";
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

    const docNames = [...new Set(samples.map((s) => s.docName))];
    const docs = await DocumentModel.find({ name: { $in: docNames } }).lean();
    const docMap = Object.fromEntries(docs.map((d) => [d.name, d]));

    for (const sample of samples) {
        const doc = sample.docName ? docMap[sample.docName] : undefined;
        let price: number = 0;
        if (doc) {
            const dbSample = doc.samples.find((s) => s.title === sample.sampleTitle);
            const tariffs = dbSample?.languageTariffs || doc.languageTariffs || [];
            const matchLang = (iso: string) => tariffs.find((t) => {
                if (!t.language) return false;
                const lang = t.language.toLowerCase();
                if (lang.includes("_") || lang.includes("-")) {
                    return lang.split(/[_\s-]+/).includes(iso);
                }
                return lang === iso;
            });
            const key = tariffKey as "normal" | "express" | "fast";
            let langTariff = matchLang(toLang);
            // UA orders are uk→ru; fall back to the uk tariff when ru is missing/0.
            if ((!langTariff || ((langTariff[key] as number) || 0) === 0) && toLang === "ru") {
                langTariff = matchLang("uk");
            }
            price = langTariff ? (langTariff[key] as number) || 0 : 0;
        }

        const baseName = (sample.docName || "").replace(/\s*\(.*?\)/, "");
        const fullName = `${baseName}${sample.sampleTitle ? ` (${sample.sampleTitle})` : ""}`;

        html += `
            <h3>${baseName}</h3>
            <b>Документ</b>: ${fullName}<br/>
            <b>Языковая пара</b>: ${languagePair}<br/>
            <b>Тариф</b>: ${tariff}<br/>
            <b>Стоимость</b>: ${price}₸<br/>
            <b>ФИО латиницей</b>: ${sample.fioLatin || "-"}<br/>
            <b>Печать</b>: ${sample.sealText || "-"}<br/>
            <b>Штамп</b>: ${sample.stampText || "-"}<br/>
            <hr/>
        `;
    }

    await sendEmail(email, "Новая заявка на перевод", "", files.length ? files : [], html);
}
