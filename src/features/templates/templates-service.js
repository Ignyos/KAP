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

  function sortByUpdatedDateDescending(records) {
    return records.sort(function (a, b) {
      return String(b.updatedDate).localeCompare(String(a.updatedDate));
    });
  }

  async function getAllTemplates() {
    var records = await window.KaPDB.readAllFromIndex(
      window.KaPStores.STORE_NAMES.LIST_RECORDS,
      window.KaPStores.INDEX_NAMES.LIST_RECORDS_BY_TYPE,
      TEMPLATE_TYPE
    );

    return sortByUpdatedDateDescending(records);
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

  window.KaPTemplatesService = {
    getAllTemplates: getAllTemplates,
    createTemplate: createTemplate,
    renameTemplate: renameTemplate,
    deleteTemplate: deleteTemplate
  };
})();
