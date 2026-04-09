(function () {
  function newFromTemplate(templateId) {
    var template = document.getElementById(templateId);
    if (!template) {
      throw new Error('Template not found: ' + templateId);
    }

    return template.content.firstElementChild.cloneNode(true);
  }

  function NewMainTab(tab, isSelected, onSelect, onAction) {
    var node = newFromTemplate('main-tab-template');
    var label = node.querySelector('.tab-label');
    var inlineAction = node.querySelector('.tab-inline-action');

    label.textContent = tab.label;
    inlineAction.textContent = tab.actionLabel;
    inlineAction.setAttribute('aria-disabled', isSelected ? 'false' : 'true');
    node.setAttribute('id', 'tab-' + tab.id);
    node.setAttribute('aria-controls', 'panel-' + tab.id);
    node.setAttribute('aria-selected', isSelected ? 'true' : 'false');

    if (isSelected) {
      node.classList.add('is-selected');
    }

    node.addEventListener('click', function (event) {
      if (event.target.closest('.tab-inline-action')) {
        if (isSelected) {
          onAction(tab.id);
        }
        return;
      }

      onSelect(tab.id);
    });

    return node;
  }

  function AddMainTab(container, tab, isSelected, onSelect, onAction) {
    var node = NewMainTab(tab, isSelected, onSelect, onAction);
    container.appendChild(node);
    return node;
  }

  function ReplaceMainTabs(container, tabs, selectedTabId, onSelect, onAction) {
    container.replaceChildren();

    tabs.forEach(function (tab) {
      AddMainTab(container, tab, tab.id === selectedTabId, onSelect, onAction);
    });
  }

  function NewListRecordRow(record, onClick) {
    var node = newFromTemplate('list-record-row-template');
    var nameNode = node.querySelector('.record-name');

    nameNode.textContent = record.name;

    if (typeof onClick === 'function') {
      node.addEventListener('click', onClick);
    }

    return node;
  }

  function ReplaceRecordList(container, records, rowBuilder) {
    container.replaceChildren();

    records.forEach(function (record) {
      container.appendChild(rowBuilder(record));
    });
  }

  function NewMainContentShell(config) {
    var node = newFromTemplate('main-content-shell-template');
    var emptyStateText = node.querySelector('.empty-state-text');
    var emptyStateCard = node.querySelector('.empty-state-card');
    var recordList = node.querySelector('[data-record-list]');
    var records = config.records || [];

    emptyStateText.textContent = config.emptyStateText;

    if (records.length > 0 && typeof config.rowBuilder === 'function') {
      emptyStateCard.hidden = true;
      ReplaceRecordList(recordList, records, config.rowBuilder);
    } else {
      emptyStateCard.hidden = false;
      recordList.replaceChildren();
    }

    return node;
  }

  function AddMainContentShell(container, config) {
    var node = NewMainContentShell(config);
    container.appendChild(node);
    return node;
  }

  function ReplaceMainContent(container, config) {
    container.replaceChildren();
    AddMainContentShell(container, config);
  }

  function NewDetailShell(config) {
    var node = newFromTemplate('detail-shell-template');
    var titleNode = node.querySelector('.detail-title');
    var backButton = node.querySelector('.detail-back-button');
    var actionsNode = node.querySelector('.detail-actions');
    var detailItemList = node.querySelector('[data-detail-item-list]');
    var emptyStateCard = node.querySelector('.empty-state-card');
    var emptyStateText = node.querySelector('.empty-state-text');
    var detailItems = config.detailItems || [];

    titleNode.textContent = config.title;
    emptyStateText.textContent = config.emptyStateText || '';

    backButton.addEventListener('click', config.onBack);

    if (typeof config.onAddItem === 'function') {
      var addItemButton = document.createElement('button');
      addItemButton.type = 'button';
      addItemButton.className = 'record-action-button';
      addItemButton.textContent = config.addItemLabel || 'Add Item';
      addItemButton.addEventListener('click', config.onAddItem);
      actionsNode.appendChild(addItemButton);
    }

    (config.actions || []).forEach(function (action) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'record-action-button' + (action.isDanger ? ' record-action-button--danger' : '');
      btn.textContent = action.label;
      btn.addEventListener('click', action.onClick);
      actionsNode.appendChild(btn);
    });

    if (detailItems.length > 0 && typeof config.itemRowBuilder === 'function') {
      emptyStateCard.hidden = true;
      ReplaceDetailItemRows(detailItemList, detailItems, config.itemRowBuilder);
    } else {
      emptyStateCard.hidden = false;
      detailItemList.replaceChildren();
    }

    return node;
  }

  function NewDetailItemRow(detailItem, callbacks) {
    var node = newFromTemplate('detail-item-row-template');
    var nameNode = node.querySelector('.detail-item-name');
    var metaNode = node.querySelector('.detail-item-meta');
    var editButton = node.querySelector('[data-action="edit"]');
    var removeButton = node.querySelector('[data-action="remove"]');
    var itemName = detailItem.name || (detailItem.item && detailItem.item.name) || 'Unknown Item';
    var quantityText = detailItem.quantity == null ? 'Qty: -' : 'Qty: ' + String(detailItem.quantity);
    var descriptionText = detailItem.description ? ' | ' + detailItem.description : '';

    nameNode.textContent = itemName;
    metaNode.textContent = quantityText + descriptionText;

    if (callbacks && typeof callbacks.onEdit === 'function') {
      editButton.addEventListener('click', callbacks.onEdit);
    }

    if (callbacks && typeof callbacks.onRemove === 'function') {
      removeButton.addEventListener('click', callbacks.onRemove);
    }

    return node;
  }

  function ReplaceDetailItemRows(container, detailItems, rowBuilder) {
    container.replaceChildren();

    detailItems.forEach(function (detailItem) {
      container.appendChild(rowBuilder(detailItem));
    });
  }

  function ReplaceDetailContent(container, config) {
    container.replaceChildren();
    container.appendChild(NewDetailShell(config));
  }

  function NewSettingsToggle(config) {
    var node = document.createElement('div');
    node.className = 'settings-toggle-row';

    var textWrap = document.createElement('div');
    textWrap.className = 'settings-toggle-text';

    var label = document.createElement('label');
    label.className = 'settings-toggle-label';
    label.textContent = config.label;
    textWrap.appendChild(label);

    if (config.description) {
      var description = document.createElement('p');
      description.className = 'settings-toggle-description';
      description.textContent = config.description;
      textWrap.appendChild(description);
    }

    node.appendChild(textWrap);

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'settings-toggle-switch' + (config.checked ? ' settings-toggle-switch--on' : ' settings-toggle-switch--off');
    button.setAttribute('role', 'switch');
    button.setAttribute('aria-checked', config.checked ? 'true' : 'false');

    button.addEventListener('click', function () {
      var isNowOn = !button.classList.contains('settings-toggle-switch--on');
      button.classList.toggle('settings-toggle-switch--on');
      button.classList.toggle('settings-toggle-switch--off');
      button.setAttribute('aria-checked', isNowOn ? 'true' : 'false');
      config.onChange(isNowOn);
    });

    node.appendChild(button);
    return node;
  }

  function showModal(setupBody, config) {
    return new Promise(function (resolve) {
      var node = newFromTemplate('modal-template');
      var overlay = node;
      var card = node.querySelector('.modal-card');
      var titleNode = node.querySelector('.modal-title');
      var bodyNode = node.querySelector('.modal-body');
      var cancelButton = node.querySelector('.modal-cancel-button');
      var confirmButton = node.querySelector('.modal-confirm-button');

      titleNode.textContent = config.title;
      confirmButton.textContent = config.confirmLabel || 'OK';
      card.setAttribute('aria-label', config.title);

      cancelButton.classList.add('modal-button--secondary');

      if (config.isDanger) {
        confirmButton.classList.add('modal-button--danger');
      } else {
        confirmButton.classList.add('modal-button--primary');
      }

      if (config.showCancel === false) {
        cancelButton.hidden = true;
      }

      var getValue = setupBody(bodyNode, confirmButton, cancelButton);

      function close(result) {
        document.removeEventListener('keydown', onKeyDown);
        document.body.removeChild(node);
        resolve(result);
      }

      function onKeyDown(event) {
        if (event.key === 'Escape') {
          close(config.cancelValue);
        }
      }

      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
          close(config.cancelValue);
        }
      });

      cancelButton.addEventListener('click', function () {
        close(config.cancelValue);
      });

      confirmButton.addEventListener('click', function () {
        close(getValue());
      });

      document.addEventListener('keydown', onKeyDown);
      document.body.appendChild(node);
    });
  }

  function ShowDiscoveryItemModal(options) {
    return new Promise(function (resolve) {
      var suggestionsEnabled = options.enableSuggestions !== false;
      var currentContextItemIds = (options.currentContextItemIds || []).filter(function (itemId) {
        return itemId != null;
      });
      var currentContextLabel = options.currentContextLabel || 'record';
      var node = newFromTemplate('modal-template');
      var overlay = node;
      var card = node.querySelector('.modal-card');
      var titleNode = node.querySelector('.modal-title');
      var bodyNode = node.querySelector('.modal-body');
      var cancelButton = node.querySelector('.modal-cancel-button');
      var confirmButton = node.querySelector('.modal-confirm-button');
      var selectedItem = null;
      var currentSuggestions = [];

      titleNode.textContent = options.title || 'Add Item';
      confirmButton.textContent = options.confirmLabel || 'Add';
      card.setAttribute('aria-label', titleNode.textContent);
      cancelButton.classList.add('modal-button--secondary');
      confirmButton.classList.add('modal-button--primary');

      var form = document.createElement('div');
      form.className = 'modal-item-form';

      var nameLabel = document.createElement('label');
      nameLabel.className = 'modal-field-label';
      nameLabel.textContent = options.itemNameLabel || 'Item name';
      form.appendChild(nameLabel);

      var nameInputWrapper = document.createElement('div');
      nameInputWrapper.className = 'modal-input-wrapper';

      var nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'modal-input';
      nameInput.placeholder = options.itemNamePlaceholder || 'Type item name';
      nameInput.value = options.initialName || '';
      nameInputWrapper.appendChild(nameInput);

      var suggestionsList = document.createElement('div');
      suggestionsList.className = 'modal-suggestions';
      suggestionsList.hidden = true;
      if (suggestionsEnabled) {
        nameInputWrapper.appendChild(suggestionsList);
      }

      form.appendChild(nameInputWrapper);

      var quantityLabel = document.createElement('label');
      quantityLabel.className = 'modal-field-label';
      quantityLabel.textContent = options.quantityLabel || 'Quantity (optional)';
      form.appendChild(quantityLabel);

      var quantityInput = document.createElement('input');
      quantityInput.type = 'text';
      quantityInput.className = 'modal-input';
      quantityInput.placeholder = options.quantityPlaceholder || 'e.g. 2';
      quantityInput.value = options.initialQuantity == null ? '' : String(options.initialQuantity);
      form.appendChild(quantityInput);

      var descriptionLabel = document.createElement('label');
      descriptionLabel.className = 'modal-field-label';
      descriptionLabel.textContent = options.descriptionLabel || 'Description (optional)';
      form.appendChild(descriptionLabel);

      var descriptionInput = document.createElement('input');
      descriptionInput.type = 'text';
      descriptionInput.className = 'modal-input';
      descriptionInput.placeholder = options.descriptionPlaceholder || 'Notes';
      descriptionInput.value = options.initialDescription || '';
      form.appendChild(descriptionInput);

      var errorNode = document.createElement('p');
      errorNode.className = 'modal-error';
      form.appendChild(errorNode);

      bodyNode.appendChild(form);

      function close(result) {
        document.removeEventListener('keydown', onKeyDown);
        document.body.removeChild(node);
        resolve(result);
      }

      function showError(message) {
        errorNode.textContent = message || '';
      }

      function normalizeName(name) {
        return String(name || '').trim().toLowerCase();
      }

      function sortItemsByName(items) {
        return (items || []).slice().sort(function (left, right) {
          return String(left.name || '').localeCompare(String(right.name || ''), undefined, {
            sensitivity: 'base'
          });
        });
      }

      function isItemInCurrentContext(itemId) {
        return currentContextItemIds.indexOf(itemId) >= 0;
      }

      function getCurrentContextMeta(item) {
        if (!item || !isItemInCurrentContext(item.id)) {
          return '';
        }

        return 'Already on this ' + currentContextLabel;
      }

      async function deleteCatalogItem(item) {
        if (!options.deleteItem || !item) {
          return;
        }

        try {
          await options.deleteItem(item);
          if (selectedItem && selectedItem.id === item.id) {
            selectedItem = null;
          }
          showError('');
          await refreshSuggestions();
          nameInput.focus();
        } catch (error) {
          showError(error.message || 'Unable to delete item from catalog.');
        }
      }

      function renderSuggestions() {
        if (!suggestionsEnabled) {
          return;
        }

        suggestionsList.replaceChildren();

        if (currentSuggestions.length === 0) {
          suggestionsList.hidden = true;
          return;
        }

        suggestionsList.hidden = false;

        currentSuggestions.slice(0, 8).forEach(function (item) {
          var isInCurrentContext = isItemInCurrentContext(item.id);
          var row = document.createElement('div');
          row.className = 'modal-suggestion-row';
          if (isInCurrentContext) {
            row.classList.add('modal-suggestion-row--current-context');
          }

          var selectButton = document.createElement('button');
          selectButton.type = 'button';
          selectButton.className = 'modal-suggestion-main';

          var content = document.createElement('div');
          content.className = 'modal-suggestion-content';

          var nameNode = document.createElement('div');
          nameNode.className = 'modal-suggestion-name';
          nameNode.textContent = item.name;
          content.appendChild(nameNode);

          var metaText = getCurrentContextMeta(item);
          if (metaText) {
            var metaNode = document.createElement('div');
            metaNode.className = 'modal-suggestion-meta';
            metaNode.textContent = metaText;
            content.appendChild(metaNode);
          }

          selectButton.appendChild(content);

          if (selectedItem && selectedItem.id === item.id) {
            selectButton.setAttribute('aria-selected', 'true');
          }

          selectButton.addEventListener('click', function () {
            selectedItem = item;
            nameInput.value = item.name;
            showError('');
            currentSuggestions = [];
            renderSuggestions();
            quantityInput.focus();
          });

          row.appendChild(selectButton);

          if (options.deleteItem) {
            var deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'modal-suggestion-delete';
            deleteButton.setAttribute('aria-label', 'Delete ' + item.name + ' from catalog');
            deleteButton.title = 'Delete from catalog';
            deleteButton.textContent = '🗑';
            deleteButton.addEventListener('click', function (event) {
              event.preventDefault();
              event.stopPropagation();
              deleteCatalogItem(item);
            });
            row.appendChild(deleteButton);
          }

          suggestionsList.appendChild(row);
        });
      }

      async function refreshSuggestions() {
        if (!suggestionsEnabled) {
          return;
        }

        var query = String(nameInput.value || '').trim();
        if (!query) {
          currentSuggestions = options.getAllItems
            ? await options.getAllItems()
            : [];
          selectedItem = null;
          currentSuggestions = sortItemsByName(currentSuggestions);
          renderSuggestions();
          return;
        }

        currentSuggestions = await options.searchItems(query);
        currentSuggestions = sortItemsByName(currentSuggestions);

        if (selectedItem && normalizeName(selectedItem.name) !== normalizeName(nameInput.value)) {
          selectedItem = null;
        }

        renderSuggestions();
      }

      async function handleSubmit() {
        try {
          showError('');

          var rawName = String(nameInput.value || '').trim();
          if (!rawName) {
            showError('Item name is required.');
            nameInput.focus();
            return;
          }

          var quantityResult = options.validateQuantity
            ? options.validateQuantity(quantityInput.value)
            : { ok: true, value: quantityInput.value };

          if (!quantityResult.ok) {
            showError(quantityResult.message || 'Quantity is invalid.');
            quantityInput.focus();
            return;
          }

          if (!suggestionsEnabled) {
            close({
              name: rawName,
              quantity: quantityResult.value,
              description: String(descriptionInput.value || '').trim()
            });
            return;
          }

          var item = selectedItem;
          if (!item || normalizeName(item.name) !== normalizeName(rawName)) {
            var exact = await options.resolveExactItem(rawName);
            if (exact) {
              item = exact;
            } else {
              item = await options.createItem(rawName);
            }
          }

          close({
            item: item,
            name: rawName,
            quantity: quantityResult.value,
            description: String(descriptionInput.value || '').trim()
          });
        } catch (error) {
          showError(error.message || 'Unable to submit item.');
        }
      }

      function onKeyDown(event) {
        if (event.key === 'Escape') {
          close(null);
        }
      }

      nameInput.addEventListener('input', function () {
        if (!suggestionsEnabled) {
          return;
        }

        refreshSuggestions().catch(function () {
          showError('Unable to load suggestions.');
        });
      });

      nameInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          if (suggestionsEnabled) {
            currentSuggestions = [];
            renderSuggestions();
          }
          quantityInput.focus();
        }
      });

      quantityInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          handleSubmit();
        }
      });

      descriptionInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          handleSubmit();
        }
      });

      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
          close(null);
        }
      });

      cancelButton.addEventListener('click', function () {
        close(null);
      });

      confirmButton.addEventListener('click', function () {
        handleSubmit();
      });

      document.addEventListener('keydown', onKeyDown);
      document.body.appendChild(node);

      requestAnimationFrame(function () {
        nameInput.focus();
        if (suggestionsEnabled) {
          refreshSuggestions().catch(function () {
            showError('Unable to load suggestions.');
          });
        }
      });
    });
  }

  function ShowPrompt(config) {
    return showModal(function (bodyNode, confirmButton) {
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'modal-input';
      input.placeholder = config.placeholder || '';
      input.value = config.value || '';
      bodyNode.appendChild(input);

      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          confirmButton.click();
        }
      });

      requestAnimationFrame(function () {
        input.focus();
        input.select();
      });

      return function () { return input.value; };
    }, {
      title: config.title,
      confirmLabel: config.confirmLabel || 'OK',
      cancelValue: null,
      isDanger: false
    });
  }

  function ShowConfirm(config) {
    return showModal(function (bodyNode, confirmButton, cancelButton) {
      if (config.message) {
        var p = document.createElement('p');
        p.className = 'modal-message';
        p.textContent = config.message;
        bodyNode.appendChild(p);
      }

      requestAnimationFrame(function () {
        cancelButton.focus();
      });

      return function () { return true; };
    }, {
      title: config.title,
      confirmLabel: config.confirmLabel || 'Confirm',
      cancelValue: false,
      isDanger: config.isDanger || false
    });
  }

  function ShowAlert(config) {
    return showModal(function (bodyNode, confirmButton) {
      if (config.message) {
        var p = document.createElement('p');
        p.className = 'modal-message';
        p.textContent = config.message;
        bodyNode.appendChild(p);
      }

      requestAnimationFrame(function () {
        confirmButton.focus();
      });

      return function () { return true; };
    }, {
      title: config.title,
      confirmLabel: config.confirmLabel || 'OK',
      cancelValue: null,
      showCancel: false,
      isDanger: false
    });
  }

  window.KaPUI = {
    NewMainTab: NewMainTab,
    AddMainTab: AddMainTab,
    ReplaceMainTabs: ReplaceMainTabs,
    NewListRecordRow: NewListRecordRow,
    ReplaceRecordList: ReplaceRecordList,
    NewMainContentShell: NewMainContentShell,
    AddMainContentShell: AddMainContentShell,
    ReplaceMainContent: ReplaceMainContent,
    NewDetailShell: NewDetailShell,
    ReplaceDetailContent: ReplaceDetailContent,
    NewDetailItemRow: NewDetailItemRow,
    ReplaceDetailItemRows: ReplaceDetailItemRows,
    NewSettingsToggle: NewSettingsToggle,
    ShowDiscoveryItemModal: ShowDiscoveryItemModal,
    ShowPrompt: ShowPrompt,
    ShowConfirm: ShowConfirm,
    ShowAlert: ShowAlert
  };
})();
