import { FirebaseAdapter } from './FirebaseAdapter.js';

export async function createStorageAdapter(_mode, db, getUidFn) {
    const adapter = new FirebaseAdapter(db, getUidFn);
    await adapter.init();
    return adapter;
}
