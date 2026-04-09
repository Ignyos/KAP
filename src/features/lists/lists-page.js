(function () {
  async function showError(message) {
    await window.KaPUI.ShowAlert({ title: 'Error', message: message });
  }

  async function createList() {
    var name = await window.KaPUI.ShowPrompt({
      title: 'New List',
      placeholder: 'List name',
      confirmLabel: 'Create'
    });
    if (name === null) {
      return;
    }

    try {
      await window.KaPListsService.createList(name);
    } catch (error) {
      await showError(error.message || 'Unable to create list.');
    }
  }

  async function renameList(record) {
    var nextName = await window.KaPUI.ShowPrompt({
      title: 'Rename List',
      placeholder: 'List name',
      value: record.name,
      confirmLabel: 'Rename'
    });
    if (nextName === null) {
      return null;
    }

    try {
      return await window.KaPListsService.renameList(record.id, nextName);
    } catch (error) {
      await showError(error.message || 'Unable to rename list.');
      return null;
    }
  }

  async function deleteList(record) {
    var confirmed = await window.KaPUI.ShowConfirm({
      title: 'Delete List',
      message: 'Delete "' + record.name + '"?',
      confirmLabel: 'Delete',
      isDanger: true
    });
    if (!confirmed) {
      return false;
    }

    try {
      await window.KaPListsService.deleteList(record.id);
      return true;
    } catch (error) {
      await showError(error.message || 'Unable to delete list.');
      return false;
    }
  }

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

  async function addListItemWithDiscoveryModal(listRecord, detailItems) {
    var currentContextItemIds = (detailItems || []).map(function (detailItem) {
      return detailItem.itemId;
    });

    var result = await window.KaPUI.ShowDiscoveryItemModal({
      title: 'Add Item to List',
      confirmLabel: 'Add Item',
      itemNamePlaceholder: 'Search or type item name',
      quantityPlaceholder: 'e.g. 2',
      descriptionPlaceholder: 'Item notes',
      currentContextItemIds: currentContextItemIds,
      currentContextLabel: 'list',
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
    });

    if (result === null) {
      return;
    }

    try {
      await window.KaPListsService.addItemToList(
        listRecord.id,
        result.item.id,
        result.name,
        result.quantity,
        result.description
      );
    } catch (error) {
      await showError(error.message || 'Unable to add item.');
    }
  }

  async function editListItemWithPrompt(listRecord, detailItem) {
    var result = await window.KaPUI.ShowDiscoveryItemModal({
      title: 'Edit Item',
      confirmLabel: 'Save',
      itemNamePlaceholder: 'Item name',
      quantityPlaceholder: 'e.g. 2',
      descriptionPlaceholder: 'Item notes',
      initialName: detailItem.name,
      initialQuantity: detailItem.quantity,
      initialDescription: detailItem.description,
      validateQuantity: validateOptionalInteger,
      enableSuggestions: false
    });

    if (result === null) {
      return;
    }

    try {
      await window.KaPListsService.updateListItem(
        listRecord.id,
        detailItem.id,
        result.name,
        result.quantity,
        result.description
      );
    } catch (error) {
      await showError(error.message || 'Unable to update item.');
    }
  }

  async function removeListItemWithConfirm(listRecord, detailItem) {
    var itemName = detailItem.name || 'this item';
    var confirmed = await window.KaPUI.ShowConfirm({
      title: 'Remove Item',
      message: 'Remove "' + itemName + '" from this list?',
      confirmLabel: 'Remove',
      isDanger: true
    });

    if (!confirmed) {
      return;
    }

    try {
      await window.KaPListsService.removeItemFromList(listRecord.id, detailItem.id);
    } catch (error) {
      await showError(error.message || 'Unable to remove item.');
    }
  }

  async function renderInto(container, hooks) {
    var records = await window.KaPListsService.getAllLists();

    window.KaPUI.ReplaceMainContent(container, {
      emptyStateText: 'No lists yet.',
      records: records,
      rowBuilder: function (record) {
        return window.KaPUI.NewListRecordRow(record, function () {
          hooks.onOpen(record);
        });
      }
    });
  }

  async function renderDetailInto(container, record, hooks) {
    var detailItems = await window.KaPListsService.getListItems(record.id);

    window.KaPUI.ReplaceDetailContent(container, {
      title: record.name,
      emptyStateText: 'No items yet.',
      onBack: hooks.onBack,
      onAddItem: async function () {
        await addListItemWithDiscoveryModal(record, detailItems);
        await renderDetailInto(container, record, hooks);
      },
      detailItems: detailItems,
      itemRowBuilder: function (detailItem) {
        return window.KaPUI.NewDetailItemRow(detailItem, {
          onEdit: async function () {
            await editListItemWithPrompt(record, detailItem);
            await renderDetailInto(container, record, hooks);
          },
          onRemove: async function () {
            await removeListItemWithConfirm(record, detailItem);
            await renderDetailInto(container, record, hooks);
          }
        });
      },
      actions: [
        {
          label: 'Rename',
          onClick: async function () {
            var updated = await renameList(record);
            if (updated) {
              hooks.onAfterChange(updated);
            }
          }
        },
        {
          label: 'Delete',
          isDanger: true,
          onClick: async function () {
            var deleted = await deleteList(record);
            if (deleted) {
              hooks.onDeleted();
            }
          }
        }
      ]
    });
  }

  window.KaPListsPage = {
    createList: createList,
    renderInto: renderInto,
    renderDetailInto: renderDetailInto
  };
})();
