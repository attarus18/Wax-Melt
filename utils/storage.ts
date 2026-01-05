
import { InventoryState } from '../types';

const DB_NAME = 'WaxProDatabase';
const STORE_NAME = 'inventory_store';
const DATA_KEY = 'current_state';

let dbInstance: IDBDatabase | null = null;

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, 2);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => reject(request.error);
  });
};

export const loadFromDB = async (): Promise<InventoryState> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(DATA_KEY);

      request.onsuccess = () => {
        if (request.result) {
          resolve({
            finishedProducts: request.result.finishedProducts || [],
            rawMaterials: request.result.rawMaterials || [],
            settings: request.result.settings || undefined,
            lastSynced: request.result.lastSynced
          });
        } else {
          const legacyData = localStorage.getItem('waxpro_manager_data');
          if (legacyData) {
            const parsed = JSON.parse(legacyData);
            resolve({ 
              finishedProducts: parsed.finishedProducts || [],
              rawMaterials: parsed.rawMaterials || [],
              settings: parsed.settings || undefined
            });
          } else {
            resolve({ finishedProducts: [], rawMaterials: [] });
          }
        }
      };
      request.onerror = () => resolve({ finishedProducts: [], rawMaterials: [] });
    });
  } catch (e) {
    console.error("Errore caricamento DB:", e);
    return { finishedProducts: [], rawMaterials: [] };
  }
};

export const saveToDB = async (state: InventoryState): Promise<boolean> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(state, DATA_KEY);

      localStorage.setItem('waxpro_manager_data', JSON.stringify(state));

      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error("Errore scrittura store:", request.error);
        resolve(false);
      };
    });
  } catch (e) {
    console.error("Errore salvataggio DB:", e);
    return false;
  }
};

export const clearDB = async (): Promise<boolean> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      localStorage.removeItem('waxpro_manager_data');

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch (e) {
    console.error("Errore pulizia DB:", e);
    return false;
  }
};
