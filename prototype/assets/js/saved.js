/* Muuzee Saved — uses source list/detail UI components */
(() => {
  "use strict";

  const data = window.MuuzeePersonalData?.saved;
  const renderers = window.MuuzeeCollectionRenderers;
  const artists = window.MuuzeeArtistCatalog || [];
  const museums = window.MuuzeeMuseumCatalog || [];
  const exhibitions = window.MuuzeeExhibitionCatalog || [];

  if(!data || !renderers) return;

  const tabs = [...document.querySelectorAll("[data-collection-tab]")];
  const list = document.querySelector("[data-collection-list]");
  const empty = document.querySelector("[data-collection-empty]");
  const emptyTitle = document.querySelector("[data-empty-title]");
  const emptyCopy = document.querySelector("[data-empty-copy]");

  const dialogLayer = document.querySelector("[data-save-confirm]");
  const dialogLabel = document.querySelector("[data-confirm-label]");
  const cancelButton = document.querySelector("[data-confirm-cancel]");
  const submitButton = document.querySelector("[data-confirm-submit]");

  const configs = {
    artist:{label:"Artist",empty:"保存したArtistはまだありません"},
    work:{label:"作品",empty:"保存した作品はまだありません"},
    museum:{label:"美術館",empty:"保存した美術館はまだありません"},
    exhibition:{label:"展覧会",empty:"保存した展覧会はまだありません"}
  };

  let activeType = location.hash.replace("#","") || "artist";
  if(!configs[activeType]) activeType = "artist";

  let pending = null;
  let lastFocused = null;

  const findArtist = name => artists.find(item => item.name === name);
  const findMuseum = id => museums.find(item => item.id === id);
  const findExhibition = id => exhibitions.find(item => item.id === id || item.title === id);

  function itemsFor(type){
    if(type === "artist") return data.artists().map(findArtist).filter(Boolean);
    if(type === "work") return data.works();
    if(type === "museum") return data.museums().map(findMuseum).filter(Boolean);
    return data.exhibitions().map(findExhibition).filter(Boolean);
  }

  function classFor(type){
    if(type === "artist") return "artist-grid";
    if(type === "work") return "work-list";
    if(type === "museum") return "museum-grid";
    return "exhibition-grid";
  }

  function renderCard(item,index){
    if(activeType === "artist") return renderers.artistCard(item,{removable:true});
    if(activeType === "work") return renderers.workRow(item,index,{removable:true});
    if(activeType === "museum") return renderers.museumCard(item,{removable:true});
    return renderers.exhibitionCard(item,{removable:true});
  }

  function renderCounts(){
    const counts = {
      artist:itemsFor("artist").length,
      work:itemsFor("work").length,
      museum:itemsFor("museum").length,
      exhibition:itemsFor("exhibition").length
    };

    tabs.forEach(tab => {
      const count = tab.querySelector("em");
      if(count) count.textContent = counts[tab.dataset.collectionTab] || 0;
    });
  }

  function render(){
    const items = itemsFor(activeType);

    tabs.forEach(tab => {
      const active = tab.dataset.collectionTab === activeType;
      tab.classList.toggle("is-active",active);
      tab.setAttribute("aria-selected",String(active));
    });

    list.className = `collection-list ${classFor(activeType)}`;
    list.innerHTML = items.map(renderCard).join("");
    list.hidden = items.length === 0;

    empty.hidden = items.length !== 0;

    if(!items.length){
      emptyTitle.textContent = configs[activeType].empty;
      emptyCopy.textContent = "保存するとここに表示されます。";
    }

    renderCounts();
  }

  function openDialog(button){
    pending = {
      type:button.dataset.removeType,
      id:button.dataset.removeId,
      label:button.dataset.removeLabel,
      artist:button.dataset.removeArtist || ""
    };

    lastFocused = button;
    dialogLabel.textContent = `「${pending.label}」を保存一覧から削除します。`;
    dialogLayer.hidden = false;
    cancelButton.focus({preventScroll:true});
  }

  function closeDialog(){
    dialogLayer.hidden = true;
    pending = null;

    if(lastFocused){
      lastFocused.focus({preventScroll:true});
      lastFocused = null;
    }
  }

  list.addEventListener("click",event => {
    const button = event.target.closest("[data-remove-type]");
    if(!button) return;

    event.preventDefault();
    event.stopPropagation();
    openDialog(button);
  });

  tabs.forEach(tab => {
    tab.addEventListener("click",() => {
      activeType = tab.dataset.collectionTab;
      history.replaceState(null,"",`#${activeType}`);
      render();
    });
  });

  cancelButton.addEventListener("click",closeDialog);

  dialogLayer.addEventListener("click",event => {
    if(event.target === dialogLayer) closeDialog();
  });

  submitButton.addEventListener("click",() => {
    if(!pending) return;

    if(pending.type === "artist") data.removeArtist(pending.id);
    if(pending.type === "work") data.removeWork(pending.artist,pending.label);
    if(pending.type === "museum") data.removeMuseum(pending.id);
    if(pending.type === "exhibition") data.removeExhibition(pending.id);

    dialogLayer.hidden = true;
    pending = null;
    lastFocused = null;
    render();
  });

  document.addEventListener("keydown",event => {
    if(event.key === "Escape" && !dialogLayer.hidden) closeDialog();
  });

  render();
})();
