(function () {
  function validateOptionalInteger(rawQuantity) {
    var trimmed = String(rawQuantity == null ? '' : rawQuantity).trim();
    if (!trimmed) {
      return { ok: true, value: null };
    }

    if (!/^-?\d+$/.test(trimmed)) {
      return { ok: false, message: 'Quantity must be an integer.' };
    }

    return { ok: true, value: Number(trimmed) };
  }

  async function resolveExactItem(name) {
    var suggestions = await window.KaPItemsService.searchItems(name);
    return suggestions.find(function (item) {
      return String(item.name).toLowerCase() === String(name).toLowerCase();
    }) || null;
  }

  function buildAddItemModalOptions(config) {
    var detailItems = config.detailItems || [];
    var currentContextItemIds = detailItems.map(function (detailItem) {
      return detailItem.itemId;
    });

    return {
      title: config.title,
      confirmLabel: 'Add Item',
      itemNamePlaceholder: 'Search or type item name',
      quantityPlaceholder: 'e.g. 2',
      descriptionPlaceholder: 'Item notes',
      currentContextItemIds: currentContextItemIds,
      currentContextLabel: config.currentContextLabel,
      getAllItems: function () {
        return window.KaPItemsService.getAllItems();
      },
      searchItems: function (query) {
        return window.KaPItemsService.searchItems(query);
      },
      resolveExactItem: resolveExactItem,
      createItem: function (name) {
        return window.KaPItemsService.createItem(name, '');
      },
      deleteItem: function (item) {
        return window.KaPItemsService.deleteItem(item.id);
      },
      validateQuantity: validateOptionalInteger
    };
  }

  window.KaPItemDiscovery = {
    validateOptionalInteger: validateOptionalInteger,
    resolveExactItem: resolveExactItem,
    buildAddItemModalOptions: buildAddItemModalOptions
  };
})();
