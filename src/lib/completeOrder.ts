import { list, del, put } from "@vercel/blob";
import { sendOrderData } from "@/lib/sendData";
import {
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHANNEL_ID,
    BLOB_PUBLIC_READ_WRITE_TOKEN,
} from "@/lib/env";

const BOT_TOKEN = TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = TELEGRAM_CHANNEL_ID;
const BLOB_TOKEN = BLOB_PUBLIC_READ_WRITE_TOKEN;

type FileEntry = { name: string; type: string; url: string };

export type OrderData = {
    orderReference: string;
    languagePair: string;
    tariff: string;
    totalValue: number;
    selectedDate?: string;
    samples: {
        docName?: string;
        sampleTitle?: string;
        fioLatin?: string;
        sealText?: string;
        stampText?: string;
        computedPrice?: number;
    }[];
    files: FileEntry[];
};

export async function loadOrderFromBlob(orderReference: string): Promise<OrderData | null> {
    for (let attempt = 0; attempt < 5; attempt++) {
        const { blobs } = await list({
            prefix: `orders/${orderReference}.json`,
            token: BLOB_TOKEN,
        });
        if (blobs.length) {
            const res = await fetch(blobs[0].url);
            if (res.ok) return res.json();
        }
        if (attempt < 4) await new Promise((r) => setTimeout(r, 2000));
    }
    return null;
}

export async function completeOrder(order: OrderData): Promise<{ ok: boolean; skipped?: boolean }> {
    // Idempotency claim: atomically create a lock blob. put() with allowOverwrite:false
    // throws if the lock already exists, so only the FIRST caller proceeds. Every other
    // trigger (the WayForPay webhook, the client check-payment-status fetch, repeated
    // logo reloads, stale localStorage from another device) is skipped — guaranteeing
    // exactly one Telegram delivery per order.
    let lockUrl: string;
    try {
        const lock = await put(`orders/${order.orderReference}.lock`, "1", {
            access: "public",
            addRandomSuffix: false,
            allowOverwrite: false,
            contentType: "text/plain",
            token: BLOB_TOKEN,
        });
        lockUrl = lock.url;
    } catch {
        console.log(`[complete-order] ${order.orderReference}: already claimed, skipping`);
        return { ok: true, skipped: true };
    }

    try {
        console.log(`[complete-order] starting for ${order.orderReference}, ${order.files.length} files`);

        let message = `<b>✅ Нова заявка на переклад (оплачено)</b>\n\n`;
        message += `<b>Замовлення №:</b> ${order.orderReference}\n`;
        message += `<b>Мовна пара:</b> ${order.languagePair}\n`;
        message += `<b>Тариф:</b> ${order.tariff}\n`;
        message += `<b>Загальна вартість:</b> ${order.totalValue} ₸\n`;

        for (const s of order.samples) {
            message += `\n<b>${s.docName || "Документ"}</b>\n`;
            message += `Назва: ${s.sampleTitle || "-"}\n`;
            message += `Вартість: ${s.computedPrice ?? "-"} ₸\n`;
            message += `ФІО латиницею: ${s.fioLatin || "-"}\n`;
            message += `Печатка: ${s.sealText || "-"}\n`;
            message += `Штамп: ${s.stampText || "-"}\n`;
        }

        if (order.selectedDate) {
            message += `\n<b>Обрана дата:</b> ${order.selectedDate}\n`;
        }

        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                text: message.trim(),
                parse_mode: "HTML",
                disable_web_page_preview: true,
            }),
        });
        console.log(`[complete-order] TG message: ${tgRes.status}`);
        if (!tgRes.ok) throw new Error(`sendMessage failed: ${tgRes.status}`);

        // Deliver every attached document. If ANY send fails, throw so the whole
        // order is retried later — we never delete the order until all docs landed.
        const sentFileUrls: string[] = [];
        for (const file of order.files) {
            if (!file.url) continue;

            const fileRes = await fetch(file.url);
            if (!fileRes.ok) throw new Error(`file download failed: ${file.name} ${fileRes.status}`);
            const buf = await fileRes.arrayBuffer();
            if (buf.byteLength < 50) continue;

            const blob = new Blob([buf], { type: file.type || "application/octet-stream" });
            const tgForm = new FormData();
            tgForm.append("chat_id", CHANNEL_ID);
            tgForm.append("caption", `📎 ${order.orderReference} — ${file.name}`);
            tgForm.append("document", blob, file.name);

            const docRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
                method: "POST",
                body: tgForm,
            });
            console.log(`[complete-order] TG file ${file.name}: ${docRes.status}`);
            if (!docRes.ok) throw new Error(`sendDocument failed: ${file.name} ${docRes.status}`);

            sentFileUrls.push(file.url);
        }

        // Everything delivered — now it's safe to clean up the order + file blobs.
        const blobUrlsToDelete = [...sentFileUrls];
        const { blobs: orderBlobs } = await list({ prefix: `orders/${order.orderReference}.json`, token: BLOB_TOKEN }).catch(() => ({ blobs: [] }));
        for (const b of orderBlobs) blobUrlsToDelete.push(b.url);
        if (blobUrlsToDelete.length) {
            await del(blobUrlsToDelete, { token: BLOB_TOKEN }).catch((err) =>
                console.error("[complete-order] cleanup error:", err),
            );
        }

        await sendOrderData({
            email: "dokee.pro@gmail.com",
            languagePair: order.languagePair,
            tariff: order.tariff,
            samples: order.samples,
            totalValue: order.totalValue,
            selectedDate: order.selectedDate,
        }).catch((err) => console.error("[complete-order] email error:", err));

        console.log(`[complete-order] ${order.orderReference}: done`);
        return { ok: true };
    } catch (err) {
        // Delivery failed after we claimed the lock. Release the lock and KEEP the
        // order + file blobs so the fallback path (client fetch) can redeliver.
        console.error(`[complete-order] ${order.orderReference} delivery failed, releasing lock:`, err);
        await del(lockUrl, { token: BLOB_TOKEN }).catch(() => {});
        return { ok: false };
    }
}
