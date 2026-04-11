(function () {
  var TEMPLATE_TYPE = 'Template';

  function nowIso() {
    return new Date().toISOString();
  }

  function ensureValidTemplateName(name) {
    var trimmed = (name || '').trim();
    if (!trimmed) {
      throw new Error('Template name is required.');
    }

    return trimmed;
  }

  async function requireTemplateById(templateId) {
    var record = await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.LIST_RECORDS, templateId);
    if (!record || record.type !== TEMPLATE_TYPE) {
      throw new Error('Template not found.');
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

  async function readJoinRecordsByTemplateId(templateId) {
    return window.KaPDB.readAllFromIndex(
      window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS,
      window.KaPStores.INDEX_NAMES.LIST_RECORD_ITEMS_BY_LIST_RECORD_ID,
      templateId
    );
  }

  async function findJoinRecordById(templateId, templateItemId) {
    var joinRecords = await readJoinRecordsByTemplateId(templateId);
    return joinRecords.find(function (record) {
      return record.id === templateItemId;
    }) || null;
  }

  function sortByNameAscending(records) {
    return records.sort(function (a, b) {
      return String(a.name || '').localeCompare(String(b.name || ''), undefined, {
        sensitivity: 'base'
      });
    });
  }

  async function getAllTemplates() {
    var records = await window.KaPDB.readAllFromIndex(
      window.KaPStores.STORE_NAMES.LIST_RECORDS,
      window.KaPStores.INDEX_NAMES.LIST_RECORDS_BY_TYPE,
      TEMPLATE_TYPE
    );

    return sortByNameAscending(records);
  }

  async function createTemplate(name) {
    var safeName = ensureValidTemplateName(name);
    var timestamp = nowIso();

    var record = {
      id: window.KaPIds.NewId(),
      name: safeName,
      description: '',
      type: TEMPLATE_TYPE,
      createdDate: timestamp,
      updatedDate: timestamp
    };

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORDS, record);
    return record;
  }

  async function renameTemplate(id, nextName) {
    var safeName = ensureValidTemplateName(nextName);
    var record = await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.LIST_RECORDS, id);

    if (!record || record.type !== TEMPLATE_TYPE) {
      throw new Error('Template not found.');
    }

    record.name = safeName;
    record.updatedDate = nowIso();

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORDS, record);
    return record;
  }

  async function deleteTemplate(id) {
    await window.KaPDB.remove(window.KaPStores.STORE_NAMES.LIST_RECORDS, id);
  }

  async function getTemplateItems(templateId) {
    await requireTemplateById(templateId);
    var joinRecords = await readJoinRecordsByTemplateId(templateId);
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

  async function addItemToTemplate(templateId, itemId, name, quantity, description) {
    await requireTemplateById(templateId);
    var safeName = window.KaPItemEntryRules.ensureValidItemEntryName(name);

    var joinRecords = await readJoinRecordsByTemplateId(templateId);
    var existingByName = window.KaPItemEntryRules.findJoinRecordByName(joinRecords, safeName);

    if (existingByName) {
      existingByName.quantity = window.KaPItemEntryRules.incrementQuantity(existingByName.quantity);
      await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, existingByName);
      return existingByName;
    }

    await requireItemById(itemId);
    var joinRecord = {
      id: window.KaPIds.NewId(),
      listRecordId: templateId,
      itemId: itemId,
      name: safeName,
      quantity: window.KaPItemEntryRules.normalizeOptionalIntegerQuantity(quantity),
      description: window.KaPItemEntryRules.normalizeDescription(description)
    };

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, joinRecord);
    return joinRecord;
  }

  async function updateTemplateItem(templateId, templateItemId, name, quantity, description) {
    await requireTemplateById(templateId);
    var existing = await findJoinRecordById(templateId, templateItemId);
    if (!existing) {
      throw new Error('Template item not found.');
    }

    existing.name = window.KaPItemEntryRules.ensureValidItemEntryName(name);
    existing.quantity = window.KaPItemEntryRules.normalizeOptionalIntegerQuantity(quantity);
    existing.description = window.KaPItemEntryRules.normalizeDescription(description);

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, existing);
    return existing;
  }

  async function removeItemFromTemplate(templateId, templateItemId) {
    await requireTemplateById(templateId);
    var existing = await findJoinRecordById(templateId, templateItemId);
    if (!existing) {
      return;
    }

    await window.KaPDB.remove(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, existing.id);
  }

  window.KaPTemplatesService = {
    getAllTemplates: getAllTemplates,
    createTemplate: createTemplate,
    renameTemplate: renameTemplate,
    deleteTemplate: deleteTemplate,
    getTemplateItems: getTemplateItems,
    addItemToTemplate: addItemToTemplate,
    updateTemplateItem: updateTemplateItem,
    removeItemFromTemplate: removeItemFromTemplate
  };
})();
