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
      emptyStateText: 'No recipes yet.'
    }
  ];

  var state = {
    selectedTabId: 'lists'
  };

  function findTab(id) {
    return tabs.find(function (tab) {
      return tab.id === id;
    });
  }

  function renderTabs() {
    var tabContainer = document.getElementById('main-tabs');

    window.KaPUI.ReplaceMainTabs(
      tabContainer,
      tabs,
      state.selectedTabId,
      function (nextId) {
        if (state.selectedTabId !== nextId) {
          state.selectedTabId = nextId;
          render();
        }
      },
      function (tabId) {
        handlePrimaryAction(tabId).then(function () {
          renderContent();
        });
      }
    );
  }

  async function renderContent() {
    var selectedTab = findTab(state.selectedTabId);
    var contentContainer = document.getElementById('main-content');

    if (selectedTab.id === 'lists') {
      await window.KaPListsPage.renderInto(contentContainer, {
        onAfterChange: renderContent
      });
      return;
    }

    if (selectedTab.id === 'templates') {
      await window.KaPTemplatesPage.renderInto(contentContainer, {
        onAfterChange: renderContent
      });
      return;
    }

    window.KaPUI.ReplaceMainContent(contentContainer, {
      emptyStateText: selectedTab.emptyStateText
    });
  }

  async function handlePrimaryAction(tabId) {
    if (tabId === 'lists') {
      await window.KaPListsPage.createList();
    } else if (tabId === 'templates') {
      await window.KaPTemplatesPage.createTemplate();
    }
  }

  function render() {
    renderTabs();
    renderContent();
  }

  function initialize() {
    render();
  }

  window.KaPMainPage = {
    initialize: initialize
  };
})();
