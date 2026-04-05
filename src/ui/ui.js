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
    node.setAttribute('id', 'tab-' + tab.id);
    node.setAttribute('aria-controls', 'panel-' + tab.id);
    node.setAttribute('aria-selected', isSelected ? 'true' : 'false');

    if (isSelected) {
      node.classList.add('is-selected');
    }

    node.addEventListener('click', function (event) {
      if (isSelected && event.target.closest('.tab-inline-action')) {
        onAction(tab.id);
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

  function NewListRecordRow(record, callbacks) {
    var node = newFromTemplate('list-record-row-template');
    var nameNode = node.querySelector('.record-name');
    var renameButton = node.querySelector('[data-action="rename"]');
    var deleteButton = node.querySelector('[data-action="delete"]');

    nameNode.textContent = record.name;

    renameButton.addEventListener('click', callbacks.onRename);
    deleteButton.addEventListener('click', callbacks.onDelete);

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
    ShowPrompt: ShowPrompt,
    ShowConfirm: ShowConfirm,
    ShowAlert: ShowAlert
  };
})();
