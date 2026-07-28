import { StorageAdapter } from './StorageAdapter.js';
import { 
    collection, addDoc, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot, query, orderBy, runTransaction, enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export class FirebaseAdapter extends StorageAdapter {
    constructor(db, getUidFn) {
        super();
        this.db = db;
        this.getUidFn = getUidFn;
        this.listeners = new Map();
    }

    getMode() {
        return 'cloud';
    }

    async init() {
        if (this.db && !this._persistenceAttempted) {
            this._persistenceAttempted = true;
            try {
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('persistence-timeout')), 4000)
                );
                Promise.race([
                    enableIndexedDbPersistence(this.db),
                    timeoutPromise
                ]).then(() => {
                }).catch((err) => {
                    if (err.message !== 'persistence-timeout') {
                        if (err.code === 'failed-precondition') {
                            console.warn('[FB-ADAPTER] Firestore offline persistence failed: Multiple tabs open');
                        } else if (err.code === 'unimplemented') {
                            console.warn('[FB-ADAPTER] Firestore offline persistence is not supported by this browser');
                        } else {
                            console.warn('[FB-ADAPTER] Firestore offline persistence failed:', err.message || err.code);
                        }
                    } else {
                        console.warn('[FB-ADAPTER] persistence setup timed out after 4s, continuing without it');
                    }
                });
            } catch (err) {
                console.warn('[FB-ADAPTER] Firestore offline persistence setup error:', err);
            }
        }
        return true;
    }

    get uid() {
        const uid = this.getUidFn();
        if (!uid) throw new Error("User not authenticated in Cloud mode");
        return uid;
    }

    _getUserColRef(colName) {
        return collection(this.db, 'users', this.uid, colName);
    }

    _getUserDocRef(colName, docId) {
        return doc(this.db, 'users', this.uid, colName, docId);
    }

    // --- Items ---
    async getItems() {
        const snapshot = await getDocs(this._getUserColRef('items'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async createItem(itemData) {
        const docRef = await addDoc(this._getUserColRef('items'), {
            ...itemData,
            createdAt: itemData.createdAt || Date.now()
        });
        return { id: docRef.id, ...itemData };
    }

    async updateItem(id, itemData) {
        await updateDoc(this._getUserDocRef('items', id), itemData);
        return { id, ...itemData };
    }

    async deleteItem(id) {
        await deleteDoc(this._getUserDocRef('items', id));
        return id;
    }

    // --- Logs ---
    async getLogs() {
        const q = query(this._getUserColRef('logs'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async createLog(logData) {
        const docRef = await addDoc(this._getUserColRef('logs'), {
            ...logData,
            timestamp: logData.timestamp || Date.now()
        });
        return { id: docRef.id, ...logData };
    }

    async deleteLog(id) {
        await deleteDoc(this._getUserDocRef('logs', id));
        return id;
    }

    // --- Notes ---
    async getNotes() {
        const snapshot = await getDocs(this._getUserColRef('notes'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async upsertNote(noteData) {
        let noteId = noteData.id;
        if (!noteId) {
            const docRef = doc(this._getUserColRef('notes'));
            noteId = docRef.id;
        }
        const ref = this._getUserDocRef('notes', noteId);
        const payload = {
            title: noteData.title || '',
            body: noteData.body || '',
            updatedAt: Date.now(),
            ...(noteData.createdAt ? { createdAt: noteData.createdAt } : { createdAt: Date.now() })
        };
        await setDoc(ref, payload, { merge: true });
        return { id: noteId, ...payload };
    }

    async deleteNote(id) {
        await deleteDoc(this._getUserDocRef('notes', id));
        return id;
    }

    // --- Seasons ---
    async getSeasons() {
        const snapshot = await getDocs(this._getUserColRef('seasons'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async createSeason(seasonData) {
        const docRef = await addDoc(this._getUserColRef('seasons'), {
            ...seasonData,
            createdAt: Date.now()
        });
        return { id: docRef.id, ...seasonData };
    }

    async updateSeason(id, seasonData) {
        await updateDoc(this._getUserDocRef('seasons', id), seasonData);
        return { id, ...seasonData };
    }

    async deleteSeason(id) {
        await deleteDoc(this._getUserDocRef('seasons', id));
        return id;
    }

    // --- Backlog ---
    async getBacklog() {
        const snapshot = await getDocs(this._getUserColRef('backlog'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async createBacklogEntry(entryData) {
        const docRef = await addDoc(this._getUserColRef('backlog'), {
            ...entryData,
            createdAt: Date.now()
        });
        return { id: docRef.id, ...entryData };
    }

    async deleteBacklogEntry(id) {
        await deleteDoc(this._getUserDocRef('backlog', id));
        return id;
    }

    // --- Daily Logs ---
    async getDailyLogs() {
        const snapshot = await getDocs(this._getUserColRef('dailyLogs'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async upsertDailyLog(dailyLogData) {
        let docId = dailyLogData.id || dailyLogData.date;
        const ref = this._getUserDocRef('dailyLogs', docId);
        await setDoc(ref, dailyLogData, { merge: true });
        return { id: docId, ...dailyLogData };
    }

    // --- Habit Logs ---
    async getHabitLogs() {
        const snapshot = await getDocs(this._getUserColRef('habitLogs'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async upsertHabitLog(habitLogData) {
        let docId = habitLogData.id || `${habitLogData.seasonId}_${habitLogData.date}`;
        const ref = this._getUserDocRef('habitLogs', docId);
        await setDoc(ref, habitLogData, { merge: true });
        return { id: docId, ...habitLogData };
    }

    // --- Meta / Profile / Active Timer ---
    async getMeta(metaId) {
        const ref = this._getUserDocRef('meta', metaId);
        const docSnap = await getDoc(ref);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    }

    async setMeta(metaId, metaData) {
        const ref = this._getUserDocRef('meta', metaId);
        await setDoc(ref, metaData, { merge: true });
        return { id: metaId, ...metaData };
    }

    // --- Atomic Start Timer with ActiveTimer Meta ---
    async startItemTimer(itemId, startedAt) {
        const activeTimerRef = this._getUserDocRef('meta', 'activeTimer');
        const itemRef = this._getUserDocRef('items', itemId);

        await runTransaction(this.db, async (transaction) => {
            transaction.set(activeTimerRef, { itemId, startedAt });
            transaction.update(itemRef, { isRunning: true, startedAt });
        });
    }

    async stopItemTimer(itemId, newAccumulatedSeconds) {
        const activeTimerRef = this._getUserDocRef('meta', 'activeTimer');
        const itemRef = this._getUserDocRef('items', itemId);

        await runTransaction(this.db, async (transaction) => {
            transaction.set(activeTimerRef, { itemId: null, startedAt: null });
            transaction.update(itemRef, { isRunning: false, startedAt: null, accumulatedSeconds: newAccumulatedSeconds });
        });
    }

    // --- Realtime / Event Subscriptions ---
    subscribe(colName, callback) {
        let ref;
        if (colName.startsWith('meta/')) {
            const metaId = colName.split('/')[1];
            ref = this._getUserDocRef('meta', metaId);
        } else {
            ref = this._getUserColRef(colName);
        }
        const startTime = Date.now();
        const unsub = onSnapshot(ref, (snapshot) => {
            const elapsed = Date.now() - startTime;
            if (snapshot.docs) {
                const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                callback(data);
            } else if (snapshot.exists) {
                callback({ id: snapshot.id, ...snapshot.data() });
            } else {
                callback(null);
            }
        }, (error) => {
            console.error(`[FB-ADAPTER] subscribe('${colName}') onSnapshot ERROR:`, error);
        });
        return unsub;
    }
}
