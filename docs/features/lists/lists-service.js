(function () {
  var LIST_TYPE = 'List';

  function nowIso() {
    return new Date().toISOString();
  }

  function ensureValidListName(name) {
    var trimmed = (name || '').trim();
    if (!trimmed) {
      throw new Error('List name is required.');
    }

    return trimmed;
  }

  async function requireListById(listId) {
    var record = await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.LIST_RECORDS, listId);
    if (!record || record.type !== LIST_TYPE) {
      throw new Error('List not found.');
    }

    return record;
  }

  async function requireItemById(itemId) {
    var item = await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.ITEMS, itemId);
    if (!item) {
      throw new Error('Item not found.');
    }

    return item;
  }

  async function readJoinRecordsByListId(listId) {
    return window.KaPDB.readAllFromIndex(
      window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS,
      window.KaPStores.INDEX_NAMES.LIST_RECORD_ITEMS_BY_LIST_RECORD_ID,
      listId
    );
  }

  async function findJoinRecordById(listId, listItemId) {
    var joinRecords = await readJoinRecordsByListId(listId);
    return joinRecords.find(function (record) {
      return record.id === listItemId;
    }) || null;
  }

  function sortByNameAscending(records) {
    return records.sort(function (a, b) {
      return String(a.name || '').localeCompare(String(b.name || ''), undefined, {
        sensitivity: 'base'
      });
    });
  }

  async function getAllLists() {
    var records = await window.KaPDB.readAllFromIndex(
      window.KaPStores.STORE_NAMES.LIST_RECORDS,
      window.KaPStores.INDEX_NAMES.LIST_RECORDS_BY_TYPE,
      LIST_TYPE
    );

    return sortByNameAscending(records);
  }

  async function createList(name) {
    var safeName = ensureValidListName(name);
    var timestamp = nowIso();

    var record = {
      id: window.KaPIds.NewId(),
      name: safeName,
      description: '',
      type: LIST_TYPE,
      createdDate: timestamp,
      updatedDate: timestamp
    };

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORDS, record);
    return record;
  }

  async function renameList(id, nextName) {
    var safeName = ensureValidListName(nextName);
    var record = await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.LIST_RECORDS, id);

    if (!record || record.type !== LIST_TYPE) {
      throw new Error('List not found.');
    }

    record.name = safeName;
    record.updatedDate = nowIso();

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORDS, record);
    return record;
  }

  async function deleteList(id) {
    await window.KaPDB.remove(window.KaPStores.STORE_NAMES.LIST_RECORDS, id);
  }

  async function getListItems(listId) {
    await requireListById(listId);
    var joinRecords = await readJoinRecordsByListId(listId);
    var detailItems = await Promise.all(
      joinRecords.map(async function (joinRecord) {
        var item = await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.ITEMS, joinRecord.itemId);
        if (!joinRecord.name && item && item.name) {
          joinRecord.name = item.name;
          await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, joinRecord);
        }

        return {
          id: joinRecord.id,
          listRecordId: joinRecord.listRecordId,
          itemId: joinRecord.itemId,
          name: joinRecord.name || (item && item.name) || 'Unknown Item',
          quantity: joinRecord.quantity,
          description: joinRecord.description,
          item: item || null
        };
      })
    );

    return sortByNameAscending(detailItems);
  }

  async function getListItemCount(listId) {
    await requireListById(listId);
    var joinRecords = await readJoinRecordsByListId(listId);
    return joinRecords.length;
  }

  async function addItemToList(listId, itemId, name, quantity, description) {
    await requireListById(listId);
    var safeName = window.KaPItemEntryRules.ensureValidItemEntryName(name);

    var joinRecords = await readJoinRecordsByListId(listId);
    var existingByName = window.KaPItemEntryRules.findJoinRecordByName(joinRecords, safeName);

    if (existingByName) {
      existingByName.quantity = window.KaPItemEntryRules.incrementQuantity(existingByName.quantity);
      await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, existingByName);
      return existingByName;
    }

    await requireItemById(itemId);
    var joinRecord = {
      id: window.KaPIds.NewId(),
      listRecordId: listId,
      itemId: itemId,
      name: safeName,
      quantity: window.KaPItemEntryRules.normalizeOptionalIntegerQuantity(quantity),
      description: window.KaPItemEntryRules.normalizeDescription(description)
    };

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, joinRecord);
    return joinRecord;
  }

  async function updateListItem(listId, listItemId, name, quantity, description) {
    await requireListById(listId);
    var existing = await findJoinRecordById(listId, listItemId);
    if (!existing) {
      throw new Error('List item not found.');
    }

    existing.name = window.KaPItemEntryRules.ensureValidItemEntryName(name);
    existing.quantity = window.KaPItemEntryRules.normalizeOptionalIntegerQuantity(quantity);
    existing.description = window.KaPItemEntryRules.normalizeDescription(description);

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, existing);
    return existing;
  }

  async function removeItemFromList(listId, listItemId) {
    await requireListById(listId);
    var existing = await findJoinRecordById(listId, listItemId);
    if (!existing) {
      return;
    }

    await window.KaPDB.remove(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, existing.id);
  }

  window.KaPListsService = {
    getAllLists: getAllLists,
    createList: createList,
    renameList: renameList,
    deleteList: deleteList,
    getListItemCount: getListItemCount,
    getListItems: getListItems,
    addItemToList: addItemToList,
    updateListItem: updateListItem,
    removeItemFromList: removeItemFromList
  };
})();
