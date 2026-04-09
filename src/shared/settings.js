(function () {
  var STORAGE_PREFIX = 'kap.settings.';

  var KEYS = {
    REMEMBER_POSITION: 'rememberPosition',
    ACTIVE_TAB: 'activeTab',
    ACTIVE_DETAIL_IDS_BY_TAB: 'activeDetailIdsByTab'
  };

  var defaults = {
    rememberPosition: true,
    activeTab: 'lists',
    activeDetailIdsByTab: {
      lists: null,
      templates: null,
      recipes: null
    }
  };

  function getKey(name) {
    return STORAGE_PREFIX + name;
  }

  function get(name) {
    var key = getKey(name);
    var stored = localStorage.getItem(key);
    if (stored === null) {
      return defaults[name];
    }

    try {
      return JSON.parse(stored);
    } catch (error) {
      return defaults[name];
    }
  }

  function set(name, value) {
    var key = getKey(name);
    localStorage.setItem(key, JSON.stringify(value));
  }

  window.KaPSettings = {
    KEYS: KEYS,
    get: get,
    set: set
  };
})();
