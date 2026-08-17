// TEMPORARY: hardcoded secrets so production keeps working until the Vercel
// env vars are added. process.env still takes precedence when present.
// TODO: once the env vars are set on Vercel, delete the string fallbacks below.

export const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb+srv://yaroslavtsarenko:qlKClTLv1d7rUCOR@allshipai-db.zrjqe.mongodb.net/?retryWrites=true&w=majority&appName=allshipai-db";

export const BLOB_PUBLIC_READ_WRITE_TOKEN =
    process.env.BLOB_PUBLIC_READ_WRITE_TOKEN ||
    "vercel_blob_rw_NsLhVj6umEp1NlvV_g0TfFThYGi4vPmyTR2nLPJ1n3DxfD5";

export const TELEGRAM_BOT_TOKEN =
    process.env.TELEGRAM_BOT_TOKEN ||
    "8171381275:AAH150hTsYri0oX5nmg6Rm_0vYUcojB-g3o";

export const TELEGRAM_CHANNEL_ID =
    process.env.TELEGRAM_CHANNEL_ID || "-1003173238659";

export const WAYFORPAY_SECRET_KEY =
    process.env.WAYFORPAY_MERCHANT_SECRET_KEY ||
    process.env.WAYFORPAY_SECRET_KEY ||
    process.env.NEXT_PUBLIC_WAYFORPAY_MERCHANT_SECRET_KEY ||
    "43f8ec5981329304f612662659733c518739b69c";
