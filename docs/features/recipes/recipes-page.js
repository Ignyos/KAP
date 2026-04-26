(function () {
  var VERSION_ACCORDION_STATE_KEY = 'kap.recipeVersionAccordionState';
  var DESCRIPTION_ACCORDION_STATE_KEY = 'kap.recipeDescriptionAccordionState';
  var LAST_VIEWED_VERSION_KEY = 'kap.recipeLastViewedVersion';
  var versionNoteFocusTargets = {};

  async function showError(message) {
    await window.KaPUI.ShowAlert({ title: 'Error', message: message });
  }

  function readAccordionState(storageKey) {
    try {
      var raw = sessionStorage.getItem(storageKey);
      if (!raw) {
        return {};
      }

      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function writeAccordionState(storageKey, state) {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state || {}));
    } catch (error) {
      // Ignore session persistence failures and keep the current in-memory render behavior.
    }
  }

  function isAccordionExpanded(storageKey, recipeId) {
    var state = readAccordionState(storageKey);
    if (Object.prototype.hasOwnProperty.call(state, recipeId)) {
      return !!state[recipeId];
    }

    return false;
  }

  function setAccordionExpanded(storageKey, recipeId, isExpanded) {
    var state = readAccordionState(storageKey);
    state[recipeId] = !!isExpanded;
    writeAccordionState(storageKey, state);
  }

  function isVersionAccordionExpanded(recipeId) {
    return isAccordionExpanded(VERSION_ACCORDION_STATE_KEY, recipeId);
  }

  function setVersionAccordionExpanded(recipeId, isExpanded) {
    setAccordionExpanded(VERSION_ACCORDION_STATE_KEY, recipeId, isExpanded);
  }

  function isDescriptionAccordionExpanded(recipeId) {
    return isAccordionExpanded(DESCRIPTION_ACCORDION_STATE_KEY, recipeId);
  }

  function setDescriptionAccordionExpanded(recipeId, isExpanded) {
    setAccordionExpanded(DESCRIPTION_ACCORDION_STATE_KEY, recipeId, isExpanded);
  }

  var recipeEditModeStates = {};

  function isRecipeInEditMode(recipeId, versionNumber) {
    return recipeEditModeStates[recipeId] === Number(versionNumber);
  }

  function setRecipeEditMode(recipeId, versionNumber) {
    recipeEditModeStates[recipeId] = Number(versionNumber);
  }

  function clearRecipeEditMode(recipeId) {
    delete recipeEditModeStates[recipeId];
  }

  function getLastViewedVersionNumber(recipeId) {
    try {
      var raw = sessionStorage.getItem(LAST_VIEWED_VERSION_KEY);
      var state = raw ? JSON.parse(raw) : {};
      var value = state && typeof state === 'object' ? state[recipeId] : undefined;
      return typeof value === 'number' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function setLastViewedVersionNumber(recipeId, versionNumber) {
    try {
      var raw = sessionStorage.getItem(LAST_VIEWED_VERSION_KEY);
      var state = (raw ? JSON.parse(raw) : null) || {};
      state[recipeId] = Number(versionNumber);
      sessionStorage.setItem(LAST_VIEWED_VERSION_KEY, JSON.stringify(state));
    } catch (error) {
      // Ignore session persistence failures.
    }
  }

  function markVersionNoteForFocus(recipeId, versionNumber) {
    versionNoteFocusTargets[recipeId] = Number(versionNumber || 0);
  }

  function shouldFocusVersionNote(recipeId, versionNumber) {
    return Number(versionNoteFocusTargets[recipeId] || 0) === Number(versionNumber || 0);
  }

  function clearVersionNoteFocus(recipeId) {
    delete versionNoteFocusTargets[recipeId];
  }

  async function createRecipe() {
    var name = await window.KaPUI.ShowPrompt({
      title: 'New Recipe',
      placeholder: 'Recipe name',
      confirmLabel: 'Create'
    });
    if (name === null) {
      return;
    }

    try {
      await window.KaPRecipesService.createRecipe(name);
    } catch (error) {
      await showError(error.message || 'Unable to create recipe.');
    }
  }

  async function renameRecipe(record) {
    var nextName = await window.KaPUI.ShowPrompt({
      title: 'Edit Recipe',
      placeholder: 'Recipe name',
      value: record.name,
      confirmLabel: 'Save'
    });
    if (nextName === null) {
      return null;
    }

    try {
      return await window.KaPRecipesService.renameRecipe(record.id, nextName);
    } catch (error) {
      await showError(error.message || 'Unable to update recipe.');
      return null;
    }
  }

  async function deleteRecipe(record) {
    var confirmed = await window.KaPUI.ShowConfirm({
      title: 'Delete Recipe',
      message: 'Delete "' + record.name + '"?',
      confirmLabel: 'Delete',
      isDanger: true
    });
    if (!confirmed) {
      return false;
    }

    try {
      await window.KaPRecipesService.deleteRecipe(record.id);
      return true;
    } catch (error) {
      await showError(error.message || 'Unable to delete recipe.');
      return false;
    }
  }

  async function createNextVersion(recipeRecord, activeVersion) {
    try {
      var createdVersion = await window.KaPRecipesService.createNewVersion(
        recipeRecord.id,
        '',
        activeVersion ? activeVersion.id : ''
      );
      return createdVersion;
    } catch (error) {
      await showError(error.message || 'Unable to create new version.');
      return null;
    }
  }

  async function cloneRecipeFromActiveVersion(recipeRecord, activeVersion, cloneName) {
    try {
      var clonedRecord = await window.KaPRecipesService.cloneRecipe(
        recipeRecord.id,
        activeVersion ? activeVersion.id : '',
        cloneName
      );
      return clonedRecord;
    } catch (error) {
      await showError(error.message || 'Unable to clone recipe.');
      return null;
    }
  }

  async function deleteSelectedVersion(recipeRecord, activeVersion) {
    var confirmed = await window.KaPUI.ShowConfirm({
      title: 'Delete Version',
      message: 'Delete version ' + activeVersion.versionNumber + '? Other version numbers will not change.',
      confirmLabel: 'Delete',
      isDanger: true
    });
    if (!confirmed) {
      return false;
    }

    try {
      await window.KaPRecipesService.deleteRecipeVersion(recipeRecord.id, activeVersion.id);
      return true;
    } catch (error) {
      await showError(error.message || 'Unable to delete version.');
      return false;
    }
  }

  async function addRecipeItemWithDiscoveryModal(recipeRecord, detailItems) {
    var result = await window.KaPUI.ShowDiscoveryItemModal(window.KaPItemDiscovery.buildAddItemModalOptions({
      title: 'Add Ingredient',
      currentContextLabel: 'recipe',
      detailItems: detailItems
    }));

    if (result === null) {
      return;
    }

    try {
      await window.KaPRecipesService.addItemToRecipe(
        recipeRecord.id,
        result.item.id,
        result.name,
        result.quantity,
        result.description
      );

      await window.KaPItemsService.setItemCategory(
        result.item.id,
        result.categoryId || '',
        result.categoryName || '',
        result.name
      );
    } catch (error) {
      await showError(error.message || 'Unable to add ingredient.');
    }
  }

  async function editRecipeItemWithPrompt(recipeRecord, detailItem) {
    var result = await window.KaPUI.ShowDiscoveryItemModal({
      title: 'Edit Ingredient',
      confirmLabel: 'Save',
      itemNamePlaceholder: 'Ingredient name',
      categoryPlaceholder: 'Search or type category',
      descriptionPlaceholder: 'Ingredient notes',
      initialName: detailItem.name,
      initialCategoryId: detailItem.categoryId,
      initialCategoryName: detailItem.categoryName,
      initialDescription: detailItem.description,
      showQuantityField: false,
      showCategoryField: true,
      getAllCategories: function () {
        return window.KaPCategoriesService.getAllCategories();
      },
      searchCategories: function (query) {
        return window.KaPCategoriesService.searchCategories(query);
      },
      resolveExactCategory: function (name) {
        return window.KaPCategoriesService.resolveExactCategory(name);
      },
      createCategory: function (name) {
        return window.KaPCategoriesService.createCategory(name);
      },
      deleteCategory: function (category) {
        return window.KaPCategoriesService.deleteCategory(category.id);
      },
      enableSuggestions: false
    });

    if (result === null) {
      return;
    }

    try {
      await window.KaPRecipesService.updateRecipeItem(
        recipeRecord.id,
        detailItem.id,
        result.name,
        detailItem.quantity,
        result.description
      );

      if (detailItem.itemId) {
        await window.KaPItemsService.setItemCategory(
          detailItem.itemId,
          result.categoryId || '',
          result.categoryName || '',
          result.name
        );
      }
    } catch (error) {
      await showError(error.message || 'Unable to update ingredient.');
    }
  }

  async function removeRecipeItemWithConfirm(recipeRecord, detailItem) {
    var itemName = detailItem.name || 'this ingredient';
    var confirmed = await window.KaPUI.ShowConfirm({
      title: 'Remove Ingredient',
      message: 'Remove "' + itemName + '" from this recipe?',
      confirmLabel: 'Remove',
      isDanger: true
    });

    if (!confirmed) {
      return;
    }

    try {
      await window.KaPRecipesService.removeItemFromRecipe(recipeRecord.id, detailItem.id);
    } catch (error) {
      await showError(error.message || 'Unable to remove ingredient.');
    }
  }

  async function addInstructionWithPrompt(recipeRecord) {
    var stepText = await window.KaPUI.ShowPrompt({
      title: 'Add Step',
      placeholder: 'Describe this cooking step',
      confirmLabel: 'Add'
    });

    if (stepText === null) {
      return false;
    }

    try {
      await window.KaPRecipesService.addInstructionToRecipe(recipeRecord.id, stepText);
      return true;
    } catch (error) {
      await showError(error.message || 'Unable to add instruction.');
      return false;
    }
  }

  async function editInstructionWithPrompt(recipeRecord, instruction) {
    var nextText = await window.KaPUI.ShowPrompt({
      title: 'Edit Step ' + instruction.stepNumber,
      placeholder: 'Describe this cooking step',
      value: instruction.text,
      confirmLabel: 'Save'
    });

    if (nextText === null) {
      return false;
    }

    try {
      await window.KaPRecipesService.updateRecipeInstruction(recipeRecord.id, instruction.id, nextText);
      return true;
    } catch (error) {
      await showError(error.message || 'Unable to update instruction.');
      return false;
    }
  }

  async function removeInstructionWithConfirm(recipeRecord, instruction) {
    var confirmed = await window.KaPUI.ShowConfirm({
      title: 'Remove Step',
      message: 'Remove step ' + instruction.stepNumber + '?',
      confirmLabel: 'Remove',
      isDanger: true
    });

    if (!confirmed) {
      return false;
    }

    try {
      await window.KaPRecipesService.removeRecipeInstruction(recipeRecord.id, instruction.id);
      return true;
    } catch (error) {
      await showError(error.message || 'Unable to remove instruction.');
      return false;
    }
  }

  async function moveInstruction(recipeRecord, instruction, direction) {
    try {
      await window.KaPRecipesService.moveRecipeInstruction(recipeRecord.id, instruction.id, direction);
      return true;
    } catch (error) {
      await showError(error.message || 'Unable to move instruction.');
      return false;
    }
  }

  function sortByNameAscending(records) {
    return (records || []).slice().sort(function (a, b) {
      return String(a.name || '').localeCompare(String(b.name || ''), undefined, {
        sensitivity: 'base'
      });
    });
  }

  function buildRecipeDetailItemRow(recipeRecord, detailItem, container, hooks, selectedVersionNumber) {
    return window.KaPUI.NewDetailItemRow(detailItem, {
      onIncrement: async function () {
        var updated = await window.KaPRecipesService.incrementRecipeItemQuantity(recipeRecord.id, detailItem.id);
        detailItem.quantity = updated.quantity;
        return updated.quantity;
      },
      onDecrement: async function () {
        var updated = await window.KaPRecipesService.decrementRecipeItemQuantity(recipeRecord.id, detailItem.id);
        detailItem.quantity = updated.quantity;
        return updated.quantity;
      },
      onEdit: async function () {
        await editRecipeItemWithPrompt(recipeRecord, detailItem);
        await renderDetailInto(container, recipeRecord, hooks, selectedVersionNumber);
      },
      onRemove: async function () {
        await removeRecipeItemWithConfirm(recipeRecord, detailItem);
        await renderDetailInto(container, recipeRecord, hooks, selectedVersionNumber);
      }
    });
  }

  function buildReadOnlyRecipeDetailItemRow(detailItem) {
    var row = window.KaPUI.NewDetailItemRow(detailItem, null);
    var actionsNode = row.querySelector('.detail-item-actions');
    if (actionsNode) {
      actionsNode.style.display = 'none';
    }

    return row;
  }

  function getDetailItemsFromVersionSnapshot(activeVersion) {
    var snapshotItems = (activeVersion && activeVersion.snapshotItems) || [];
    return snapshotItems.map(function (snapshotItem, index) {
      return {
        id: String(snapshotItem.itemId || '') + '::' + String(index),
        listRecordId: activeVersion.recipeId,
        itemId: snapshotItem.itemId || '',
        name: snapshotItem.name || 'Unknown Item',
        quantity: snapshotItem.quantity,
        description: snapshotItem.description || '',
        categoryId: snapshotItem.categoryId || '',
        categoryName: snapshotItem.categoryName || '',
        item: null
      };
    });
  }

  function getInstructionItemsFromVersionSnapshot(activeVersion) {
    var snapshotInstructions = (activeVersion && activeVersion.snapshotInstructions) || [];
    return snapshotInstructions
      .slice()
      .sort(function (a, b) {
        return Number(a.stepNumber || 0) - Number(b.stepNumber || 0);
      })
      .map(function (snapshotInstruction, index) {
        return {
          id: snapshotInstruction.instructionId || ('snapshot-step-' + String(index)),
          stepNumber: Number(snapshotInstruction.stepNumber || index + 1),
          text: snapshotInstruction.text || ''
        };
      });
  }

  async function chooseVersionNumber(record, activeVersion, availableVersions) {
    var versionInput = await window.KaPUI.ShowPrompt({
      title: 'View Version',
      placeholder: 'Enter version number',
      value: activeVersion ? String(activeVersion.versionNumber) : '',
      confirmLabel: 'View'
    });

    if (versionInput === null) {
      return null;
    }

    var parsedVersionNumber = Number(String(versionInput || '').trim());
    if (!Number.isInteger(parsedVersionNumber) || parsedVersionNumber <= 0) {
      await showError('Version number must be a positive integer.');
      return null;
    }

    var hasVersion = (availableVersions || []).some(function (version) {
      return Number(version.versionNumber || 0) === parsedVersionNumber;
    });

    if (!hasVersion) {
      await showError('Version ' + parsedVersionNumber + ' does not exist for this recipe.');
      return null;
    }

    return parsedVersionNumber;
  }

  function findVersionIndex(availableVersions, activeVersion) {
    return (availableVersions || []).findIndex(function (version) {
      return activeVersion && version.id === activeVersion.id;
    });
  }

  async function promptCloneRecipeName(recipeRecord) {
    return window.KaPUI.ShowRecipeCloneModal({
      title: 'Clone Recipe',
      initialName: recipeRecord.name + ' - copy',
      confirmLabel: 'Clone',
      infoText: 'Cloning a recipe is like making a new copy without the history. For example, you might have a Chicken Tortilla Soup and a vegan friendly variation.'
    });
  }

  function buildAccordionSection(title, isExpanded, onToggle, buildHeaderActions, buildHeaderLead) {
    var section = document.createElement('section');
    section.className = 'recipe-accordion-card';

    var header = document.createElement('div');
    header.className = 'recipe-accordion-header';
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    header.addEventListener('click', function (event) {
      if (event.target.closest('.recipe-accordion-header-actions') || event.target.closest('.recipe-accordion-header-control')) {
        return;
      }

      onToggle();
    });
    header.addEventListener('keydown', function (event) {
      if (event.target.closest('.recipe-accordion-header-actions') || event.target.closest('.recipe-accordion-header-control')) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onToggle();
      }
    });

    if (typeof buildHeaderLead === 'function') {
      var headerLead = buildHeaderLead();
      if (headerLead) {
        headerLead.classList.add('recipe-accordion-header-control');
        header.appendChild(headerLead);
      }
    }

    if (!header.querySelector('.recipe-accordion-header-control')) {
      var headerLabel = document.createElement('span');
      headerLabel.className = 'recipe-accordion-title';
      headerLabel.textContent = title;
      header.appendChild(headerLabel);
    }

    if (typeof buildHeaderActions === 'function') {
      var headerActions = buildHeaderActions();
      if (headerActions) {
        headerActions.classList.add('recipe-accordion-header-actions');
        header.appendChild(headerActions);
      }
    }

    section.appendChild(header);

    var content = document.createElement('div');
    content.className = 'recipe-accordion-content' + (isExpanded ? ' is-expanded' : '');
    if (!isExpanded) {
      content.hidden = true;
    }

    section.appendChild(content);

    return {
      section: section,
      content: content
    };
  }

  function appendVersionsAccordionSection(container, record, hooks, availableVersions, activeVersion, latestVersion, isViewingLatestVersion) {
    var detailShell = container.querySelector('.detail-shell');
    var detailHeader = container.querySelector('.detail-header');
    if (!detailShell || !detailHeader || !activeVersion) {
      return;
    }

    var isExpanded = isVersionAccordionExpanded(record.id);
    var versionSelect = document.createElement('select');
    versionSelect.className = 'recipe-version-select';
    versionSelect.setAttribute('aria-label', 'Select recipe version');
    availableVersions.slice().sort(function (left, right) {
      return Number(right.versionNumber || 0) - Number(left.versionNumber || 0);
    }).forEach(function (version) {
      var option = document.createElement('option');
      option.value = String(version.versionNumber);
      option.textContent = 'Version ' + version.versionNumber + (latestVersion && version.id === latestVersion.id ? ' (Current)' : '');
      option.selected = version.id === activeVersion.id;
      versionSelect.appendChild(option);
    });

    versionSelect.addEventListener('click', function (event) {
      event.stopPropagation();
    });
    versionSelect.addEventListener('keydown', function (event) {
      event.stopPropagation();
    });
    versionSelect.addEventListener('change', async function () {
      await renderDetailInto(container, record, hooks, Number(versionSelect.value));
    });

    var accordion = buildAccordionSection('Versions', isExpanded, function () {
      setVersionAccordionExpanded(record.id, !isExpanded);
      renderDetailInto(container, record, hooks, activeVersion.versionNumber);
    }, function () {
      var actions = document.createElement('div');

      var newVersionButton = document.createElement('button');
      newVersionButton.type = 'button';
      newVersionButton.className = 'accordion-new-button';
      newVersionButton.textContent = '+ New Version';
      newVersionButton.addEventListener('click', async function (event) {
        event.stopPropagation();

        var latestVersionNumber = latestVersion ? latestVersion.versionNumber : null;
        var choice = await window.KaPUI.ShowNewVersionModal({
          availableVersions: availableVersions,
          defaultVersionNumber: activeVersion ? activeVersion.versionNumber : latestVersionNumber,
          latestVersionNumber: latestVersionNumber
        });
        if (!choice) {
          return;
        }

        var baseVersion = availableVersions.find(function (v) {
          return Number(v.versionNumber) === choice.baseVersionNumber;
        });
        var createdVersion = await createNextVersion(record, baseVersion || activeVersion);
        if (createdVersion) {
          setVersionAccordionExpanded(record.id, true);
          markVersionNoteForFocus(record.id, createdVersion.versionNumber);
          await renderDetailInto(container, record, hooks, createdVersion.versionNumber);
        }
      });
      newVersionButton.addEventListener('keydown', function (event) {
        event.stopPropagation();
      });
      actions.appendChild(newVersionButton);

      return actions;
    }, function () {
      if (!isExpanded) {
        return null;
      }

      return versionSelect;
    });
    var section = accordion.section;
    var content = accordion.content;

    var noteSection = document.createElement('div');
    noteSection.className = 'recipe-version-note-section';

    var originalVersionNote = activeVersion.versionNote || '';

    var saveNoteButton = document.createElement('button');
    saveNoteButton.type = 'button';
    saveNoteButton.className = 'recipe-version-save-button';
    saveNoteButton.textContent = 'Save';
    saveNoteButton.disabled = true;

    var noteInput = document.createElement('textarea');
    noteInput.className = 'recipe-version-note-input';
    noteInput.rows = 4;
    noteInput.placeholder = 'Optional note about this version';
    noteInput.value = originalVersionNote;
    noteSection.appendChild(noteInput);

    var saveStatus = document.createElement('span');
    saveStatus.className = 'recipe-version-save-status';
    saveStatus.setAttribute('aria-live', 'polite');

    function updateVersionNoteSaveState() {
      var isDirty = noteInput.value !== originalVersionNote;
      saveNoteButton.disabled = !isDirty;
      if (isDirty) {
        saveStatus.textContent = 'Unsaved changes';
      } else if (!noteInput.value) {
        saveStatus.textContent = 'No note yet.';
      } else {
        saveStatus.textContent = 'Saved';
      }
      saveStatus.classList.toggle('is-dirty', isDirty);
    }

    noteInput.addEventListener('input', updateVersionNoteSaveState);

    saveNoteButton.addEventListener('click', async function () {
      try {
        await window.KaPRecipesService.updateVersionNote(record.id, activeVersion.id, noteInput.value);
        setVersionAccordionExpanded(record.id, true);
        originalVersionNote = noteInput.value;
        activeVersion.versionNote = originalVersionNote;
        updateVersionNoteSaveState();
      } catch (error) {
        await showError(error.message || 'Unable to update version note.');
      }
    });

    updateVersionNoteSaveState();

    content.appendChild(noteSection);

    var cloneRow = document.createElement('div');
    cloneRow.className = 'recipe-version-clone-row';

    var cloneButton = document.createElement('button');
    cloneButton.type = 'button';
    cloneButton.className = 'recipe-version-secondary-button';
    cloneButton.textContent = 'Clone Recipe';
    cloneButton.addEventListener('click', async function () {
      var cloneConfig = await promptCloneRecipeName(record);
      if (!cloneConfig) {
        return;
      }

      var cloned = await cloneRecipeFromActiveVersion(record, activeVersion, cloneConfig.name);
      if (cloned) {
        hooks.onBack();
      }
    });
    cloneRow.appendChild(cloneButton);

    if (!isViewingLatestVersion) {
      var deleteVersionButton = document.createElement('button');
      deleteVersionButton.type = 'button';
      deleteVersionButton.className = 'recipe-version-secondary-button record-action-button--danger';
      deleteVersionButton.textContent = 'Delete Version';
      deleteVersionButton.addEventListener('click', async function () {
        var deleted = await deleteSelectedVersion(record, activeVersion);
        if (deleted) {
          clearRecipeEditMode(record.id);
          setVersionAccordionExpanded(record.id, true);
          await renderDetailInto(container, record, hooks, latestVersion ? latestVersion.versionNumber : null);
        }
      });
      cloneRow.appendChild(deleteVersionButton);
    }

    var cloneInfoWrap = document.createElement('span');
    cloneInfoWrap.className = 'accordion-info-wrap';

    var cloneInfoButton = document.createElement('button');
    cloneInfoButton.type = 'button';
    cloneInfoButton.className = 'accordion-info-icon';
    cloneInfoButton.textContent = '?';
    cloneInfoButton.setAttribute('aria-label', 'About recipe cloning');
    cloneInfoButton.addEventListener('click', function (event) {
      event.stopPropagation();
    });
    cloneInfoButton.addEventListener('keydown', function (event) {
      event.stopPropagation();
    });
    cloneInfoWrap.appendChild(cloneInfoButton);

    var cloneInfoTooltip = document.createElement('span');
    cloneInfoTooltip.className = 'accordion-info-tooltip';
    cloneInfoTooltip.textContent = 'Cloning a recipe is like making a new copy without the history. For example, you might have a Chicken Tortilla Soup and a vegan friendly variation.';
    cloneInfoWrap.appendChild(cloneInfoTooltip);
    cloneRow.appendChild(cloneInfoWrap);

    var saveActions = document.createElement('div');
    saveActions.className = 'recipe-version-save-actions';
    saveActions.appendChild(saveStatus);
    saveActions.appendChild(saveNoteButton);
    cloneRow.appendChild(saveActions);

    content.appendChild(cloneRow);
    section.appendChild(content);

    detailShell.insertBefore(section, detailHeader.nextSibling);

    if (shouldFocusVersionNote(record.id, activeVersion.versionNumber)) {
      requestAnimationFrame(function () {
        noteInput.focus();
        noteInput.setSelectionRange(noteInput.value.length, noteInput.value.length);
      });
      clearVersionNoteFocus(record.id);
    }
  }

  function appendDescriptionAccordionSection(container, record, hooks, selectedVersionNumber, canEditDescription) {
    var detailShell = container.querySelector('.detail-shell');
    var versionsSection = detailShell ? detailShell.querySelector('.recipe-accordion-card') : null;
    if (!detailShell || !versionsSection) {
      return;
    }

    var isExpanded = isDescriptionAccordionExpanded(record.id);
    var accordion = buildAccordionSection('Description', isExpanded, function () {
      setDescriptionAccordionExpanded(record.id, !isExpanded);
      renderDetailInto(container, record, hooks, selectedVersionNumber);
    });
    var section = accordion.section;
    var content = accordion.content;

    if (canEditDescription) {
      var originalDescription = record.description || '';

      var descriptionInput = document.createElement('textarea');
      descriptionInput.className = 'recipe-version-note-input';
      descriptionInput.rows = 4;
      descriptionInput.placeholder = 'Optional recipe description';
      descriptionInput.value = originalDescription;

      var saveStatus = document.createElement('span');
      saveStatus.className = 'recipe-version-save-status';
      saveStatus.setAttribute('aria-live', 'polite');

      var saveButton = document.createElement('button');
      saveButton.type = 'button';
      saveButton.className = 'recipe-version-save-button';
      saveButton.textContent = 'Save';
      saveButton.disabled = true;

      function updateDescriptionSaveState() {
        var isDirty = descriptionInput.value !== originalDescription;
        saveButton.disabled = !isDirty;
        saveStatus.textContent = isDirty ? 'Unsaved changes' : 'Saved';
        saveStatus.classList.toggle('is-dirty', isDirty);
      }

      descriptionInput.addEventListener('input', updateDescriptionSaveState);

      saveButton.addEventListener('click', async function () {
        try {
          await window.KaPRecipesService.updateRecipeDescription(record.id, descriptionInput.value);
          setDescriptionAccordionExpanded(record.id, true);
          originalDescription = descriptionInput.value;
          record.description = originalDescription;
          updateDescriptionSaveState();
        } catch (error) {
          await showError(error.message || 'Unable to update recipe description.');
        }
      });

      updateDescriptionSaveState();
      content.appendChild(descriptionInput);

      var saveRow = document.createElement('div');
      saveRow.className = 'recipe-version-clone-row';

      var saveActions = document.createElement('div');
      saveActions.className = 'recipe-version-save-actions';
      saveActions.appendChild(saveStatus);
      saveActions.appendChild(saveButton);
      saveRow.appendChild(saveActions);
      content.appendChild(saveRow);
    } else {
      var readOnlyText = document.createElement('p');
      readOnlyText.className = 'recipe-description-readonly';
      readOnlyText.textContent = record.description || 'No description yet.';
      content.appendChild(readOnlyText);
    }

    detailShell.insertBefore(section, versionsSection.nextSibling);
  }

  function appendIngredientsSection(container, recipeRecord, detailItems, isViewingLatestVersion, hooks, selectedVersionNumber) {
    var detailShell = container.querySelector('.detail-shell');
    var detailList = container.querySelector('[data-detail-item-list]');
    if (!detailShell || !detailList) {
      return;
    }

    var emptyStateCard = detailShell.querySelector(':scope > .empty-state-card');
    if (emptyStateCard) {
      emptyStateCard.remove();
    }

    var section = document.createElement('section');
    section.className = 'recipe-ingredients-section';

    var header = document.createElement('div');
    header.className = 'recipe-ingredients-header';

    var title = document.createElement('h3');
    title.className = 'recipe-ingredients-title';
    title.textContent = 'Ingredients';
    header.appendChild(title);

    if (isViewingLatestVersion) {
      var addButton = document.createElement('button');
      addButton.type = 'button';
      addButton.className = 'accordion-new-button';
      addButton.textContent = '+ Add Item';
      addButton.addEventListener('click', async function () {
        await addRecipeItemWithDiscoveryModal(recipeRecord, detailItems);
        await renderDetailInto(container, recipeRecord, hooks, selectedVersionNumber);
      });
      header.appendChild(addButton);
    }

    section.appendChild(header);

    if (!detailItems || detailItems.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'recipe-ingredients-empty';
      empty.textContent = 'No ingredients yet.';
      section.appendChild(empty);
    } else {
      section.appendChild(detailList);
    }

    detailShell.appendChild(section);
  }

  async function appendInstructionsSection(container, recipeRecord, instructions, isViewingLatestVersion, hooks, selectedVersionNumber) {
    var detailShell = container.querySelector('.detail-shell');
    if (!detailShell) {
      return;
    }

    var section = document.createElement('section');
    section.className = 'recipe-instructions-section';

    var header = document.createElement('div');
    header.className = 'recipe-instructions-header';

    var title = document.createElement('h3');
    title.className = 'recipe-instructions-title';
    title.textContent = 'Instructions';
    header.appendChild(title);

    if (isViewingLatestVersion) {
      var addButton = document.createElement('button');
      addButton.type = 'button';
      addButton.className = 'accordion-new-button';
      addButton.textContent = '+ Add Step';
      addButton.addEventListener('click', async function () {
        var changed = await addInstructionWithPrompt(recipeRecord);
        if (changed) {
          await renderDetailInto(container, recipeRecord, hooks, selectedVersionNumber);
        }
      });
      header.appendChild(addButton);
    }

    section.appendChild(header);

    if (!instructions || instructions.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'recipe-instructions-empty';
      empty.textContent = 'No steps yet.';
      section.appendChild(empty);
      detailShell.appendChild(section);
      return;
    }

    var list = document.createElement('div');
    list.className = 'recipe-instruction-list';

    instructions.forEach(function (instruction) {
      var row = document.createElement('div');
      row.className = 'recipe-instruction-row';

      var numberNode = document.createElement('span');
      numberNode.className = 'recipe-instruction-number';
      numberNode.textContent = String(instruction.stepNumber) + '.';

      var textNode = document.createElement('div');
      textNode.className = 'recipe-instruction-text';
      textNode.textContent = instruction.text;

      row.appendChild(numberNode);
      row.appendChild(textNode);

      if (isViewingLatestVersion) {
        var menuWrap = document.createElement('div');
        menuWrap.className = 'detail-overflow-menu recipe-instruction-menu';

        var menuTrigger = document.createElement('button');
        menuTrigger.type = 'button';
        menuTrigger.className = 'record-action-button detail-overflow-trigger';
        menuTrigger.setAttribute('aria-haspopup', 'menu');
        menuTrigger.setAttribute('aria-expanded', 'false');
        menuTrigger.setAttribute('aria-label', 'Step actions');

        var menuDots = document.createElement('span');
        menuDots.className = 'detail-overflow-dots';
        menuDots.textContent = '\u2026';
        menuTrigger.appendChild(menuDots);

        var menuList = document.createElement('div');
        menuList.className = 'detail-overflow-list';
        menuList.setAttribute('role', 'menu');

        function setMenuOpen(isOpen) {
          menuList.style.display = isOpen ? 'grid' : 'none';
          menuTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          window.KaPUI.SetActiveOverflowMenu(menuWrap, setMenuOpen, isOpen);
          if (isOpen) {
            menuList.classList.remove('detail-overflow-list--up');
            if (window.KaPUI.ShouldOpenOverflowUp(menuTrigger, menuList)) {
              menuList.classList.add('detail-overflow-list--up');
            }
          }
        }

        setMenuOpen(false);

        var menuActions = [
          { label: 'Move Up', onClick: async function () { var changed = await moveInstruction(recipeRecord, instruction, 'up'); if (changed) { await renderDetailInto(container, recipeRecord, hooks, selectedVersionNumber); } } },
          { label: 'Move Down', onClick: async function () { var changed = await moveInstruction(recipeRecord, instruction, 'down'); if (changed) { await renderDetailInto(container, recipeRecord, hooks, selectedVersionNumber); } } },
          { label: 'Edit', onClick: async function () { var changed = await editInstructionWithPrompt(recipeRecord, instruction); if (changed) { await renderDetailInto(container, recipeRecord, hooks, selectedVersionNumber); } } },
          { label: 'Remove', isDanger: true, onClick: async function () { var changed = await removeInstructionWithConfirm(recipeRecord, instruction); if (changed) { await renderDetailInto(container, recipeRecord, hooks, selectedVersionNumber); } } }
        ];

        menuActions.forEach(function (action) {
          var item = document.createElement('button');
          item.type = 'button';
          item.className = 'detail-overflow-item' + (action.isDanger ? ' detail-overflow-item--danger' : '');
          item.textContent = action.label;
          item.setAttribute('role', 'menuitem');
          item.addEventListener('click', function () {
            setMenuOpen(false);
            action.onClick();
          });
          menuList.appendChild(item);
        });

        menuTrigger.addEventListener('click', function (event) {
          event.stopPropagation();
          var isOpen = menuList.style.display !== 'none';
          setMenuOpen(!isOpen);
        });

        menuWrap.appendChild(menuTrigger);
        menuWrap.appendChild(menuList);
        row.appendChild(menuWrap);
      }

      list.appendChild(row);
    });

    section.appendChild(list);
    detailShell.appendChild(section);
  }

  async function renderInto(container, hooks) {
    var records = await window.KaPRecipesService.getAllRecipes();

    window.KaPUI.ReplaceMainContent(container, {
      emptyStateText: 'No recipes yet.',
      records: records,
      rowBuilder: function (record) {
        return window.KaPUI.NewListRecordRow(record, function () {
          hooks.onOpen(record);
        });
      }
    });
  }

  async function renderDetailInto(container, record, hooks, selectedVersionNumber) {
    if (!selectedVersionNumber) {
      clearRecipeEditMode(record.id);
    }

    var availableVersions = await window.KaPRecipesService.getRecipeVersions(record.id);
    var latestVersion = availableVersions.length > 0 ? availableVersions[availableVersions.length - 1] : null;
    var resolvedVersionNumber = selectedVersionNumber || getLastViewedVersionNumber(record.id);
    var activeVersion = resolvedVersionNumber
      ? await window.KaPRecipesService.getRecipeVersionByNumber(record.id, resolvedVersionNumber)
      : latestVersion;

    if (!activeVersion) {
      activeVersion = latestVersion;
    }

    if (activeVersion) {
      setLastViewedVersionNumber(record.id, activeVersion.versionNumber);
    }

    var isViewingLatestVersion = !!(latestVersion && activeVersion && latestVersion.id === activeVersion.id);
    var isInEditMode = !isViewingLatestVersion && isRecipeInEditMode(record.id, activeVersion ? activeVersion.versionNumber : null);
    var canEdit = isViewingLatestVersion || isInEditMode;
    var detailItems = await window.KaPRecipesService.getRecipeItems(record.id);
    var instructions = await window.KaPRecipesService.getRecipeInstructions(record.id);

    var sortedItems = sortByNameAscending(detailItems);
    var titleText = record.name;

    window.KaPUI.ReplaceDetailContent(container, {
      title: titleText,
      onBack: hooks.onBack,
      onAddItem: null,
      detailItems: sortedItems,
      itemRowBuilder: function (detailItem) {
        if (!canEdit) {
          return buildReadOnlyRecipeDetailItemRow(detailItem);
        }

        return buildRecipeDetailItemRow(record, detailItem, container, hooks, activeVersion ? activeVersion.versionNumber : undefined);
      },
      actions: [
        {
          label: 'Add To Grocery List',
          onClick: async function () {
            var ingredients = detailItems;
            if (!ingredients || ingredients.length === 0) {
              await showError('This recipe has no ingredients to add.');
              return;
            }

            var result = await window.KaPUI.ShowAddToListModal({
              recipeName: record.name,
              ingredients: ingredients,
              getAllLists: function () {
                return window.KaPListsService.getAllLists();
              }
            });

            if (!result) {
              return;
            }

            try {
              var targetListId = result.targetListId;
              if (result.isNewList) {
                var newList = await window.KaPListsService.createList(result.newListName);
                targetListId = newList.id;
              }

              await Promise.all(result.selectedIngredients.map(function (ingredient) {
                return window.KaPListsService.addItemToList(
                  targetListId,
                  ingredient.itemId,
                  ingredient.name,
                  ingredient.quantity,
                  ingredient.description
                );
              }));
            } catch (error) {
              await showError(error.message || 'Unable to add ingredients to list.');
            }
          }
        },
        !isViewingLatestVersion ? {
          label: isInEditMode ? 'View Only' : 'Edit',
          onClick: function () {
            if (isInEditMode) {
              clearRecipeEditMode(record.id);
            } else {
              setRecipeEditMode(record.id, activeVersion.versionNumber);
            }
            renderDetailInto(container, record, hooks, activeVersion.versionNumber);
          }
        } : null,
        {
          label: 'Delete',
          isDanger: true,
          onClick: async function () {
            var deleted = await deleteRecipe(record);
            if (deleted) {
              hooks.onDeleted();
            }
          }
        }
      ].filter(function (a) { return a !== null; })
    });

    appendVersionsAccordionSection(container, record, hooks, availableVersions, activeVersion, latestVersion, isViewingLatestVersion);
    appendDescriptionAccordionSection(
      container,
      record,
      hooks,
      activeVersion ? activeVersion.versionNumber : null,
        canEdit
    );
    appendIngredientsSection(
      container,
      record,
      detailItems,
        canEdit,
      hooks,
      activeVersion ? activeVersion.versionNumber : null
    );

    await appendInstructionsSection(
      container,
      record,
      instructions,
        canEdit,
      hooks,
      activeVersion ? activeVersion.versionNumber : null
    );
  }

  window.KaPRecipesPage = {
    createRecipe: createRecipe,
    renderInto: renderInto,
    renderDetailInto: renderDetailInto
  };
})();
