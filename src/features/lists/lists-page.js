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
      return;
    }

    try {
      await window.KaPListsService.renameList(record.id, nextName);
    } catch (error) {
      await showError(error.message || 'Unable to rename list.');
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
      return;
    }

    try {
      await window.KaPListsService.deleteList(record.id);
    } catch (error) {
      await showError(error.message || 'Unable to delete list.');
    }
  }

  async function renderInto(container, hooks) {
    var records = await window.KaPListsService.getAllLists();

    window.KaPUI.ReplaceMainContent(container, {
      emptyStateText: 'No lists yet.',
      records: records,
      rowBuilder: function (record) {
        return window.KaPUI.NewListRecordRow(record, {
          onRename: function () {
            renameList(record).then(hooks.onAfterChange);
          },
          onDelete: function () {
            deleteList(record).then(hooks.onAfterChange);
          }
        });
      }
    });
  }

  window.KaPListsPage = {
    createList: createList,
    renderInto: renderInto
  };
})();
