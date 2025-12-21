/**
 * Simple IndexedDB database for storing business data
 */

interface BusinessData {
  id: string;
  name: string;
  email: string;
  password: string; // In production, this should be hashed
  verified: boolean;
  kycStatus?: 'incomplete' | 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  reputation: number;
  rating: number;
  totalHoursDelivered: number;
  totalHoursReceived: number;
}

const DB_NAME = 'BizwageDB';
const DB_VERSION = 1;
const STORE_NAME = 'businesses';

let db: IDBDatabase | null = null;

export async function initDatabase(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('email', 'email', { unique: true });
      }
    };
  });
}

export async function saveBusiness(business: BusinessData): Promise<void> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(business);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getBusinessByEmail(email: string): Promise<BusinessData | null> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('email');
    const request = index.get(email);

    request.onsuccess = () => {
      resolve(request.result || null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getBusinessById(id: string): Promise<BusinessData | null> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getAllBusinesses(): Promise<BusinessData[]> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };
    request.onerror = () => reject(request.error);
  });
}

