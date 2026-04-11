(function () {
  async function renderInto(container, hooks) {
    var rememberPosition = window.KaPSettings.get(window.KaPSettings.KEYS.REMEMBER_POSITION);

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

    var toggleRow = window.KaPUI.NewSettingsToggle({
      label: 'Remember position when switching views',
      description: 'On: each tab remembers the last opened List, Template, or Recipe view. Off: opening Lists, Templates, or Recipes always starts from that tab\'s main list.',
      checked: rememberPosition,
      onChange: function (checked) {
        window.KaPSettings.set(window.KaPSettings.KEYS.REMEMBER_POSITION, checked);
      }
    });
    section.appendChild(toggleRow);

    container.replaceChildren(section);
  }

  window.KaPSettingsPage = {
    renderInto: renderInto
  };
})();
