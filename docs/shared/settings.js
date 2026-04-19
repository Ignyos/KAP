(function () {
  var STORAGE_PREFIX = 'kap.settings.';

  var KEYS = {
    ACTIVE_TAB: 'activeTab',
    ACTIVE_DETAIL_IDS_BY_TAB: 'activeDetailIdsByTab',
    EXPANDED_ACCORDION_SECTION: 'expandedAccordionSection',
    EXPANDED_ACCORDION_SECTIONS: 'expandedAccordionSections',
    MAIN_PAGE_SCROLL_TOP: 'mainPageScrollTop',
    CATEGORY_VIEW_BY_RECORD: 'categoryViewByRecord'
  };

  var defaults = {
    activeTab: 'lists',
    activeDetailIdsByTab: {
      lists: null,
      templates: null,
      recipes: null
    },
    expandedAccordionSection: null,
    expandedAccordionSections: [],
    mainPageScrollTop: 0,
    categoryViewByRecord: {
      lists: {},
      templates: {}
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
