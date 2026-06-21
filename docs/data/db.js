(function () {
  var DATABASE_NAME = 'ignyos.kap';
  var DATABASE_VERSION = 7;

  var state = {
    db: null,
    openingPromise: null
  };

  function clearOpenState(db) {
    if (!db || state.db === db) {
      state.db = null;
    }
    state.openingPromise = null;
  }

  function isConnectionClosingError(error) {
    if (!error) {
      return false;
    }

    if (error.name === 'InvalidStateError') {
      return true;
    }

    return String(error.message || '').toLowerCase().indexOf('connection is closing') >= 0;
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

  async function withDatabase(action) {
    var attempts = 0;

    while (attempts < 2) {
      var db = await open();

      try {
        return await action(db);
      } catch (error) {
        if (attempts === 0 && isConnectionClosingError(error)) {
          try {
            db.close();
          } catch (_closeError) {
            // Ignore close failures while recovering from an invalid connection.
          }
          clearOpenState(db);
          attempts += 1;
          continue;
        }

        throw error;
      }
    }
  }

  async function readAll(storeName) {
    return withDatabase(async function (db) {
      var tx = db.transaction(storeName, 'readonly');
      var store = tx.objectStore(storeName);
      var records = await requestToPromise(store.getAll());
      await transactionDone(tx);
      return records;
    });
  }

  async function readAllFromIndex(storeName, indexName, indexKey) {
    return withDatabase(async function (db) {
      var tx = db.transaction(storeName, 'readonly');
      var store = tx.objectStore(storeName);
      var index = store.index(indexName);
      var records = await requestToPromise(index.getAll(indexKey));
      await transactionDone(tx);
      return records;
    });
  }

  async function readByKey(storeName, key) {
    return withDatabase(async function (db) {
      var tx = db.transaction(storeName, 'readonly');
      var store = tx.objectStore(storeName);
      var record = await requestToPromise(store.get(key));
      await transactionDone(tx);
      return record;
    });
  }

  async function upsert(storeName, value) {
    return withDatabase(async function (db) {
      var tx = db.transaction(storeName, 'readwrite');
      var store = tx.objectStore(storeName);
      await requestToPromise(store.put(value));
      await transactionDone(tx);
      return value;
    });
  }

  async function remove(storeName, key) {
    return withDatabase(async function (db) {
      var tx = db.transaction(storeName, 'readwrite');
      var store = tx.objectStore(storeName);
      await requestToPromise(store.delete(key));
      await transactionDone(tx);
    });
  }

  function open() {
    if (state.db) {
      return Promise.resolve(state.db);
    }

    if (state.openingPromise) {
      return state.openingPromise;
    }

    state.openingPromise = new Promise(function (resolve, reject) {
      var request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onerror = function () {
        state.openingPromise = null;
        reject(request.error);
      };

      request.onupgradeneeded = function (event) {
        window.KaPStores.upgrade(event.target.result, event.oldVersion || 0, event.target.transaction);
      };

      request.onsuccess = function () {
        var db = request.result;
        db.onclose = function () {
          clearOpenState(db);
        };
        db.onversionchange = function () {
          try {
            db.close();
          } finally {
            clearOpenState(db);
          }
        };
        state.db = db;
        state.openingPromise = null;
        resolve(state.db);
      };
    });

    return state.openingPromise;
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
