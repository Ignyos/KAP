(function () {
  function ensureValidItemName(name) {
    var trimmed = (name || '').trim();
    if (!trimmed) {
      throw new Error('Item name is required.');
    }

    return trimmed;
  }

  function normalizeDescription(description) {
    return (description || '').trim();
  }

  function sortByNameAscending(items) {
    return items.sort(function (a, b) {
      return String(a.name).localeCompare(String(b.name));
    });
  }

  async function getAllItems() {
    var items = await window.KaPDB.readAll(window.KaPStores.STORE_NAMES.ITEMS);
    return sortByNameAscending(items);
  }

  async function getItemById(id) {
    return window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.ITEMS, id);
  }

  async function searchItems(query) {
    var normalizedQuery = String(query || '').trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    var items = await getAllItems();
    return items.filter(function (item) {
      return String(item.name).toLowerCase().indexOf(normalizedQuery) >= 0;
    });
  }

  async function createItem(name, description) {
    var safeName = ensureValidItemName(name);
    var safeDescription = normalizeDescription(description);
    var existingItems = await getAllItems();
    var existing = existingItems.find(function (item) {
      return String(item.name).toLowerCase() === safeName.toLowerCase();
    });

    if (existing) {
      return existing;
    }

    var item = {
      id: window.KaPIds.NewId(),
      name: safeName,
      description: safeDescription
    };

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.ITEMS, item);
    return item;
  }

  async function updateItem(id, nextName, nextDescription) {
    var item = await getItemById(id);
    if (!item) {
      throw new Error('Item not found.');
    }

    item.name = ensureValidItemName(nextName);
    item.description = normalizeDescription(nextDescription);

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.ITEMS, item);
    return item;
  }

  async function deleteItem(id) {
    var item = await getItemById(id);
    if (!item) {
      return false;
    }

    await window.KaPDB.remove(window.KaPStores.STORE_NAMES.ITEMS, id);
    return true;
  }

  window.KaPItemsService = {
    getAllItems: getAllItems,
    getItemById: getItemById,
    searchItems: searchItems,
    createItem: createItem,
    updateItem: updateItem,
    deleteItem: deleteItem
  };
})();