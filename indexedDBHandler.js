export function openDatabase(dbName, storeName) {
  return new Promise((resolve, reject) => {
    // console.log('Opening database:', dbName);
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      // console.log('Upgrading database:', dbName);
      const db = event.target.result;
      db.createObjectStore(storeName);
    };

    request.onsuccess = (event) => {
      // console.log('Database opened successfully - dbName:', dbName);
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
    // console.log('Starting saving to IndexedDB:', key);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data, key);

    request.onsuccess = () => {
      // console.log('Data saved to IndexedDB:', key);
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
    // console.log('Getting from IndexedDB:', key);
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = (event) => {
      // console.log('Data retrieved from IndexedDB:', key, event.target.result);
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
    // console.log('Fetching file:', url);
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

export async function loadDicIn50WordSets(dbName, storeName, url) {
  try {
    // console.log('Loading dictionary in 50 word sets');
    const db = await openDatabase(dbName, storeName);

    // Check if data is already in IndexedDB
    let fileData = await getFromIndexedDB(
      db,
      storeName,
      'dicIn50WordSets.json'
    );

    if (!fileData) {
      // If not in IndexedDB, fetch from URL
      fileData = await fetchFile(url);
      if (!fileData) {
        throw new Error('Failed to fetch the file');
      }

      // Save the blob to IndexedDB
      await saveToIndexedDB(db, storeName, 'AllWordSetsBlob', fileData);
      // console.log('File saved to IndexedDB');
    }

    // Convert Blob to JSON
    const text = await fileData.text();
    // console.log('File content:', text); // Log the content of the file
    const jsonData = JSON.parse(text);

    // Check if AllWordSetsBlob exists and is an array
    if (!Array.isArray(jsonData)) {
      throw new Error('Data is not an array');
    }

    // console.log('Successfully loaded AllWordSetsBlob');
    return jsonData;
  } catch (error) {
    console.error('Error loading AllWordSetsBlob:', error);
    throw error;
  }
}
