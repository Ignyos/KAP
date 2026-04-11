(function () {
  async function showError(message) {
    await window.KaPUI.ShowAlert({ title: 'Error', message: message });
  }

  async function createList() {
    var name = await window.KaPUI.ShowPrompt({
      title: 'New Grocery List',
      placeholder: 'Grocery list name',
      confirmLabel: 'Create'
    });
    if (name === null) {
      return;
    }

    try {
      await window.KaPListsService.createList(name);
    } catch (error) {
      await showError(error.message || 'Unable to create grocery list.');
    }
  }

  async function renameList(record) {
    var nextName = await window.KaPUI.ShowPrompt({
      title: 'Edit Grocery List',
      placeholder: 'Grocery list name',
      value: record.name,
      confirmLabel: 'Save'
    });
    if (nextName === null) {
      return null;
    }

    try {
      return await window.KaPListsService.renameList(record.id, nextName);
    } catch (error) {
      await showError(error.message || 'Unable to update grocery list.');
      return null;
    }
  }

  async function deleteList(record) {
    var confirmed = await window.KaPUI.ShowConfirm({
      title: 'Delete Grocery List',
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
      await showError(error.message || 'Unable to delete grocery list.');
      return false;
    }
  }

  async function addListItemWithDiscoveryModal(listRecord, detailItems) {
    var result = await window.KaPUI.ShowDiscoveryItemModal(window.KaPItemDiscovery.buildAddItemModalOptions({
      title: 'Add Item to Grocery List',
      currentContextLabel: 'list',
      detailItems: detailItems
    }));

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
      validateQuantity: window.KaPItemDiscovery.validateOptionalInteger,
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
      message: 'Remove "' + itemName + '" from this grocery list?',
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
      emptyStateText: 'No grocery lists yet.',
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
          label: 'Edit',
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
