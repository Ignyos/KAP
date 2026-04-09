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

  function ensureValidItemEntryName(name) {
    var trimmed = (name || '').trim();
    if (!trimmed) {
      throw new Error('Item name is required.');
    }

    return trimmed;
  }

  function normalizeDescription(description) {
    return (description || '').trim();
  }

  function normalizeOptionalIntegerQuantity(quantity) {
    var raw = String(quantity == null ? '' : quantity).trim();
    if (!raw) {
      return null;
    }

    if (!/^-?\d+$/.test(raw)) {
      throw new Error('Quantity must be an integer.');
    }

    return Number(raw);
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

  async function findJoinRecord(listId, itemId) {
    var joinRecords = await readJoinRecordsByListId(listId);
    return joinRecords.find(function (record) {
      return record.itemId === itemId;
    }) || null;
  }

  async function findJoinRecordById(listId, listItemId) {
    var joinRecords = await readJoinRecordsByListId(listId);
    return joinRecords.find(function (record) {
      return record.id === listItemId;
    }) || null;
  }

  function sortByUpdatedDateDescending(records) {
    return records.sort(function (a, b) {
      return String(b.updatedDate).localeCompare(String(a.updatedDate));
    });
  }

  async function getAllLists() {
    var records = await window.KaPDB.readAllFromIndex(
      window.KaPStores.STORE_NAMES.LIST_RECORDS,
      window.KaPStores.INDEX_NAMES.LIST_RECORDS_BY_TYPE,
      LIST_TYPE
    );

    return sortByUpdatedDateDescending(records);
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
    return Promise.all(
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
  }

  async function addItemToList(listId, itemId, name, quantity, description) {
    await requireListById(listId);
    var safeName = ensureValidItemEntryName(name);
    var normalizedName = safeName.toLowerCase();

    var joinRecords = await readJoinRecordsByListId(listId);
    var existingByName = joinRecords.find(function (r) {
      return String(r.name || '').trim().toLowerCase() === normalizedName;
    });

    if (existingByName) {
      existingByName.quantity = existingByName.quantity == null ? 1 : existingByName.quantity + 1;
      await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, existingByName);
      return existingByName;
    }

    await requireItemById(itemId);
    var joinRecord = {
      id: window.KaPIds.NewId(),
      listRecordId: listId,
      itemId: itemId,
      name: safeName,
      quantity: normalizeOptionalIntegerQuantity(quantity),
      description: normalizeDescription(description)
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

    existing.name = ensureValidItemEntryName(name);
    existing.quantity = normalizeOptionalIntegerQuantity(quantity);
    existing.description = normalizeDescription(description);

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
    getListItems: getListItems,
    addItemToList: addItemToList,
    updateListItem: updateListItem,
    removeItemFromList: removeItemFromList
  };
})();
