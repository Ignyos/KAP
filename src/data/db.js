(function () {
  var DATABASE_NAME = 'ignyos.kap';
  var DATABASE_VERSION = 3;

  var state = {
    db: null
  };

  function ensureOpen() {
    if (!state.db) {
      throw new Error('Database is not open. Call KaPDB.open() before performing operations.');
    }

    return state.db;
  }

  function requestToPromise(request) {
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve(request.result);
      };
      request.onerror = function () {
        reject(request.error);
      };
    });
  }

  function transactionDone(transaction) {
    return new Promise(function (resolve, reject) {
      transaction.oncomplete = function () {
        resolve();
      };
      transaction.onabort = function () {
        reject(transaction.error || new Error('Transaction aborted.'));
      };
      transaction.onerror = function () {
        reject(transaction.error || new Error('Transaction failed.'));
      };
    });
  }

  async function readAll(storeName) {
    var db = ensureOpen();
    var tx = db.transaction(storeName, 'readonly');
    var store = tx.objectStore(storeName);
    var records = await requestToPromise(store.getAll());
    await transactionDone(tx);
    return records;
  }

  async function readAllFromIndex(storeName, indexName, indexKey) {
    var db = ensureOpen();
    var tx = db.transaction(storeName, 'readonly');
    var store = tx.objectStore(storeName);
    var index = store.index(indexName);
    var records = await requestToPromise(index.getAll(indexKey));
    await transactionDone(tx);
    return records;
  }

  async function readByKey(storeName, key) {
    var db = ensureOpen();
    var tx = db.transaction(storeName, 'readonly');
    var store = tx.objectStore(storeName);
    var record = await requestToPromise(store.get(key));
    await transactionDone(tx);
    return record;
  }

  async function upsert(storeName, value) {
    var db = ensureOpen();
    var tx = db.transaction(storeName, 'readwrite');
    var store = tx.objectStore(storeName);
    await requestToPromise(store.put(value));
    await transactionDone(tx);
    return value;
  }

  async function remove(storeName, key) {
    var db = ensureOpen();
    var tx = db.transaction(storeName, 'readwrite');
    var store = tx.objectStore(storeName);
    await requestToPromise(store.delete(key));
    await transactionDone(tx);
  }

  function open() {
    if (state.db) {
      return Promise.resolve(state.db);
    }

    return new Promise(function (resolve, reject) {
      var request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onerror = function () {
        reject(request.error);
      };

      request.onupgradeneeded = function (event) {
        window.KaPStores.upgrade(event.target.result, event.oldVersion || 0, event.target.transaction);
      };

      request.onsuccess = function () {
        state.db = request.result;
        resolve(state.db);
      };
    });
  }

  window.KaPDB = {
    open: open,
    readAll: readAll,
    readAllFromIndex: readAllFromIndex,
    readByKey: readByKey,
    upsert: upsert,
    remove: remove
  };
})();
