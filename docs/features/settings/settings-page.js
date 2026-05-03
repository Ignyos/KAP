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

    var uomSection = document.createElement('div');
    uomSection.className = 'settings-uom-section';
    await renderUomSectionInto(uomSection);
    body.appendChild(uomSection);

    section.appendChild(body);

    container.replaceChildren(section);
  }

  async function renderUomSectionInto(container) {
    container.replaceChildren();

    var heading = document.createElement('div');
    heading.className = 'settings-section-heading';

    var headingText = document.createElement('span');
    headingText.textContent = 'Units of Measure';
    heading.appendChild(headingText);

    var addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'record-action-button settings-uom-add-button';
    addButton.textContent = '+ Add Unit';
    addButton.addEventListener('click', async function () {
      var created = await window.KaPUI.ShowCreateUnitModal({
        createUnitOfMeasure: function (name, abbr, group, behavior, step) {
          return window.KaPRecipesService.createUnitOfMeasure(name, abbr, group, behavior, step);
        }
      });
      if (created) {
        await renderUomSectionInto(container);
      }
    });
    heading.appendChild(addButton);
    container.appendChild(heading);

    var units = [];
    try {
      units = await window.KaPRecipesService.getAllUnitOfMeasures({ includeInactive: true });
    } catch (_e) {}

    if (units.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'settings-uom-empty';
      empty.textContent = 'No units found.';
      container.appendChild(empty);
      return;
    }

    var currentGroup = null;
    units.forEach(function (unit) {
      if (unit.group !== currentGroup) {
        currentGroup = unit.group;
        var groupHeader = document.createElement('div');
        groupHeader.className = 'settings-uom-group-header';
        groupHeader.textContent = unit.group;
        container.appendChild(groupHeader);
      }

      var row = document.createElement('div');
      row.className = 'settings-uom-row';

      var nameBlock = document.createElement('div');
      nameBlock.className = 'settings-uom-name-block';

      var nameSpan = document.createElement('span');
      nameSpan.className = 'settings-uom-name';
      nameSpan.textContent = unit.name;
      nameBlock.appendChild(nameSpan);

      if (unit.abbreviation) {
        var abbrSpan = document.createElement('span');
        abbrSpan.className = 'settings-uom-abbr';
        abbrSpan.textContent = unit.abbreviation;
        nameBlock.appendChild(abbrSpan);
      }

      row.appendChild(nameBlock);

      var metaBlock = document.createElement('div');
      metaBlock.className = 'settings-uom-meta';

      var behaviorLabel = { decimal: 'Decimal', whole_or_half: 'Whole / half', user_defined: 'Custom step' };
      var behaviorSpan = document.createElement('span');
      behaviorSpan.className = 'settings-uom-behavior';
      behaviorSpan.textContent = behaviorLabel[unit.quantityBehavior] || unit.quantityBehavior || '';
      metaBlock.appendChild(behaviorSpan);

      if (!unit.isActive) {
        var inactiveTag = document.createElement('span');
        inactiveTag.className = 'settings-uom-inactive-tag';
        inactiveTag.textContent = 'Inactive';
        metaBlock.appendChild(inactiveTag);
      }

      row.appendChild(metaBlock);

      if (!unit.isSeeded) {
        var editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'record-action-button settings-uom-edit-button';
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', async function () {
          await showEditUnitModal(unit, container);
        });
        row.appendChild(editButton);
      }

      container.appendChild(row);
    });
  }

  async function showEditUnitModal(unit, sectionContainer) {
    var result = await window.KaPUI.ShowEditUnitModal({
      unit: unit,
      updateUnitOfMeasure: function (id, updates) {
        return window.KaPRecipesService.updateUnitOfMeasure(id, updates);
      }
    });

    if (result) {
      await renderUomSectionInto(sectionContainer);
    }
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

  window.KaPSettingsPage = {
    renderInto: renderInto
  };
})();

