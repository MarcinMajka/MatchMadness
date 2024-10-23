export function openDatabase(dbName, storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(storeName);
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

export function getFromIndexedDB(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('Get from IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

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

export async function loadDicIn50WordSets({ DB_NAME, STORE_NAME, FILE_URL }) {
  try {
    const db = await openDatabase(DB_NAME, STORE_NAME);

    // Check if data is already in IndexedDB
    let fileData = await getFromIndexedDB(
      db,
      STORE_NAME,
      'dicIn50WordSets.json'
    );

    if (!fileData) {
      // If not in IndexedDB, fetch from FILE_URL
      fileData = await fetchFile(FILE_URL);
      if (!fileData) {
        throw new Error('Failed to fetch the file');
      }

      // Save the blob to IndexedDB
      await saveToIndexedDB(db, STORE_NAME, 'AllWordSetsBlob', fileData);
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
    console.error('Error loading AllWordSetsBlob:', error);
    throw error;
  }
}
