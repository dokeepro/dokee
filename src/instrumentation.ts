// Node.js v22+ can expose a partial `localStorage` global (experimental webstorage),
// where `typeof localStorage !== 'undefined'` evaluates true but `getItem` is undefined.
// Several SSR-time dependencies (e.g. @mui/system) guard with that check and then crash.
// Deleting the global on the server side makes those guards correctly fall through.
export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        try {
            // @ts-expect-error Node.js >=22 exposes localStorage as a non-standard global
            delete globalThis.localStorage;
            // @ts-expect-error Same for sessionStorage
            delete globalThis.sessionStorage;
        } catch {
            // ignore if the global is non-configurable
        }
    }
}
