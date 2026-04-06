var AppInit = {
  initialize: async function () {
    await window.KaPDB.open();
    window.KaPMainPage.initialize();
  }
};
