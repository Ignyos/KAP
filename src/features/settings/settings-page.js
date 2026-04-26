(function () {
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
    body.appendChild(buildTextSizeRow());
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

  window.KaPSettingsPage = {
    renderInto: renderInto
  };
})();

