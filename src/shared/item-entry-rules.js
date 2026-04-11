(function () {
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

  function normalizeNameKey(name) {
    return String(name || '').trim().toLowerCase();
  }

  function findJoinRecordByName(joinRecords, name) {
    var nameKey = normalizeNameKey(name);
    return (joinRecords || []).find(function (record) {
      return normalizeNameKey(record && record.name) === nameKey;
    }) || null;
  }

  function incrementQuantity(currentQuantity) {
    return currentQuantity == null ? 1 : currentQuantity + 1;
  }

  window.KaPItemEntryRules = {
    ensureValidItemEntryName: ensureValidItemEntryName,
    normalizeDescription: normalizeDescription,
    normalizeOptionalIntegerQuantity: normalizeOptionalIntegerQuantity,
    findJoinRecordByName: findJoinRecordByName,
    incrementQuantity: incrementQuantity
  };
})();
