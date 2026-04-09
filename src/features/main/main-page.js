(function () {
  var tabs = [
    {
      id: 'lists',
      label: 'Lists',
      actionLabel: '+ New',
      emptyStateText: 'No lists yet.'
    },
    {
      id: 'templates',
      label: 'Templates',
      actionLabel: '+ New',
      emptyStateText: 'No templates yet.'
    },
    {
      id: 'recipes',
      label: 'Recipes',
      actionLabel: '+ New',
      emptyStateText: 'Comming Soon'
    }
  ];

  var state = {
    selectedTabId: getInitialSelectedTabId(),
    showingSettings: false,
    detailRecordByTab: {
      lists: null,
      templates: null,
      recipes: null
    }
  };

  function findTab(id) {
    return tabs.find(function (tab) {
      return tab.id === id;
    });
  }

  function shouldRememberPosition() {
    return window.KaPSettings.get(window.KaPSettings.KEYS.REMEMBER_POSITION);
  }

  function getPersistedDetailIdsByTab() {
    var saved = window.KaPSettings.get(window.KaPSettings.KEYS.ACTIVE_DETAIL_IDS_BY_TAB);
    return saved || {
      lists: null,
      templates: null,
      recipes: null
    };
  }

  function setPersistedDetailId(tabId, recordId) {
    var current = getPersistedDetailIdsByTab();
    current[tabId] = recordId;
    window.KaPSettings.set(window.KaPSettings.KEYS.ACTIVE_DETAIL_IDS_BY_TAB, current);
  }

  async function restoreDetailRecordsFromSettings() {
    if (!shouldRememberPosition()) {
      return;
    }

    var saved = getPersistedDetailIdsByTab();

    if (saved.lists) {
      var listRecord = await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.LIST_RECORDS, saved.lists);
      if (listRecord && listRecord.type === 'List') {
        state.detailRecordByTab.lists = listRecord;
      }
    }

    if (saved.templates) {
      var templateRecord = await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.LIST_RECORDS, saved.templates);
      if (templateRecord && templateRecord.type === 'Template') {
        state.detailRecordByTab.templates = templateRecord;
      }
    }
  }

  function getInitialSelectedTabId() {
    var savedTabId = window.KaPSettings.get(window.KaPSettings.KEYS.ACTIVE_TAB);
    return findTab(savedTabId) ? savedTabId : 'lists';
  }

  function render() {
    renderTabs();
    renderContent();
    renderSettings();
  }

  function renderTabs() {
    var tabContainer = document.getElementById('main-tabs');

    window.KaPUI.ReplaceMainTabs(
      tabContainer,
      tabs,
      state.showingSettings ? null : state.selectedTabId,
      function (nextId) {
        if (state.showingSettings || state.selectedTabId !== nextId) {
          if (!shouldRememberPosition()) {
            state.detailRecordByTab[nextId] = null;
            setPersistedDetailId(nextId, null);
          }
          state.selectedTabId = nextId;
          window.KaPSettings.set(window.KaPSettings.KEYS.ACTIVE_TAB, nextId);
          state.showingSettings = false;
          render();
        }
      },
      function (tabId) {
        handlePrimaryAction(tabId).then(function () {
          renderContent();
        });
      }
    );

    // Disable + New button when viewing detail record
    var isViewingDetail = state.detailRecordByTab[state.selectedTabId] !== null;
    var selectedTabButton = tabContainer.querySelector('[aria-selected="true"]');
    if (selectedTabButton) {
      var inlineAction = selectedTabButton.querySelector('.tab-inline-action');
      if (inlineAction) {
        inlineAction.setAttribute('aria-disabled', isViewingDetail ? 'true' : 'false');
      }
    }
  }

  function renderSettings() {
    var settingsContainer = document.getElementById('settings-content');
    var mainContainer = document.getElementById('main-content');

    if (state.showingSettings) {
      settingsContainer.classList.add('active');
      mainContainer.classList.remove('active');
      window.KaPSettingsPage.renderInto(settingsContainer);
    } else {
      settingsContainer.classList.remove('active');
      mainContainer.classList.add('active');
    }
  }

  async function renderContent() {
    var selectedTab = findTab(state.selectedTabId);
    var contentContainer = document.getElementById('main-content');
    var detailRecord = state.detailRecordByTab[state.selectedTabId];

    if (detailRecord !== null) {
      var detailHooks = {
        onBack: function () {
          state.detailRecordByTab[state.selectedTabId] = null;
          setPersistedDetailId(state.selectedTabId, null);
          renderContent();
        },
        onAfterChange: function (updatedRecord) {
          state.detailRecordByTab[state.selectedTabId] = updatedRecord;
          setPersistedDetailId(state.selectedTabId, updatedRecord.id);
          renderContent();
        },
        onDeleted: function () {
          state.detailRecordByTab[state.selectedTabId] = null;
          setPersistedDetailId(state.selectedTabId, null);
          renderContent();
        }
      };

      if (selectedTab.id === 'lists') {
        await window.KaPListsPage.renderDetailInto(contentContainer, detailRecord, detailHooks);
      } else if (selectedTab.id === 'templates') {
        await window.KaPTemplatesPage.renderDetailInto(contentContainer, detailRecord, detailHooks);
      }
      return;
    }

    if (selectedTab.id === 'lists') {
      await window.KaPListsPage.renderInto(contentContainer, {
        onAfterChange: renderContent,
        onOpen: function (record) {
          state.detailRecordByTab[state.selectedTabId] = record;
          setPersistedDetailId(state.selectedTabId, record.id);
          renderContent();
        }
      });
      return;
    }

    if (selectedTab.id === 'templates') {
      await window.KaPTemplatesPage.renderInto(contentContainer, {
        onAfterChange: renderContent,
        onOpen: function (record) {
          state.detailRecordByTab[state.selectedTabId] = record;
          setPersistedDetailId(state.selectedTabId, record.id);
          renderContent();
        }
      });
      return;
    }

    window.KaPUI.ReplaceMainContent(contentContainer, {
      emptyStateText: selectedTab.emptyStateText
    });
  }

  async function handlePrimaryAction(tabId) {
    if (state.showingSettings || state.detailRecordByTab[state.selectedTabId] !== null) {
      return;
    }

    if (tabId === 'lists') {
      await window.KaPListsPage.createList();
    } else if (tabId === 'templates') {
      await window.KaPTemplatesPage.createTemplate();
    }
  }

  function openSettings() {
    state.showingSettings = true;
    render();
  }

  function closeSettings() {
    state.showingSettings = false;
    render();
  }

  function attachEventListeners() {
    var settingsButton = document.getElementById('settings-button');
    if (settingsButton) {
      settingsButton.addEventListener('click', openSettings);
    }
  }

  function render() {
    renderTabs();
    renderContent();
    renderSettings();
  }

  async function initialize() {
    attachEventListeners();
    await restoreDetailRecordsFromSettings();
    render();
  }

  window.KaPMainPage = {
    initialize: initialize
  };
})();
