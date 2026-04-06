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

  window.KaPListsService = {
    getAllLists: getAllLists,
    createList: createList,
    renameList: renameList,
    deleteList: deleteList
  };
})();
