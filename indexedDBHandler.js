/**
 * Opens an IndexedDB database and creates an object store with optional indexes if necessary.
 * @param {string} dbName - The name of the database to open.
 * @param {string} storeName - The name of the object store to create.
 * @param {Object} [options] - Additional options for the object store
 * @param {string} [options.keyPath] - The key path for the object store
 * @param {boolean} [options.autoIncrement] - Whether to auto increment the key
 * @param {Array<{name: string, keyPath: string, options: Object}>} [options.indexes] - Indexes to create
 * @returns {Promise<IDBDatabase>} A promise that resolves to the opened database.
 */
export function openDatabase(dbName, storeName, options = {}) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const storeOptions = {};
      if (options.keyPath) storeOptions.keyPath = options.keyPath;
      if (options.autoIncrement)
        storeOptions.autoIncrement = options.autoIncrement;

      const store = db.createObjectStore(storeName, storeOptions);

      // Create indexes if specified
      if (options.indexes) {
        options.indexes.forEach(({ name, keyPath, options = {} }) => {
          store.createIndex(name, keyPath, options);
        });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('Database open error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Saves data to an object store in IndexedDB.
 * @param {IDBDatabase} db - The database object.
 * @param {string} storeName - The name of the object store.
 * @param {any} key - The key to associate with the stored data.
 * @param {any} data - The data to store.
 * @returns {Promise<void>} A promise that resolves when the data is saved.
 */
export function saveToIndexedDB(db, storeName, key, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data, key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      console.error('Save to IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Retrieves data from an object store in IndexedDB.
 * @param {IDBDatabase} db - The database object.
 * @param {string} storeName - The name of the object store.
 * @returns {Promise<any>} A promise that resolves with the retrieved data.
 */
export function getFromIndexedDB(db, storeName, requestClosure) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = requestClosure(store);

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('Get from IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Fetches a file from a given URL.
 * @param {string} url - The URL of the file to fetch.
 * @returns {Promise<Blob|null>} A promise that resolves with the file as a Blob, or null if there was an error.
 */
export async function fetchFile(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.blob();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

/**
 * Loads JSON data from a file and saves it in IndexedDB if not already stored.
 * If the data is not found in IndexedDB, it fetches the file from a URL, saves it, and parses the Blob into JSON.
 * @param {Object} params - The parameters for loading data.
 * @param {string} params.DB_NAME - The name of the IndexedDB database.
 * @param {string} params.STORE_NAME - The name of the object store.
 * @param {string} params.FILE_URL - The URL of the file to fetch if not found in IndexedDB.
 * @param {string} params.key - The key to use for storing/retrieving the data in IndexedDB.
 * @param {any} params.data - The data to store if not already in IndexedDB.
 * @returns {Promise<any>} A promise that resolves to the parsed JSON data from the Blob.
 */
export async function loadDataWithFallback({
  DB_NAME,
  STORE_NAME,
  FILE_URL,
  key,
  data,
}) {
  try {
    const db = await openDatabase(DB_NAME, STORE_NAME);

    // Check if data is already in IndexedDB
    let fileData = await getFromIndexedDB(db, STORE_NAME, (objectStore) => {
      const request = objectStore.get(key);
      console.log(request);
      return request;
    });

    if (!fileData) {
      // If not in IndexedDB, fetch from FILE_URL
      fileData = await fetchFile(FILE_URL);
      if (!fileData) {
        throw new Error('Failed to fetch the file');
      }

      // Save the blob to IndexedDB
      await saveToIndexedDB(db, STORE_NAME, data, fileData);
    }

    // Convert Blob to JSON
    const text = await fileData.text();
    const jsonData = JSON.parse(text);

    // Check if AllWordSetsBlob exists and is an array
    if (!Array.isArray(jsonData)) {
      throw new Error('Data is not an array');
    }

    return jsonData;
  } catch (error) {
    console.error('Error loading data with fallback:', error);
    throw error;
  }
}
