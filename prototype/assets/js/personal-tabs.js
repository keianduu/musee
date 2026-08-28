/* Muuzee Seen / Favorites tabbed personal collections */
(() => {
  "use strict";

  const root = document.querySelector("[data-personal-kind]");
  const list = document.querySelector("[data-collection-list]");
  const empty = document.querySelector("[data-collection-empty]");
  const emptyTitle = document.querySelector("[data-empty-title]");
  const emptyCopy = document.querySelector("[data-empty-copy]");
  const tabs = [...document.querySelectorAll("[data-collection-tab]")];

  const data = window.MuuzeePersonalData;
  const renderers = window.MuuzeeCollectionRenderers;

  if(!root || !list || !data || !renderers) return;

  const kind = root.dataset.personalKind;
  const artists = window.MuuzeeArtistCatalog || [];
  const museums = window.MuuzeeMuseumCatalog || [];
  const exhibitions = window.MuuzeeExhibitionCatalog || [];

  const allowed = kind === "favorites"
    ? ["artist","museum"]
    : ["artist","work","museum","exhibition"];

  let activeType = location.hash.replace("#","") || allowed[0];
  if(!allowed.includes(activeType)) activeType = allowed[0];

  const source = () => kind === "favorites" ? data.favorites() : data.seen();

  const findArtist = name => artists.find(item => item.name === name);
  const findMuseum = id => museums.find(item => item.id === id);
  const findExhibition = id => exhibitions.find(item => item.id === id);

  function resolvedItems(type){
    return source()
      .filter(item => item?.type === type)
      .map(item => {
        if(type === "artist") return findArtist(item.id);
        if(type === "museum") return findMuseum(item.id);
        if(type === "exhibition") return findExhibition(item.id);
        if(type === "work"){
          return {
            id:item.id,
            title:item.title || item.id,
            artist:item.artist || "",
            year:item.year || ""
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  function classFor(type){
    if(type === "artist") return "artist-grid";
    if(type === "work") return "work-list";
    if(type === "museum") return "museum-grid";
    return "exhibition-grid";
  }

  function renderCard(item,index){
    if(activeType === "artist") return renderers.artistCard(item);
    if(activeType === "work") return renderers.workRow(item,index,{seen:true});
    if(activeType === "museum") return renderers.museumCard(item);
    return renderers.exhibitionCard(item);
  }

  function labelFor(type){
    return {
      artist:"Artist",
      work:"作品",
      museum:"美術館",
      exhibition:"展覧会"
    }[type];
  }

  function renderCounts(){
    tabs.forEach(tab => {
      const items = resolvedItems(tab.dataset.collectionTab);
      const count = tab.querySelector("em");
      if(count) count.textContent = items.length;
    });
  }

  function render(){
    const items = resolvedItems(activeType);

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
      emptyTitle.textContent = `${labelFor(activeType)}はまだありません`;
      emptyCopy.textContent = kind === "favorites"
        ? "推しに登録するとここに表示されます。"
        : "「見た」に登録するとここに表示されます。";
    }

    renderCounts();
  }

  tabs.forEach(tab => {
    tab.addEventListener("click",() => {
      activeType = tab.dataset.collectionTab;
      history.replaceState(null,"",`#${activeType}`);
      render();
    });
  });

  render();
})();
