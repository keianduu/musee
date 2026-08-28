/* Muuzee Saved — page specific */
(() => {
  "use strict";

  const data = window.MuuzeePersonalData?.saved;
  const artists = window.MuuzeeArtistCatalog || [];
  const museums = window.MuuzeeMuseumCatalog || [];
  const exhibitions = window.MuuzeeExhibitionCatalog || [];

  if(!data) return;

  const tabs = [...document.querySelectorAll("[data-saved-tab]")];
  const grid = document.querySelector("[data-saved-grid]");
  const empty = document.querySelector("[data-saved-empty]");
  const emptyTitle = document.querySelector("[data-empty-title]");
  const emptyCopy = document.querySelector("[data-empty-copy]");
  const emptyLink = document.querySelector("[data-empty-link]");
  const dialogLayer = document.querySelector("[data-save-confirm]");
  const dialogLabel = document.querySelector("[data-confirm-label]");
  const cancelButton = document.querySelector("[data-confirm-cancel]");
  const submitButton = document.querySelector("[data-confirm-submit]");

  const esc = value => String(value ?? "").replace(/[&<>"']/g,char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));

  const configs = {
    artist:{
      label:"Artist",
      emptyTitle:"保存したArtistはまだありません",
      emptyCopy:"気になるArtistを保存すると、ここからすぐにプロフィールへ戻れます。",
      emptyHref:"./artists.html",
      emptyCta:"Artistを探す →"
    },
    work:{
      label:"作品",
      emptyTitle:"保存した作品はまだありません",
      emptyCopy:"Artist詳細から気になる作品を保存すると、ここにまとまります。",
      emptyHref:"./artists.html",
      emptyCta:"Artistから作品を探す →"
    },
    museum:{
      label:"美術館",
      emptyTitle:"保存した美術館はまだありません",
      emptyCopy:"行ってみたい美術館を保存して、自分の行き先リストをつくれます。",
      emptyHref:"./museums.html",
      emptyCta:"美術館を探す →"
    },
    exhibition:{
      label:"展覧会",
      emptyTitle:"保存した展覧会はまだありません",
      emptyCopy:"これから見たい展覧会を保存すると、ここでまとめて確認できます。",
      emptyHref:"./exhibitions.html",
      emptyCta:"展覧会を探す →"
    }
  };

  let activeType = location.hash.replace("#","") || "artist";
  if(!configs[activeType]) activeType = "artist";

  let pending = null;
  let lastFocused = null;

  function savedArtistItems(){
    const names = data.artists();
    return names.map(name => {
      const item = artists.find(artist => artist.name === name);
      return item || {
        name,
        image:"",
        category:[],
        country:""
      };
    });
  }

  function savedMuseumItems(){
    const ids = data.museums();
    return ids.map(id => museums.find(item => item.id === id)).filter(Boolean);
  }

  function savedExhibitionItems(){
    const ids = data.exhibitions();
    return ids.map(id => {
      return exhibitions.find(item => item.id === id || item.title === id);
    }).filter(Boolean);
  }

  function itemsFor(type){
    if(type === "artist") return savedArtistItems();
    if(type === "work") return data.works();
    if(type === "museum") return savedMuseumItems();
    return savedExhibitionItems();
  }

  function renderCounts(){
    const counts = {
      artist:savedArtistItems().length,
      work:data.works().length,
      museum:savedMuseumItems().length,
      exhibition:savedExhibitionItems().length
    };

    tabs.forEach(tab => {
      const count = tab.querySelector("em");
      if(count) count.textContent = counts[tab.dataset.savedTab] || 0;
    });
  }

  function removeButton(type,id,label,artist=""){
    return `
      <button class="saved-remove-button" type="button"
        data-remove-type="${esc(type)}"
        data-remove-id="${esc(id)}"
        data-remove-label="${esc(label)}"
        ${artist ? `data-remove-artist="${esc(artist)}"` : ""}
        aria-label="${esc(label)}の保存を解除">
        <svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4Z"></path></svg>
      </button>`;
  }

  function artistCard(item){
    const image = item.image || item.img || "";
    const meta = [
      ...(item.category || []).slice(0,1),
      item.country
    ].filter(Boolean).join(" · ");

    return `
      <article class="saved-card saved-artist-card">
        ${removeButton("artist",item.name,item.name)}
        <a class="saved-card-link" href="./artist.html?name=${encodeURIComponent(item.name)}">
          <div class="saved-artist-image">
            ${image
              ? `<img src="${esc(image)}" alt="${esc(item.name)}" loading="lazy" style="object-position:${esc(item.position || "center")}">`
              : ""}
          </div>
          <h3>${esc(item.name)}</h3>
          <p>${esc(meta)}</p>
        </a>
      </article>`;
  }

  function workCard(item){
    return `
      <article class="saved-card saved-work-card">
        ${removeButton("work",item.id,item.title,item.artist)}
        <div class="saved-work-visual">
          <small>Artwork</small>
          <strong>${esc(item.title)}</strong>
        </div>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.artist)}</p>
      </article>`;
  }

  function museumCard(item){
    const place = item.scope === "jp"
      ? [item.prefecture,item.city].filter(Boolean).join(" · ")
      : [item.city,item.country].filter(Boolean).join(" · ");

    return `
      <article class="saved-card saved-card--museum">
        ${removeButton("museum",item.id,item.name)}
        <a class="saved-card-link" href="./museum.html?id=${encodeURIComponent(item.id)}">
          <div class="saved-card-image">
            <img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy">
          </div>
          <div class="saved-card-meta">${esc(place)}</div>
          <h3>${esc(item.name)}</h3>
          <p>${esc(item.category)}</p>
        </a>
      </article>`;
  }

  function exhibitionCard(item){
    return `
      <article class="saved-card saved-card--exhibition">
        ${removeButton("exhibition",item.id,item.title)}
        <a class="saved-card-link" href="${esc(item.href || `./exhibition.html?id=${encodeURIComponent(item.id)}`)}">
          <div class="saved-card-image">
            <img src="${esc(item.src)}" alt="${esc(item.title)}" loading="lazy">
          </div>
          <div class="saved-card-meta">${esc([item.statusLabel,item.date].filter(Boolean).join(" · "))}</div>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.venue)}</p>
        </a>
      </article>`;
  }

  function render(){
    const items = itemsFor(activeType);
    const config = configs[activeType];

    tabs.forEach(tab => {
      const active = tab.dataset.savedTab === activeType;
      tab.classList.toggle("is-active",active);
      tab.setAttribute("aria-selected",String(active));
    });

    grid.dataset.savedType = activeType;

    grid.innerHTML = items.map(item => {
      if(activeType === "artist") return artistCard(item);
      if(activeType === "work") return workCard(item);
      if(activeType === "museum") return museumCard(item);
      return exhibitionCard(item);
    }).join("");

    grid.hidden = items.length === 0;
    empty.hidden = items.length !== 0;

    if(!items.length){
      emptyTitle.textContent = config.emptyTitle;
      emptyCopy.textContent = config.emptyCopy;
      emptyLink.href = config.emptyHref;
      emptyLink.textContent = config.emptyCta;
    }

    renderCounts();
  }

  function closeDialog(){
    dialogLayer.hidden = true;
    pending = null;

    if(lastFocused){
      lastFocused.focus({preventScroll:true});
      lastFocused = null;
    }
  }

  function openDialog(button){
    const type = button.dataset.removeType;
    const id = button.dataset.removeId;
    const label = button.dataset.removeLabel;
    const artist = button.dataset.removeArtist || "";

    pending = {type,id,label,artist};
    lastFocused = button;

    dialogLabel.textContent = `「${label}」を保存一覧から削除します。`;
    dialogLayer.hidden = false;
    cancelButton.focus({preventScroll:true});
  }

  grid.addEventListener("click",event => {
    const button = event.target.closest("[data-remove-type]");
    if(!button) return;

    event.preventDefault();
    event.stopPropagation();
    openDialog(button);
  });

  tabs.forEach(tab => {
    tab.addEventListener("click",() => {
      activeType = tab.dataset.savedTab;
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

    if(pending.type === "artist"){
      data.removeArtist(pending.id);
    }else if(pending.type === "work"){
      data.removeWork(pending.artist,pending.label);
    }else if(pending.type === "museum"){
      data.removeMuseum(pending.id);
    }else if(pending.type === "exhibition"){
      data.removeExhibition(pending.id);
    }

    dialogLayer.hidden = true;
    pending = null;
    lastFocused = null;
    render();
  });

  document.addEventListener("keydown",event => {
    if(event.key === "Escape" && !dialogLayer.hidden){
      closeDialog();
    }
  });

  render();
})();
