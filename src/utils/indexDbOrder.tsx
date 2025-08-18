import { openDB } from 'idb';

const DB_NAME = 'WayforpayOrderDB';
const STORE_NAME = 'orders';

export async function saveOrderData<T>(key: string, data: T) {
    const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
            db.createObjectStore(STORE_NAME);
        },
    });
    await db.put(STORE_NAME, data, key);
}

export async function getOrderData<T = unknown>(key: string): Promise<T | undefined> {
    const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
            db.createObjectStore(STORE_NAME);
        },
    });
    return await db.get(STORE_NAME, key);
}

export async function deleteOrderData(key: string) {
    const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
            db.createObjectStore(STORE_NAME);
        },
    });
    await db.delete(STORE_NAME, key);
}