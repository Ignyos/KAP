(function () {
  var RECIPE_TYPE = 'Recipe';

  function nowIso() {
    return new Date().toISOString();
  }

  function ensureValidRecipeName(name) {
    var trimmed = (name || '').trim();
    if (!trimmed) {
      throw new Error('Recipe name is required.');
    }

    return trimmed;
  }

  function ensureValidInstructionText(text) {
    var trimmed = String(text || '').trim();
    if (!trimmed) {
      throw new Error('Instruction text is required.');
    }

    return trimmed;
  }

  function normalizeRecipeDescription(description) {
    return window.KaPItemEntryRules.normalizeDescription(description);
  }

  function sortByNameAscending(records) {
    return (records || []).slice().sort(function (a, b) {
      return String((a && a.name) || '').localeCompare(String((b && b.name) || ''), undefined, {
        sensitivity: 'base'
      });
    });
  }

  function sortByVersionNumberAscending(records) {
    return (records || []).slice().sort(function (a, b) {
      return Number((a && a.versionNumber) || 0) - Number((b && b.versionNumber) || 0);
    });
  }

  function sortByStepNumberAscending(records) {
    return (records || []).slice().sort(function (a, b) {
      return Number((a && a.stepNumber) || 0) - Number((b && b.stepNumber) || 0);
    });
  }

  function cloneSnapshotItems(snapshotItems) {
    return (snapshotItems || []).map(function (entry) {
      return {
        itemId: String((entry && entry.itemId) || ''),
        name: String((entry && entry.name) || ''),
        quantity: entry && entry.quantity == null ? null : Number(entry.quantity),
        description: String((entry && entry.description) || ''),
        categoryId: String((entry && entry.categoryId) || ''),
        categoryName: String((entry && entry.categoryName) || '')
      };
    });
  }

  function cloneSnapshotInstructions(snapshotInstructions) {
    return sortByStepNumberAscending((snapshotInstructions || []).map(function (entry) {
      return {
        instructionId: String((entry && entry.instructionId) || ''),
        stepNumber: Number((entry && entry.stepNumber) || 0),
        text: String((entry && entry.text) || '').trim()
      };
    }));
  }

  function normalizeVersionRecord(record) {
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      recipeId: record.recipeId,
      versionNumber: Number(record.versionNumber || 0),
      parentVersionId: String(record.parentVersionId || ''),
      createdDate: String(record.createdDate || ''),
      updatedDate: String(record.updatedDate || ''),
      versionNote: String(record.versionNote || ''),
      snapshotItems: cloneSnapshotItems(record.snapshotItems),
      snapshotInstructions: cloneSnapshotInstructions(record.snapshotInstructions)
    };
  }

  async function requireRecipeById(recipeId) {
    var record = await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.LIST_RECORDS, recipeId);
    if (!record || record.type !== RECIPE_TYPE) {
      throw new Error('Recipe not found.');
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

  async function touchRecipe(recipeId) {
    var recipe = await requireRecipeById(recipeId);
    recipe.updatedDate = nowIso();
    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORDS, recipe);
    return recipe;
  }

  async function readJoinRecordsByRecipeId(recipeId) {
    return window.KaPDB.readAllFromIndex(
      window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS,
      window.KaPStores.INDEX_NAMES.LIST_RECORD_ITEMS_BY_LIST_RECORD_ID,
      recipeId
    );
  }

  async function readInstructionRecordsByRecipeId(recipeId) {
    return window.KaPDB.readAllFromIndex(
      window.KaPStores.STORE_NAMES.RECIPE_INSTRUCTIONS,
      window.KaPStores.INDEX_NAMES.RECIPE_INSTRUCTIONS_BY_RECIPE_ID,
      recipeId
    );
  }

  async function findJoinRecordById(recipeId, recipeItemId) {
    var joinRecords = await readJoinRecordsByRecipeId(recipeId);
    return joinRecords.find(function (record) {
      return record.id === recipeItemId;
    }) || null;
  }

  async function findInstructionById(recipeId, instructionId) {
    var instructionRecords = await readInstructionRecordsByRecipeId(recipeId);
    return instructionRecords.find(function (instruction) {
      return instruction.id === instructionId;
    }) || null;
  }

  function resequenceInstructions(instructionRecords) {
    return (instructionRecords || []).map(function (instruction, index) {
      return {
        id: instruction.id,
        recipeId: instruction.recipeId,
        stepNumber: index + 1,
        text: ensureValidInstructionText(instruction.text),
        createdDate: instruction.createdDate || nowIso(),
        updatedDate: nowIso()
      };
    });
  }

  async function persistInstructionList(instructionRecords) {
    for (var i = 0; i < instructionRecords.length; i++) {
      await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.RECIPE_INSTRUCTIONS, instructionRecords[i]);
    }
  }

  async function getAllRecipes() {
    var records = await window.KaPDB.readAllFromIndex(
      window.KaPStores.STORE_NAMES.LIST_RECORDS,
      window.KaPStores.INDEX_NAMES.LIST_RECORDS_BY_TYPE,
      RECIPE_TYPE
    );

    return sortByNameAscending(records);
  }

  async function getRecipeItems(recipeId) {
    await requireRecipeById(recipeId);
    var joinRecords = await readJoinRecordsByRecipeId(recipeId);
    var detailItems = await Promise.all(
      joinRecords.map(async function (joinRecord) {
        var item = joinRecord.itemId
          ? await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.ITEMS, joinRecord.itemId)
          : null;

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
          categoryId: (item && item.categoryId) || '',
          categoryName: (item && item.categoryName) || '',
          item: item || null
        };
      })
    );

    return sortByNameAscending(detailItems);
  }

  async function getRecipeInstructions(recipeId) {
    await requireRecipeById(recipeId);
    var instructionRecords = await readInstructionRecordsByRecipeId(recipeId);
    return sortByStepNumberAscending(instructionRecords).map(function (instruction) {
      return {
        id: instruction.id,
        recipeId: instruction.recipeId,
        stepNumber: Number(instruction.stepNumber || 0),
        text: String(instruction.text || ''),
        createdDate: String(instruction.createdDate || ''),
        updatedDate: String(instruction.updatedDate || '')
      };
    });
  }

  async function getRecipeVersions(recipeId) {
    await ensureRecipeHasVersion(recipeId);

    var versions = await window.KaPDB.readAllFromIndex(
      window.KaPStores.STORE_NAMES.RECIPE_VERSIONS,
      window.KaPStores.INDEX_NAMES.RECIPE_VERSIONS_BY_RECIPE_ID,
      recipeId
    );

    return sortByVersionNumberAscending(versions).map(normalizeVersionRecord);
  }

  async function getLatestRecipeVersion(recipeId) {
    var versions = await getRecipeVersions(recipeId);
    return versions.length > 0 ? versions[versions.length - 1] : null;
  }

  async function getRecipeVersionByNumber(recipeId, versionNumber) {
    await ensureRecipeHasVersion(recipeId);
    var matching = await window.KaPDB.readAllFromIndex(
      window.KaPStores.STORE_NAMES.RECIPE_VERSIONS,
      window.KaPStores.INDEX_NAMES.RECIPE_VERSIONS_BY_RECIPE_AND_VERSION,
      [recipeId, Number(versionNumber)]
    );

    return normalizeVersionRecord((matching || [])[0] || null);
  }

  async function syncLatestVersionSnapshot(recipeId) {
    await ensureRecipeHasVersion(recipeId);
    var latestVersion = await getLatestRecipeVersion(recipeId);
    if (!latestVersion) {
      return null;
    }

    var detailItems = await getRecipeItems(recipeId);
    var instructionRecords = await getRecipeInstructions(recipeId);

    latestVersion.snapshotItems = detailItems.map(function (detailItem) {
      return {
        itemId: detailItem.itemId || '',
        name: detailItem.name || '',
        quantity: detailItem.quantity,
        description: detailItem.description || '',
        categoryId: detailItem.categoryId || '',
        categoryName: detailItem.categoryName || ''
      };
    });

    latestVersion.snapshotInstructions = instructionRecords.map(function (instruction) {
      return {
        instructionId: instruction.id,
        stepNumber: Number(instruction.stepNumber || 0),
        text: instruction.text || ''
      };
    });

    latestVersion.updatedDate = nowIso();
    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.RECIPE_VERSIONS, latestVersion);
    await touchRecipe(recipeId);
    return normalizeVersionRecord(latestVersion);
  }

  async function createInitialRecipeVersion(recipeRecord) {
    var versionRecord = {
      id: window.KaPIds.NewId(),
      recipeId: recipeRecord.id,
      versionNumber: 1,
      parentVersionId: '',
      createdDate: recipeRecord.createdDate,
      updatedDate: recipeRecord.updatedDate,
      versionNote: '',
      snapshotItems: [],
      snapshotInstructions: []
    };

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.RECIPE_VERSIONS, versionRecord);
    return versionRecord;
  }

  async function ensureRecipeHasVersion(recipeId) {
    var recipeRecord = await requireRecipeById(recipeId);
    var versions = await window.KaPDB.readAllFromIndex(
      window.KaPStores.STORE_NAMES.RECIPE_VERSIONS,
      window.KaPStores.INDEX_NAMES.RECIPE_VERSIONS_BY_RECIPE_ID,
      recipeId
    );

    if ((versions || []).length > 0) {
      return;
    }

    await createInitialRecipeVersion(recipeRecord);
    await syncLatestVersionSnapshot(recipeId);
  }

  async function createRecipe(name) {
    var safeName = ensureValidRecipeName(name);
    var timestamp = nowIso();

    var record = {
      id: window.KaPIds.NewId(),
      name: safeName,
      description: '',
      type: RECIPE_TYPE,
      createdDate: timestamp,
      updatedDate: timestamp
    };

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORDS, record);
    await createInitialRecipeVersion(record);
    return record;
  }

  async function renameRecipe(id, nextName) {
    var safeName = ensureValidRecipeName(nextName);
    var record = await requireRecipeById(id);

    record.name = safeName;
    record.updatedDate = nowIso();

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORDS, record);
    return record;
  }

  async function updateRecipeDescription(id, nextDescription) {
    var record = await requireRecipeById(id);
    record.description = normalizeRecipeDescription(nextDescription);
    record.updatedDate = nowIso();

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORDS, record);
    return record;
  }

  async function deleteRecipe(id) {
    await requireRecipeById(id);

    var versions = await window.KaPDB.readAllFromIndex(
      window.KaPStores.STORE_NAMES.RECIPE_VERSIONS,
      window.KaPStores.INDEX_NAMES.RECIPE_VERSIONS_BY_RECIPE_ID,
      id
    );
    var joinRecords = await readJoinRecordsByRecipeId(id);
    var instructionRecords = await readInstructionRecordsByRecipeId(id);

    await Promise.all(joinRecords.map(function (joinRecord) {
      return window.KaPDB.remove(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, joinRecord.id);
    }));

    await Promise.all(instructionRecords.map(function (instruction) {
      return window.KaPDB.remove(window.KaPStores.STORE_NAMES.RECIPE_INSTRUCTIONS, instruction.id);
    }));

    await Promise.all(versions.map(function (version) {
      return window.KaPDB.remove(window.KaPStores.STORE_NAMES.RECIPE_VERSIONS, version.id);
    }));

    await window.KaPDB.remove(window.KaPStores.STORE_NAMES.LIST_RECORDS, id);
  }

  async function getRecipeItemCount(recipeId) {
    await requireRecipeById(recipeId);
    var joinRecords = await readJoinRecordsByRecipeId(recipeId);
    return joinRecords.length;
  }

  async function getRecipeInstructionCount(recipeId) {
    await requireRecipeById(recipeId);
    var instructionRecords = await readInstructionRecordsByRecipeId(recipeId);
    return instructionRecords.length;
  }

  async function addItemToRecipe(recipeId, itemId, name, quantity, description) {
    await requireRecipeById(recipeId);
    var safeName = window.KaPItemEntryRules.ensureValidItemEntryName(name);
    var joinRecords = await readJoinRecordsByRecipeId(recipeId);
    var existingByName = window.KaPItemEntryRules.findJoinRecordByName(joinRecords, safeName);

    if (existingByName) {
      existingByName.quantity = window.KaPItemEntryRules.incrementQuantity(existingByName.quantity);
      await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, existingByName);
      await syncLatestVersionSnapshot(recipeId);
      return existingByName;
    }

    await requireItemById(itemId);
    var joinRecord = {
      id: window.KaPIds.NewId(),
      listRecordId: recipeId,
      itemId: itemId,
      name: safeName,
      quantity: window.KaPItemEntryRules.normalizeOptionalIntegerQuantity(quantity),
      description: window.KaPItemEntryRules.normalizeDescription(description)
    };

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, joinRecord);
    await syncLatestVersionSnapshot(recipeId);
    return joinRecord;
  }

  async function updateRecipeItem(recipeId, recipeItemId, name, quantity, description) {
    await requireRecipeById(recipeId);
    var existing = await findJoinRecordById(recipeId, recipeItemId);
    if (!existing) {
      throw new Error('Recipe item not found.');
    }

    existing.name = window.KaPItemEntryRules.ensureValidItemEntryName(name);
    existing.quantity = window.KaPItemEntryRules.normalizeOptionalIntegerQuantity(quantity);
    existing.description = window.KaPItemEntryRules.normalizeDescription(description);

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, existing);
    await syncLatestVersionSnapshot(recipeId);
    return existing;
  }

  async function removeItemFromRecipe(recipeId, recipeItemId) {
    await requireRecipeById(recipeId);
    var existing = await findJoinRecordById(recipeId, recipeItemId);
    if (!existing) {
      return;
    }

    await window.KaPDB.remove(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, existing.id);
    await syncLatestVersionSnapshot(recipeId);
  }

  async function incrementRecipeItemQuantity(recipeId, recipeItemId) {
    await requireRecipeById(recipeId);
    var existing = await findJoinRecordById(recipeId, recipeItemId);
    if (!existing) {
      throw new Error('Recipe item not found.');
    }

    var current = existing.quantity == null ? 1 : existing.quantity;
    existing.quantity = current + 1;
    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, existing);
    await syncLatestVersionSnapshot(recipeId);
    return existing;
  }

  async function decrementRecipeItemQuantity(recipeId, recipeItemId) {
    await requireRecipeById(recipeId);
    var existing = await findJoinRecordById(recipeId, recipeItemId);
    if (!existing) {
      throw new Error('Recipe item not found.');
    }

    var current = existing.quantity == null ? 1 : existing.quantity;
    existing.quantity = Math.max(1, current - 1);
    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, existing);
    await syncLatestVersionSnapshot(recipeId);
    return existing;
  }

  async function addInstructionToRecipe(recipeId, text) {
    await requireRecipeById(recipeId);
    var safeText = ensureValidInstructionText(text);
    var instructions = await getRecipeInstructions(recipeId);
    var nextStepNumber = instructions.length + 1;

    var instruction = {
      id: window.KaPIds.NewId(),
      recipeId: recipeId,
      stepNumber: nextStepNumber,
      text: safeText,
      createdDate: nowIso(),
      updatedDate: nowIso()
    };

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.RECIPE_INSTRUCTIONS, instruction);
    await syncLatestVersionSnapshot(recipeId);
    return instruction;
  }

  async function updateRecipeInstruction(recipeId, instructionId, text) {
    await requireRecipeById(recipeId);
    var existing = await findInstructionById(recipeId, instructionId);
    if (!existing) {
      throw new Error('Instruction not found.');
    }

    existing.text = ensureValidInstructionText(text);
    existing.updatedDate = nowIso();
    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.RECIPE_INSTRUCTIONS, existing);
    await syncLatestVersionSnapshot(recipeId);
    return existing;
  }

  async function removeRecipeInstruction(recipeId, instructionId) {
    await requireRecipeById(recipeId);
    var existing = await findInstructionById(recipeId, instructionId);
    if (!existing) {
      return;
    }

    await window.KaPDB.remove(window.KaPStores.STORE_NAMES.RECIPE_INSTRUCTIONS, instructionId);
    var remaining = await readInstructionRecordsByRecipeId(recipeId);
    var resequenced = resequenceInstructions(sortByStepNumberAscending(remaining));
    await persistInstructionList(resequenced);
    await syncLatestVersionSnapshot(recipeId);
  }

  async function moveRecipeInstruction(recipeId, instructionId, direction) {
    await requireRecipeById(recipeId);
    var instructions = await getRecipeInstructions(recipeId);
    var currentIndex = instructions.findIndex(function (instruction) {
      return instruction.id === instructionId;
    });

    if (currentIndex < 0) {
      throw new Error('Instruction not found.');
    }

    var delta = direction === 'up' ? -1 : 1;
    var targetIndex = currentIndex + delta;
    if (targetIndex < 0 || targetIndex >= instructions.length) {
      return instructions;
    }

    var moved = instructions[currentIndex];
    instructions[currentIndex] = instructions[targetIndex];
    instructions[targetIndex] = moved;

    var resequenced = resequenceInstructions(instructions);
    await persistInstructionList(resequenced);
    await syncLatestVersionSnapshot(recipeId);
    return sortByStepNumberAscending(resequenced);
  }

  async function replaceRecipeItemsFromSnapshot(recipeId, snapshotItems) {
    var currentJoinRecords = await readJoinRecordsByRecipeId(recipeId);
    await Promise.all(currentJoinRecords.map(function (joinRecord) {
      return window.KaPDB.remove(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, joinRecord.id);
    }));

    var clonedItems = cloneSnapshotItems(snapshotItems);
    for (var i = 0; i < clonedItems.length; i++) {
      var snapshotItem = clonedItems[i];
      var itemId = snapshotItem.itemId;
      var existingItem = itemId
        ? await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.ITEMS, itemId)
        : null;

      if (!existingItem) {
        var createdItem = await window.KaPItemsService.createItem(
          snapshotItem.name,
          snapshotItem.description,
          snapshotItem.categoryId,
          snapshotItem.categoryName
        );
        itemId = createdItem.id;
      }

      var joinRecord = {
        id: window.KaPIds.NewId(),
        listRecordId: recipeId,
        itemId: itemId,
        name: snapshotItem.name,
        quantity: snapshotItem.quantity,
        description: snapshotItem.description
      };

      await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.LIST_RECORD_ITEMS, joinRecord);
    }
  }

  async function replaceRecipeInstructionsFromSnapshot(recipeId, snapshotInstructions) {
    var existingInstructions = await readInstructionRecordsByRecipeId(recipeId);
    await Promise.all(existingInstructions.map(function (instruction) {
      return window.KaPDB.remove(window.KaPStores.STORE_NAMES.RECIPE_INSTRUCTIONS, instruction.id);
    }));

    var clonedInstructions = cloneSnapshotInstructions(snapshotInstructions);
    for (var i = 0; i < clonedInstructions.length; i++) {
      var snapshotInstruction = clonedInstructions[i];
      var instructionRecord = {
        id: snapshotInstruction.instructionId || window.KaPIds.NewId(),
        recipeId: recipeId,
        stepNumber: Number(snapshotInstruction.stepNumber || i + 1),
        text: ensureValidInstructionText(snapshotInstruction.text),
        createdDate: nowIso(),
        updatedDate: nowIso()
      };

      await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.RECIPE_INSTRUCTIONS, instructionRecord);
    }

    var persistedInstructions = await readInstructionRecordsByRecipeId(recipeId);
    var resequenced = resequenceInstructions(sortByStepNumberAscending(persistedInstructions));
    await persistInstructionList(resequenced);
  }

  async function createNewVersion(recipeId, versionNote, sourceVersionId) {
    await ensureRecipeHasVersion(recipeId);
    var sourceVersion = sourceVersionId
      ? await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.RECIPE_VERSIONS, sourceVersionId)
      : await getLatestRecipeVersion(recipeId);

    if (!sourceVersion || sourceVersion.recipeId !== recipeId) {
      throw new Error('Recipe version not found.');
    }

    var latestVersion = await getLatestRecipeVersion(recipeId);
    var nextVersionNumber = Number((latestVersion && latestVersion.versionNumber) || 0) + 1;
    var nextVersion = {
      id: window.KaPIds.NewId(),
      recipeId: recipeId,
      versionNumber: nextVersionNumber,
      parentVersionId: sourceVersion.id,
      createdDate: nowIso(),
      updatedDate: nowIso(),
      versionNote: String(versionNote || '').trim(),
      snapshotItems: cloneSnapshotItems(sourceVersion.snapshotItems),
      snapshotInstructions: cloneSnapshotInstructions(sourceVersion.snapshotInstructions)
    };

    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.RECIPE_VERSIONS, nextVersion);
    await replaceRecipeItemsFromSnapshot(recipeId, nextVersion.snapshotItems);
    await replaceRecipeInstructionsFromSnapshot(recipeId, nextVersion.snapshotInstructions);
    await syncLatestVersionSnapshot(recipeId);
    return getRecipeVersionByNumber(recipeId, nextVersionNumber);
  }

  async function updateVersionNote(recipeId, versionId, noteText) {
    await ensureRecipeHasVersion(recipeId);
    var version = await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.RECIPE_VERSIONS, versionId);
    if (!version || version.recipeId !== recipeId) {
      throw new Error('Recipe version not found.');
    }

    version.versionNote = String(noteText || '').trim();
    version.updatedDate = nowIso();
    await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.RECIPE_VERSIONS, version);
    return normalizeVersionRecord(version);
  }

  async function cloneRecipe(recipeId, sourceVersionId, cloneName) {
    var sourceRecipe = await requireRecipeById(recipeId);
    var sourceVersion = sourceVersionId
      ? await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.RECIPE_VERSIONS, sourceVersionId)
      : await getLatestRecipeVersion(recipeId);

    if (!sourceVersion || sourceVersion.recipeId !== sourceRecipe.id) {
      throw new Error('Recipe version not found.');
    }

    var clonedRecipe = await createRecipe(cloneName || (sourceRecipe.name + ' - copy'));
    await replaceRecipeItemsFromSnapshot(clonedRecipe.id, sourceVersion.snapshotItems);
    await replaceRecipeInstructionsFromSnapshot(clonedRecipe.id, sourceVersion.snapshotInstructions);

    var clonedVersion = await syncLatestVersionSnapshot(clonedRecipe.id);
    if (clonedVersion) {
      clonedVersion.versionNote = 'Clone of ' + sourceRecipe.name + ' on ' + new Date().toLocaleString() + '.';
      clonedVersion.updatedDate = nowIso();
      await window.KaPDB.upsert(window.KaPStores.STORE_NAMES.RECIPE_VERSIONS, clonedVersion);
    }

    return clonedRecipe;
  }

  window.KaPRecipesService = {
    getAllRecipes: getAllRecipes,
    createRecipe: createRecipe,
    renameRecipe: renameRecipe,
    updateRecipeDescription: updateRecipeDescription,
    deleteRecipe: deleteRecipe,
    getRecipeItemCount: getRecipeItemCount,
    getRecipeInstructionCount: getRecipeInstructionCount,
    getRecipeItems: getRecipeItems,
    getRecipeInstructions: getRecipeInstructions,
    addItemToRecipe: addItemToRecipe,
    updateRecipeItem: updateRecipeItem,
    removeItemFromRecipe: removeItemFromRecipe,
    incrementRecipeItemQuantity: incrementRecipeItemQuantity,
    decrementRecipeItemQuantity: decrementRecipeItemQuantity,
    addInstructionToRecipe: addInstructionToRecipe,
    updateRecipeInstruction: updateRecipeInstruction,
    removeRecipeInstruction: removeRecipeInstruction,
    moveRecipeInstruction: moveRecipeInstruction,
    getRecipeVersions: getRecipeVersions,
    getLatestRecipeVersion: getLatestRecipeVersion,
    getRecipeVersionByNumber: getRecipeVersionByNumber,
    createNewVersion: createNewVersion,
    updateVersionNote: updateVersionNote,
    cloneRecipe: cloneRecipe
  };
})();