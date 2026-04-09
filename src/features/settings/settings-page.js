(function () {
  async function renderInto(container) {
    var rememberPosition = window.KaPSettings.get(window.KaPSettings.KEYS.REMEMBER_POSITION);

    var section = document.createElement('section');
    section.className = 'settings-shell';

    var heading = document.createElement('h2');
    heading.className = 'settings-title';
    heading.textContent = 'Settings';
    section.appendChild(heading);

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
