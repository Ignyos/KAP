(function () {
  var STORE_NAMES = {
    LIST_RECORDS: 'listRecords',
    ITEMS: 'items',
    LIST_RECORD_ITEMS: 'listRecordItems',
    CATEGORIES: 'categories'
  };

  var INDEX_NAMES = {
    LIST_RECORDS_BY_TYPE: 'by_type',
    LIST_RECORDS_BY_UPDATED_DATE: 'by_updated_date',
    ITEMS_BY_NAME: 'by_name',
    LIST_RECORD_ITEMS_BY_LIST_RECORD_ID: 'by_list_record_id',
    LIST_RECORD_ITEMS_BY_ITEM_ID: 'by_item_id',
    CATEGORIES_BY_NAME: 'by_name'
  };

  function ensureStore(db, transaction, storeName, options) {
    if (db.objectStoreNames.contains(storeName)) {
      return transaction.objectStore(storeName);
    }

    return db.createObjectStore(storeName, options);
  }

  function ensureIndex(store, indexName, keyPath, options) {
    if (!store.indexNames.contains(indexName)) {
      store.createIndex(indexName, keyPath, options || { unique: false });
    }
  }

  function upgrade(db, oldVersion, transaction) {
    var listRecordsStore = ensureStore(db, transaction, STORE_NAMES.LIST_RECORDS, { keyPath: 'id' });
    ensureIndex(listRecordsStore, INDEX_NAMES.LIST_RECORDS_BY_TYPE, 'type', { unique: false });
    ensureIndex(listRecordsStore, INDEX_NAMES.LIST_RECORDS_BY_UPDATED_DATE, 'updatedDate', { unique: false });

    var itemsStore = ensureStore(db, transaction, STORE_NAMES.ITEMS, { keyPath: 'id' });
    ensureIndex(itemsStore, INDEX_NAMES.ITEMS_BY_NAME, 'name', { unique: false });

    var joinStore = ensureStore(db, transaction, STORE_NAMES.LIST_RECORD_ITEMS, { keyPath: 'id' });
    ensureIndex(joinStore, INDEX_NAMES.LIST_RECORD_ITEMS_BY_LIST_RECORD_ID, 'listRecordId', { unique: false });
    ensureIndex(joinStore, INDEX_NAMES.LIST_RECORD_ITEMS_BY_ITEM_ID, 'itemId', { unique: false });

    var categoriesStore = ensureStore(db, transaction, STORE_NAMES.CATEGORIES, { keyPath: 'id' });
    ensureIndex(categoriesStore, INDEX_NAMES.CATEGORIES_BY_NAME, 'name', { unique: false });
  }

  window.KaPStores = {
    STORE_NAMES: STORE_NAMES,
    INDEX_NAMES: INDEX_NAMES,
    upgrade: upgrade
  };
})();
