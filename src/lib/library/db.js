// "My library" storage. Uses IndexedDB (built into every browser) because designs can
// include logo images, which are too big for localStorage. Nothing leaves this browser.
//
// Stores: "designs" = QR Studio designs, "prints" = Print Studio designs (cards, badges...).

const DB_NAME = "qrcraft";
const DESIGNS = "designs";
const PRINTS = "prints";
const VERSION = 2;

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
      if (!db.objectStoreNames.contains(DESIGNS)) db.createObjectStore(DESIGNS, { keyPath: "id" });
      if (!db.objectStoreNames.contains(PRINTS)) db.createObjectStore(PRINTS, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Couldn't open saved designs. Your browser may be blocking storage."));
    request.onblocked = () => reject(new Error("QR Craft is open in another tab with an older version. Close other tabs and try again."));
  });
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}

async function run(store, mode, action) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const request = action(tx.objectStore(store));
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(new Error(tx.error?.name === "QuotaExceededError" ? "Your browser storage is full. Delete a few designs and try again." : "Couldn't save. Try again."));
  });
}

async function putAll(store, records, message) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const s = tx.objectStore(store);
    for (const r of records) s.put(r);
    tx.oncomplete = () => resolve(records.length);
    tx.onerror = () => reject(new Error(message));
  });
}

export const listDesigns = () => run(DESIGNS, "readonly", (s) => s.getAll()).then((all) => all ?? []);
export const getDesign = (id) => run(DESIGNS, "readonly", (s) => s.get(id));
export const putDesign = (record) => run(DESIGNS, "readwrite", (s) => s.put(record)).then(() => record);
export const deleteDesign = (id) => run(DESIGNS, "readwrite", (s) => s.delete(id));
export const putMany = (records) => putAll(DESIGNS, records, "Couldn't restore the backup. Your browser storage may be full.");

export const listPrints = () => run(PRINTS, "readonly", (s) => s.getAll()).then((all) => all ?? []);
export const getPrint = (id) => run(PRINTS, "readonly", (s) => s.get(id));
export const putPrint = (record) => run(PRINTS, "readwrite", (s) => s.put(record)).then(() => record);
export const deletePrint = (id) => run(PRINTS, "readwrite", (s) => s.delete(id));
export const putManyPrints = (records) => putAll(PRINTS, records, "Couldn't restore the backup. Your browser storage may be full.");
