var AppInit = {
  initialize: async function () {
    window.KaPSettings.applyTheme(window.KaPSettings.get(window.KaPSettings.KEYS.THEME));
    window.KaPSettings.applyTextSize(window.KaPSettings.get(window.KaPSettings.KEYS.TEXT_SIZE));
    await window.KaPDB.open();
    await window.KaPMainPage.initialize();
  }
};
