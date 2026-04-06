(function () {
  async function showError(message) {
    await window.KaPUI.ShowAlert({ title: 'Error', message: message });
  }

  async function createTemplate() {
    var name = await window.KaPUI.ShowPrompt({
      title: 'New Template',
      placeholder: 'Template name',
      confirmLabel: 'Create'
    });
    if (name === null) {
      return;
    }

    try {
      await window.KaPTemplatesService.createTemplate(name);
    } catch (error) {
      await showError(error.message || 'Unable to create template.');
    }
  }

  async function renameTemplate(record) {
    var nextName = await window.KaPUI.ShowPrompt({
      title: 'Rename Template',
      placeholder: 'Template name',
      value: record.name,
      confirmLabel: 'Rename'
    });
    if (nextName === null) {
      return;
    }

    try {
      await window.KaPTemplatesService.renameTemplate(record.id, nextName);
    } catch (error) {
      await showError(error.message || 'Unable to rename template.');
    }
  }

  async function deleteTemplate(record) {
    var confirmed = await window.KaPUI.ShowConfirm({
      title: 'Delete Template',
      message: 'Delete "' + record.name + '"?',
      confirmLabel: 'Delete',
      isDanger: true
    });
    if (!confirmed) {
      return;
    }

    try {
      await window.KaPTemplatesService.deleteTemplate(record.id);
    } catch (error) {
      await showError(error.message || 'Unable to delete template.');
    }
  }

  async function renderInto(container, hooks) {
    var records = await window.KaPTemplatesService.getAllTemplates();

    window.KaPUI.ReplaceMainContent(container, {
      emptyStateText: 'No templates yet.',
      records: records,
      rowBuilder: function (record) {
        return window.KaPUI.NewListRecordRow(record, {
          onRename: function () {
            renameTemplate(record).then(hooks.onAfterChange);
          },
          onDelete: function () {
            deleteTemplate(record).then(hooks.onAfterChange);
          }
        });
      }
    });
  }

  window.KaPTemplatesPage = {
    createTemplate: createTemplate,
    renderInto: renderInto
  };
})();
