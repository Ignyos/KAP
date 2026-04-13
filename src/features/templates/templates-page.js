(function () {
  async function showError(message) {
    await window.KaPUI.ShowAlert({ title: 'Error', message: message });
  }

  async function createTemplate() {
    var name = await window.KaPUI.ShowPrompt({
      title: 'New Pantry Entry',
      placeholder: 'e.g. Pantry staples, or Fridge essentials',
      confirmLabel: 'Create'
    });
    if (name === null) {
      return;
    }

    try {
      await window.KaPTemplatesService.createTemplate(name);
    } catch (error) {
      await showError(error.message || 'Unable to create pantry entry.');
    }
  }

  async function renameTemplate(record) {
    var nextName = await window.KaPUI.ShowPrompt({
      title: 'Edit Pantry Entry',
      placeholder: 'Pantry entry name',
      value: record.name,
      confirmLabel: 'Save'
    });
    if (nextName === null) {
      return null;
    }

    try {
      return await window.KaPTemplatesService.renameTemplate(record.id, nextName);
    } catch (error) {
      await showError(error.message || 'Unable to update pantry entry.');
      return null;
    }
  }

  async function deleteTemplate(record) {
    var confirmed = await window.KaPUI.ShowConfirm({
      title: 'Delete Pantry Entry',
      message: 'Delete "' + record.name + '"?',
      confirmLabel: 'Delete',
      isDanger: true
    });
    if (!confirmed) {
      return false;
    }

    try {
      await window.KaPTemplatesService.deleteTemplate(record.id);
      return true;
    } catch (error) {
      await showError(error.message || 'Unable to delete pantry entry.');
      return false;
    }
  }

  async function addTemplateItemWithDiscoveryModal(templateRecord, detailItems) {
    var result = await window.KaPUI.ShowDiscoveryItemModal(window.KaPItemDiscovery.buildAddItemModalOptions({
      title: 'Add Item to Pantry Entry',
      currentContextLabel: 'template',
      detailItems: detailItems
    }));

    if (result === null) {
      return;
    }

    try {
      await window.KaPTemplatesService.addItemToTemplate(
        templateRecord.id,
        result.item.id,
        result.name,
        result.quantity,
        result.description
      );
    } catch (error) {
      await showError(error.message || 'Unable to add item.');
    }
  }

  async function editTemplateItemWithPrompt(templateRecord, detailItem) {
    var result = await window.KaPUI.ShowDiscoveryItemModal({
      title: 'Edit Item',
      confirmLabel: 'Save',
      itemNamePlaceholder: 'Item name',
      descriptionPlaceholder: 'Item notes',
      initialName: detailItem.name,
      initialDescription: detailItem.description,
      showQuantityField: false,
      enableSuggestions: false
    });

    if (result === null) {
      return;
    }

    try {
      await window.KaPTemplatesService.updateTemplateItem(
        templateRecord.id,
        detailItem.id,
        result.name,
        detailItem.quantity,
        result.description
      );
    } catch (error) {
      await showError(error.message || 'Unable to update item.');
    }
  }

  async function removeTemplateItemWithConfirm(templateRecord, detailItem) {
    var itemName = detailItem.name || 'this item';
    var confirmed = await window.KaPUI.ShowConfirm({
      title: 'Remove Item',
      message: 'Remove "' + itemName + '" from this pantry entry?',
      confirmLabel: 'Remove',
      isDanger: true
    });

    if (!confirmed) {
      return;
    }

    try {
      await window.KaPTemplatesService.removeItemFromTemplate(templateRecord.id, detailItem.id);
    } catch (error) {
      await showError(error.message || 'Unable to remove item.');
    }
  }

  async function renderInto(container, hooks) {
    var records = await window.KaPTemplatesService.getAllTemplates();

    window.KaPUI.ReplaceMainContent(container, {
      emptyStateText: 'No pantry entries yet.',
      records: records,
      rowBuilder: function (record) {
        return window.KaPUI.NewListRecordRow(record, function () {
          hooks.onOpen(record);
        });
      }
    });
  }

  async function renderDetailInto(container, record, hooks) {
    var detailItems = await window.KaPTemplatesService.getTemplateItems(record.id);

    window.KaPUI.ReplaceDetailContent(container, {
      title: record.name,
      emptyStateText: 'No items yet.',
      onBack: hooks.onBack,
      onAddItem: async function () {
        await addTemplateItemWithDiscoveryModal(record, detailItems);
        await renderDetailInto(container, record, hooks);
      },
      detailItems: detailItems,
      itemRowBuilder: function (detailItem) {
        return window.KaPUI.NewDetailItemRow(detailItem, {
          onIncrement: async function () {
            var updated = await window.KaPTemplatesService.incrementTemplateItemQuantity(record.id, detailItem.id);
            detailItem.quantity = updated.quantity;
            return updated.quantity;
          },
          onDecrement: async function () {
            var updated = await window.KaPTemplatesService.decrementTemplateItemQuantity(record.id, detailItem.id);
            detailItem.quantity = updated.quantity;
            return updated.quantity;
          },
          onEdit: async function () {
            await editTemplateItemWithPrompt(record, detailItem);
            await renderDetailInto(container, record, hooks);
          },
          onRemove: async function () {
            await removeTemplateItemWithConfirm(record, detailItem);
            await renderDetailInto(container, record, hooks);
          }
        });
      },
      actions: [
        {
          label: 'Edit',
          onClick: async function () {
            var updated = await renameTemplate(record);
            if (updated) {
              hooks.onAfterChange(updated);
            }
          }
        },
        {
          label: 'Delete',
          isDanger: true,
          onClick: async function () {
            var deleted = await deleteTemplate(record);
            if (deleted) {
              hooks.onDeleted();
            }
          }
        }
      ]
    });
  }

  window.KaPTemplatesPage = {
    createTemplate: createTemplate,
    renderInto: renderInto,
    renderDetailInto: renderDetailInto
  };
})();
