var AppInit = {
  initialize: async function () {
    await window.KaPDB.open();
    await window.KaPMainPage.initialize();
  }
};
