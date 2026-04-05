(function () {
  var STORE_NAMES = {
    LIST_RECORDS: 'listRecords',
    ITEMS: 'items',
    LIST_RECORD_ITEMS: 'listRecordItems'
  };

  var INDEX_NAMES = {
    LIST_RECORDS_BY_TYPE: 'by_type',
    LIST_RECORDS_BY_UPDATED_DATE: 'by_updated_date',
    ITEMS_BY_NAME: 'by_name',
    LIST_RECORD_ITEMS_BY_LIST_RECORD_ID: 'by_list_record_id',
    LIST_RECORD_ITEMS_BY_ITEM_ID: 'by_item_id'
  };

  function upgrade(db) {
    var listRecordsStore = db.createObjectStore(STORE_NAMES.LIST_RECORDS, { keyPath: 'id' });
    listRecordsStore.createIndex(INDEX_NAMES.LIST_RECORDS_BY_TYPE, 'type', { unique: false });
    listRecordsStore.createIndex(INDEX_NAMES.LIST_RECORDS_BY_UPDATED_DATE, 'updatedDate', { unique: false });

    var itemsStore = db.createObjectStore(STORE_NAMES.ITEMS, { keyPath: 'id' });
    itemsStore.createIndex(INDEX_NAMES.ITEMS_BY_NAME, 'name', { unique: false });

    var joinStore = db.createObjectStore(STORE_NAMES.LIST_RECORD_ITEMS, { keyPath: 'id' });
    joinStore.createIndex(INDEX_NAMES.LIST_RECORD_ITEMS_BY_LIST_RECORD_ID, 'listRecordId', { unique: false });
    joinStore.createIndex(INDEX_NAMES.LIST_RECORD_ITEMS_BY_ITEM_ID, 'itemId', { unique: false });
  }

  window.KaPStores = {
    STORE_NAMES: STORE_NAMES,
    INDEX_NAMES: INDEX_NAMES,
    upgrade: upgrade
  };
})();
