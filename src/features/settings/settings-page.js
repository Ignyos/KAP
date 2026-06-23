(function () {
  var THEME_OPTIONS = [
    { value: 'dark', label: 'Dark' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'autumn', label: 'Autumn' },
    { value: 'winter', label: 'Winter' }
  ];

  var TEXT_SIZE_OPTIONS = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  async function renderInto(container, hooks) {
    var section = document.createElement('section');
    section.className = 'settings-shell';

    var header = document.createElement('div');
    header.className = 'detail-header settings-header';

    if (hooks && typeof hooks.onBack === 'function') {
      var backButton = document.createElement('button');
      backButton.type = 'button';
      backButton.className = 'detail-back-button';
      backButton.textContent = '\u2190 Back';
      backButton.addEventListener('click', hooks.onBack);
      header.appendChild(backButton);
    }

    var heading = document.createElement('h2');
    heading.className = 'detail-title';
    heading.textContent = 'Settings';
    header.appendChild(heading);

    var rightSpacer = document.createElement('div');
    rightSpacer.className = 'detail-actions settings-header-spacer';
    rightSpacer.setAttribute('aria-hidden', 'true');
    header.appendChild(rightSpacer);

    section.appendChild(header);

    var body = document.createElement('div');
    body.className = 'settings-body';
    body.appendChild(buildThemeRow());
    body.appendChild(buildTextSizeRow());
    body.appendChild(buildImportExportRow());

    section.appendChild(body);

    container.replaceChildren(section);
  }

  function buildTextSizeRow() {
    var row = document.createElement('div');
    row.className = 'settings-row';

    var label = document.createElement('span');
    label.className = 'settings-row-label';
    label.textContent = 'Text Size';
    row.appendChild(label);

    var control = document.createElement('div');
    control.className = 'settings-segment-control';
    control.setAttribute('role', 'group');
    control.setAttribute('aria-label', 'Text Size');

    var currentSize = window.KaPSettings.get(window.KaPSettings.KEYS.TEXT_SIZE);

    TEXT_SIZE_OPTIONS.forEach(function (option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'settings-segment-button';
      if (option.value === currentSize) {
        button.classList.add('settings-segment-button--active');
      }
      button.textContent = option.label;
      button.dataset.size = option.value;

      button.addEventListener('click', function () {
        control.querySelectorAll('.settings-segment-button').forEach(function (b) {
          b.classList.toggle('settings-segment-button--active', b.dataset.size === option.value);
        });
        window.KaPSettings.set(window.KaPSettings.KEYS.TEXT_SIZE, option.value);
        window.KaPSettings.applyTextSize(option.value);
      });

      control.appendChild(button);
    });

    row.appendChild(control);
    return row;
  }

  function buildThemeRow() {
    var row = document.createElement('div');
    row.className = 'settings-row';

    var label = document.createElement('span');
    label.className = 'settings-row-label';
    label.textContent = 'Theme';
    row.appendChild(label);

    var control = document.createElement('div');
    control.className = 'settings-segment-control';
    control.setAttribute('role', 'group');
    control.setAttribute('aria-label', 'Theme');

    var currentTheme = window.KaPSettings.get(window.KaPSettings.KEYS.THEME);

    THEME_OPTIONS.forEach(function (option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'settings-segment-button';
      if (option.value === currentTheme) {
        button.classList.add('settings-segment-button--active');
      }
      button.textContent = option.label;
      button.dataset.theme = option.value;

      button.addEventListener('click', function () {
        control.querySelectorAll('.settings-segment-button').forEach(function (b) {
          b.classList.toggle('settings-segment-button--active', b.dataset.theme === option.value);
        });
        window.KaPSettings.set(window.KaPSettings.KEYS.THEME, option.value);
        window.KaPSettings.applyTheme(option.value);
      });

      control.appendChild(button);
    });

    row.appendChild(control);
    return row;
  }

  function buildImportExportRow() {
    var row = document.createElement('div');
    row.className = 'settings-row';

    var label = document.createElement('span');
    label.className = 'settings-row-label';
    label.textContent = 'Data';
    row.appendChild(label);

    var actions = document.createElement('div');
    actions.className = 'settings-inline-actions';

    var exportButton = document.createElement('button');
    exportButton.type = 'button';
    exportButton.className = 'settings-action-button';
    exportButton.textContent = 'Export';
    exportButton.addEventListener('click', function () {
      handleExportClick(exportButton);
    });

    var importButton = document.createElement('button');
    importButton.type = 'button';
    importButton.className = 'settings-action-button settings-action-button--danger';
    importButton.textContent = 'Import';
    importButton.addEventListener('click', function () {
      handleImportClick(importButton);
    });

    actions.appendChild(exportButton);
    actions.appendChild(importButton);
    row.appendChild(actions);

    return row;
  }

  async function handleExportClick(button) {
    if (!window.KaPImportExportService) {
      await window.KaPUI.ShowAlert({
        title: 'Export Not Available',
        message: 'Import/export service is not loaded.'
      });
      return;
    }

    button.disabled = true;
    try {
      await window.KaPImportExportService.downloadExportFile();
      await window.KaPUI.ShowAlert({
        title: 'Export Complete',
        message: 'Your data was exported successfully.'
      });
    } catch (error) {
      await window.KaPUI.ShowAlert({
        title: 'Export Failed',
        message: error && error.message ? error.message : 'Unable to export data.'
      });
    } finally {
      button.disabled = false;
    }
  }

  async function handleImportClick(button) {
    if (!window.KaPImportExportService) {
      await window.KaPUI.ShowAlert({
        title: 'Import Not Available',
        message: 'Import/export service is not loaded.'
      });
      return;
    }

    var mode = await chooseImportMode();
    if (!mode) {
      return;
    }

    button.disabled = true;
    try {
      var file = await window.KaPImportExportService.openFilePicker();
      if (!file) {
        return;
      }

      var payload = await window.KaPImportExportService.parseJsonFile(file);
      var result = await window.KaPImportExportService.importData(payload, mode);

      await window.KaPUI.ShowAlert({
        title: 'Import Complete',
        message: buildImportSummaryMessage(result)
      });

      window.location.reload();
    } catch (error) {
      await window.KaPUI.ShowAlert({
        title: 'Import Failed',
        message: error && error.message ? error.message : 'Unable to import data.'
      });
    } finally {
      button.disabled = false;
    }
  }

  async function chooseImportMode() {
    var mode = await window.KaPUI.ShowImportModeModal();
    if (!mode) {
      return null;
    }

    if (mode === 'merge') {
      return 'merge';
    }

    var useReplace = await window.KaPUI.ShowConfirm({
      title: 'Replace Existing Data?',
      message: 'Replace deletes all current local data and restores only the imported file.',
      confirmLabel: 'Replace',
      isDanger: true
    });

    return useReplace ? 'replace' : null;
  }

  function buildImportSummaryMessage(result) {
    var modeLabel = String(result && result.mode || 'replace').toUpperCase();
    var stores = result && result.storeSummaries ? result.storeSummaries : {};
    var storeNames = Object.keys(stores);
    var inserted = 0;
    var updated = 0;
    var skippedOlder = 0;
    var skippedInvalid = 0;
    var tombstoneDeleted = Number(result && result.tombstoneApplication && result.tombstoneApplication.deleted || 0);
    var tombstonePurged = Number(result && result.tombstoneRetention && result.tombstoneRetention.purged || 0);

    for (var i = 0; i < storeNames.length; i++) {
      var summary = stores[storeNames[i]] || {};
      inserted += Number(summary.inserted || 0);
      updated += Number(summary.updated || 0);
      skippedOlder += Number(summary.skippedOlder || 0);
      skippedInvalid += Number(summary.skippedInvalid || 0);
    }

    return modeLabel + ' import complete. '
      + 'Inserted: ' + inserted + '. '
      + 'Updated: ' + updated + '. '
      + 'Deleted by tombstones: ' + tombstoneDeleted + '. '
        + 'Purged tombstones (365d): ' + tombstonePurged + '. '
      + 'Skipped older: ' + skippedOlder + '. '
      + 'Skipped invalid: ' + skippedInvalid + '. '
      + 'The app will now reload.';
  }

  window.KaPSettingsPage = {
    renderInto: renderInto
  };
})();

