// "My library" storage. Uses IndexedDB (built into every browser) because designs can
// include logo images, which are too big for localStorage. Nothing leaves this browser.

const DB_NAME = "qrcraft";
const STORE = "designs";
const VERSION = 1;

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser can't save designs (storage is turned off or in private mode)."));
      return;
    }
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Couldn't open saved designs. Your browser may be blocking storage."));
  });
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}

async function run(mode, action) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const request = action(store);
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(new Error(tx.error?.name === "QuotaExceededError" ? "Your browser storage is full. Delete a few designs and try again." : "Couldn't save. Try again."));
  });
}

export const listDesigns = () => run("readonly", (s) => s.getAll()).then((all) => all ?? []);
export const getDesign = (id) => run("readonly", (s) => s.get(id));
export const putDesign = (record) => run("readwrite", (s) => s.put(record)).then(() => record);
export const deleteDesign = (id) => run("readwrite", (s) => s.delete(id));

export async function putMany(records) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    for (const r of records) store.put(r);
    tx.oncomplete = () => resolve(records.length);
    tx.onerror = () => reject(new Error("Couldn't restore the backup. Your browser storage may be full."));
  });
}
