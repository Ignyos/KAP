(function () {
  var DATABASE_NAME = 'ignyos.kap';
  var DATABASE_VERSION = 8;

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

  function canTrackTombstone(db, storeName, key) {
    var tombstoneStoreName = window.KaPStores && window.KaPStores.STORE_NAMES
      ? window.KaPStores.STORE_NAMES.SYNC_TOMBSTONES
      : 'syncTombstones';
    if (!db.objectStoreNames.contains(tombstoneStoreName)) {
      return false;
    }

    if (storeName === tombstoneStoreName || key === null || key === undefined || key === '') {
      return false;
    }

    return true;
  }

  function buildTombstone(storeName, key) {
    var timestamp = new Date().toISOString();
    return {
      id: String(storeName) + '::' + String(key),
      storeName: String(storeName),
      recordId: String(key),
      deletedDate: timestamp,
      updatedDate: timestamp,
      createdDate: timestamp
    };
  }

  async function remove(storeName, key, options) {
    return withDatabase(async function (db) {
      var skipTombstone = options && options.skipTombstone === true;
      var includeTombstone = !skipTombstone && canTrackTombstone(db, storeName, key);
      var tombstoneStoreName = window.KaPStores && window.KaPStores.STORE_NAMES
        ? window.KaPStores.STORE_NAMES.SYNC_TOMBSTONES
        : 'syncTombstones';
      var txStores = includeTombstone ? [storeName, tombstoneStoreName] : [storeName];
      var tx = db.transaction(txStores, 'readwrite');
      var store = tx.objectStore(storeName);

      await requestToPromise(store.delete(key));

      if (includeTombstone) {
        var tombstoneStore = tx.objectStore(tombstoneStoreName);
        await requestToPromise(tombstoneStore.put(buildTombstone(storeName, key)));
      }

      await transactionDone(tx);
    });
  }

  async function removeHard(storeName, key) {
    await remove(storeName, key, { skipTombstone: true });
  }

  async function clearStore(storeName) {
    return withDatabase(async function (db) {
      var tx = db.transaction(storeName, 'readwrite');
      var store = tx.objectStore(storeName);
      await requestToPromise(store.clear());
      await transactionDone(tx);
    });
  }

  async function replaceStores(recordsByStore) {
    return withDatabase(async function (db) {
      var storeNames = Object.keys(recordsByStore || {});
      if (storeNames.length === 0) {
        return;
      }

      var tx = db.transaction(storeNames, 'readwrite');

      for (var i = 0; i < storeNames.length; i++) {
        var storeName = storeNames[i];
        var store = tx.objectStore(storeName);
        await requestToPromise(store.clear());

        var records = recordsByStore[storeName];
        if (!Array.isArray(records)) {
          throw new Error('Import payload for "' + storeName + '" must be an array.');
        }

        for (var j = 0; j < records.length; j++) {
          await requestToPromise(store.put(records[j]));
        }
      }

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
    remove: remove,
    removeHard: removeHard,
    clearStore: clearStore,
    replaceStores: replaceStores,
    DB_VERSION: DATABASE_VERSION
  };
})();
