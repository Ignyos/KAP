(function () {
  var sectionDefinitions = [
    {
      id: 'lists',
      label: 'Grocery Lists',
      getAllFn: function () { return window.KaPListsService.getAllLists(); },
      renderDetailFn: function (container, record, hooks) { return window.KaPListsPage.renderDetailInto(container, record, hooks); },
      createFn: function () { return window.KaPListsPage.createList(); }
    },
    {
      id: 'templates',
      label: 'Pantry & Fridge',
      getAllFn: function () { return window.KaPTemplatesService.getAllTemplates(); },
      renderDetailFn: function (container, record, hooks) { return window.KaPTemplatesPage.renderDetailInto(container, record, hooks); },
      createFn: function () { return window.KaPTemplatesPage.createTemplate(); }
    },
    {
      id: 'recipes',
      label: 'Recipes',
      isComingSoon: true,
      getAllFn: function () { return Promise.resolve([]); },
      renderDetailFn: function () { return Promise.resolve(); },
      createFn: function () {
        return window.KaPUI.ShowAlert({
          title: 'Recipes',
          message: 'Recipes are coming soon.'
        });
      }
    }
  ];

  var state = {
    expandedSectionId: getSavedExpandedSection(),
    settingsReturnPath: '/'
  };

  var currentRoute = null;
  var requestedDetailRecord = null;

  function getSavedExpandedSection() {
    return window.KaPSettings.get(window.KaPSettings.KEYS.EXPANDED_ACCORDION_SECTION) || null;
  }

  function saveExpandedSection(sectionId) {
    window.KaPSettings.set(window.KaPSettings.KEYS.EXPANDED_ACCORDION_SECTION, sectionId);
  }

  function findSection(id) {
    return sectionDefinitions.find(function (section) {
      return section.id === id;
    });
  }

  function getPathForRoute(route) {
    if (!route) {
      return '/';
    }

    if (route.view === 'list' && route.id) {
      return '/list/' + route.id;
    }

    if (route.view === 'template' && route.id) {
      return '/template/' + route.id;
    }

    return '/';
  }

  function onRouteChange(route) {
    currentRoute = route;

    if (route.view !== 'settings') {
      state.settingsReturnPath = getPathForRoute(route);
    }
    
    if (route.view === 'home') {
      renderHome().catch(function (error) {
        console.error('Error rendering home:', error);
      });
    } else if (route.view === 'settings') {
      renderSettingsPage().catch(function (error) {
        console.error('Error rendering settings:', error);
      });
    } else if (route.view === 'list' && route.id) {
      renderListDetail(route.id).catch(function (error) {
        console.error('Error rendering list detail:', error);
      });
    } else if (route.view === 'template' && route.id) {
      renderTemplateDetail(route.id).catch(function (error) {
        console.error('Error rendering template detail:', error);
      });
    }
  }

  async function renderHome() {
    var contentContainer = document.getElementById('main-content');
    if (!contentContainer) {
      console.error('Content container not found');
      return;
    }
    
    // Get counts for all sections
    var counts = {};
    for (var i = 0; i < sectionDefinitions.length; i++) {
      var section = sectionDefinitions[i];
      try {
        var records = await section.getAllFn();
        counts[section.id] = records.length;
      } catch (error) {
        console.error('Error fetching ' + section.id + ':', error);
        counts[section.id] = 0;
      }
    }

    // Render accordion home view
    contentContainer.innerHTML = '';
    var homeContainer = document.createElement('div');
    homeContainer.className = 'accordion-container';

    for (var j = 0; j < sectionDefinitions.length; j++) {
      var currentSection = sectionDefinitions[j];
      var isExpanded = state.expandedSectionId === currentSection.id;
      
      var accordionSection = createAccordionSection(
        currentSection,
        counts[currentSection.id],
        isExpanded
      );
      homeContainer.appendChild(accordionSection);
    }

    contentContainer.appendChild(homeContainer);
  }

  function createAccordionSection(section, count, isExpanded) {
    var container = document.createElement('div');
    container.className = 'accordion-section';
    container.dataset.sectionId = section.id;

    var header = document.createElement('div');
    header.className = 'accordion-header';
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    header.setAttribute('aria-controls', 'accordion-content-' + section.id);

    header.addEventListener('click', function () {
      handleSectionToggle(section.id);
    });

    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSectionToggle(section.id);
      }
    });

    var headerLabel = document.createElement('span');
    headerLabel.className = 'accordion-label';

    var headerLabelText = document.createElement('span');
    headerLabelText.textContent = section.label;

    var countBadge = document.createElement('span');
    countBadge.className = 'accordion-count-badge';
    countBadge.textContent = String(count);

    headerLabel.appendChild(headerLabelText);
    headerLabel.appendChild(countBadge);

    var headerActions = document.createElement('div');
    headerActions.className = 'accordion-actions';

    var newButton = document.createElement('button');
    newButton.type = 'button';
    newButton.className = 'accordion-new-button';
    newButton.textContent = '+ New';
    newButton.addEventListener('click', function (e) {
      e.stopPropagation();
      handleNewSection(section.id);
    });

    headerActions.appendChild(newButton);

    header.appendChild(headerLabel);
    header.appendChild(headerActions);

    var content = document.createElement('div');
    content.id = 'accordion-content-' + section.id;
    content.className = 'accordion-content';
    content.setAttribute('role', 'region');
    content.setAttribute('aria-labelledby', 'accordion-header-' + section.id);

    if (isExpanded) {
      content.classList.add('expanded');
      renderSectionContent(content, section);
    }

    container.appendChild(header);
    container.appendChild(content);

    return container;
  }

  async function renderSectionContent(contentElement, section) {
    try {
      var records = await section.getAllFn();
      var listItemCountsById = {};

      if (section.isComingSoon) {
        contentElement.innerHTML = '<div class="empty-state-message">Recipes are coming soon.</div>';
        return;
      }
      
      if (records.length === 0) {
        contentElement.innerHTML = '<div class="empty-state-message">No ' + section.label.toLowerCase() + ' yet.</div>';
        return;
      }

      if (section.id === 'lists') {
        var countPairs = await Promise.all(records.map(async function (record) {
          try {
            var itemCount = await window.KaPListsService.getListItemCount(record.id);
            return { id: record.id, count: itemCount };
          } catch (error) {
            return { id: record.id, count: 0 };
          }
        }));

        countPairs.forEach(function (pair) {
          listItemCountsById[pair.id] = pair.count;
        });
      }

      var recordList = document.createElement('div');
      recordList.className = 'record-list';

      records.forEach(function (record) {
        var row = createRecordRow(record, section, listItemCountsById[record.id]);
        recordList.appendChild(row);
      });

      contentElement.innerHTML = '';
      contentElement.appendChild(recordList);
    } catch (error) {
      console.error('Error rendering section content:', error);
      contentElement.innerHTML = '<div class="empty-state-message">Error loading ' + section.label.toLowerCase() + '.</div>';
    }
  }

  function createRecordRow(record, section, listItemCount) {
    var row = document.createElement('div');
    row.className = 'accordion-record-row';

    var nameSpan = document.createElement('span');
    nameSpan.className = 'record-name';
    nameSpan.textContent = record.name;

    row.appendChild(nameSpan);

    if (section.id === 'lists') {
      var countPill = document.createElement('span');
      countPill.className = 'list-item-count-pill';
      countPill.textContent = String(listItemCount || 0);
      countPill.setAttribute('aria-label', String(listItemCount || 0) + ' items');
      row.appendChild(countPill);
    }

    row.addEventListener('click', function () {
      handleRecordOpen(record, section);
    });

    return row;
  }

  function handleSectionToggle(sectionId) {
    if (state.expandedSectionId === sectionId) {
      state.expandedSectionId = null;
    } else {
      state.expandedSectionId = sectionId;
    }
    saveExpandedSection(state.expandedSectionId);
    renderHome();
  }

  async function handleNewSection(sectionId) {
    var section = findSection(sectionId);
    if (section) {
      try {
        await section.createFn();
        renderHome();
      } catch (error) {
        console.error('Error creating new item:', error);
      }
    }
  }

  function handleRecordOpen(record, section) {
    if (section.id === 'lists') {
      window.KaPRouter.navigate('/list/' + record.id);
    } else if (section.id === 'templates') {
      window.KaPRouter.navigate('/template/' + record.id);
    }
  }

  async function renderListDetail(listId) {
    try {
      var record = await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.LIST_RECORDS, listId);
      if (!record || record.type !== 'List') {
        throw new Error('List not found');
      }
      renderDetailPage(record, 'lists');
    } catch (error) {
      console.error('Error loading list:', error);
      window.KaPRouter.navigate('/');
    }
  }

  async function renderTemplateDetail(templateId) {
    try {
      var record = await window.KaPDB.readByKey(window.KaPStores.STORE_NAMES.LIST_RECORDS, templateId);
      if (!record || record.type !== 'Template') {
        throw new Error('Template not found');
      }
      renderDetailPage(record, 'templates');
    } catch (error) {
      console.error('Error loading template:', error);
      window.KaPRouter.navigate('/');
    }
  }

  async function renderDetailPage(record, sectionId) {
    var section = findSection(sectionId);
    var contentContainer = document.getElementById('main-content');

    var detailHooks = {
      onBack: function () {
        window.KaPRouter.navigate('/');
      },
      onAfterChange: function (updatedRecord) {
        renderDetailPage(updatedRecord, sectionId);
      },
      onDeleted: function () {
        window.KaPRouter.navigate('/');
      }
    };

    if (section) {
      await section.renderDetailFn(contentContainer, record, detailHooks);
    }
  }

  async function renderSettingsPage() {
    var contentContainer = document.getElementById('main-content');
    if (!contentContainer) {
      return;
    }

    await window.KaPSettingsPage.renderInto(contentContainer, {
      onBack: function () {
        window.KaPRouter.navigate(state.settingsReturnPath || '/');
      }
    });
  }

  function openSettings() {
    if (currentRoute && currentRoute.view !== 'settings') {
      state.settingsReturnPath = getPathForRoute(currentRoute);
    }

    window.KaPRouter.navigate('/settings');
  }

  function attachEventListeners() {
    var settingsButton = document.getElementById('settings-button');
    if (settingsButton) {
      settingsButton.addEventListener('click', openSettings);
    }
  }

  async function initialize() {
    attachEventListeners();
    var mainContainer = document.getElementById('main-content');
    if (mainContainer) {
      mainContainer.classList.add('active');
    }
    
    // Hide the old tab navigation
    var tabNav = document.querySelector('.tab-nav');
    if (tabNav) {
      tabNav.style.display = 'none';
    }

    // Listen for route changes
    window.KaPRouter.onRouteChange(onRouteChange);
    
    // Initialize router which will trigger initial route
    window.KaPRouter.init();
  }

  window.KaPMainPage = {
    initialize: initialize
  };
})();
