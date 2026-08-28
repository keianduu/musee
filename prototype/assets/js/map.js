/* Muuzee Map Discovery — page specific */
(() => {
  "use strict";

  const exhibitions = window.MuuzeeExhibitionCatalog || [];
  const museums = window.MuuzeeMuseumCatalog || [];

  const mapEl = document.getElementById("discoveryMap");
  if(!mapEl || typeof L === "undefined") return;

  const modeButtons = [...document.querySelectorAll("[data-map-mode]")];
  const filterModeButtons = [...document.querySelectorAll("[data-filter-mode]")];
  const exhibitionGroups = document.querySelector("[data-exhibition-filter-groups]");
  const museumGroups = document.querySelector("[data-museum-filter-groups]");
  const statusOptions = document.querySelector("[data-exhibition-status-options]");
  const expressionOptions = document.querySelector("[data-expression-options]");
  const museumScopeOptions = document.querySelector("[data-museum-scope-options]");
  const museumAreaOptions = document.querySelector("[data-museum-area-options]");
  const museumAreaTitle = document.querySelector("[data-museum-area-title]");
  const applyButton = document.querySelector("[data-filter-apply]");
  const resetButton = document.querySelector("[data-filter-reset]");
  const openButton = document.querySelector("[data-filter-open]");
  const locateButton = document.querySelector("[data-locate]");
  const resultCount = document.querySelector("[data-map-result-count]");
  const resultLabel = document.querySelector("[data-map-result-label]");
  const filterSummary = document.querySelector("[data-map-filter-summary]");

  const state = {
    mode:"exhibition",
    filters:{
      exhibition:{status:[],expression:[]},
      museum:{scope:"jp",area:[]}
    }
  };

  let draftMode = state.mode;
  let draftFilters = JSON.parse(JSON.stringify(state.filters));
  let markerLayer = L.layerGroup();
  let currentLocationMarker = null;

  const map = L.map(mapEl,{
    scrollWheelZoom:true,
    zoomControl:true,
    attributionControl:true
  }).fitBounds(
    [[35.645,139.735],[35.728,139.825]],
    {padding:[24,24],maxZoom:12.5}
  );

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{
    subdomains:"abcd",
    maxZoom:20,
    attribution:"&copy; OpenStreetMap contributors &copy; CARTO"
  }).addTo(map);

  markerLayer.addTo(map);

  const esc = value => String(value ?? "").replace(/[&<>"']/g,char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));

  function storageKey(type){
    return type === "museum" ? "muuzee:saved-museums" : "muuzee:saved-exhibitions";
  }

  function savedIds(type){
    try{
      const value = JSON.parse(localStorage.getItem(storageKey(type)) || "[]");
      return Array.isArray(value) ? value : [];
    }catch{
      return [];
    }
  }

  function isSaved(type,id){
    return savedIds(type).includes(id);
  }

  function toggleSaved(type,id){
    const current = savedIds(type);
    const next = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current,id];

    localStorage.setItem(storageKey(type),JSON.stringify(next));
  }

  function exhibitionIcon(saved){
    return `
      <div class="muuzee-map-pin muuzee-map-pin--exhibition${saved ? " is-saved" : ""}">
        <svg viewBox="0 0 24 24">
          <rect x="5" y="4" width="14" height="16" rx="1.5"></rect>
          <circle cx="10" cy="9" r="1.3"></circle>
          <path d="m7 17 4-4 2.5 2.5 2-2 1.5 2"></path>
        </svg>
      </div>`;
  }

  function museumIcon(saved){
    return `
      <div class="muuzee-map-pin muuzee-map-pin--museum${saved ? " is-saved" : ""}">
        <svg viewBox="0 0 24 24">
          <path d="M4 9h16M6 9v9M10 9v9M14 9v9M18 9v9M4 18h16M5 8l7-4 7 4"></path>
        </svg>
      </div>`;
  }

  function createIcon(type,saved){
    return L.divIcon({
      className:"",
      html:type === "museum" ? museumIcon(saved) : exhibitionIcon(saved),
      iconSize:[34,34],
      iconAnchor:[17,17],
      popupAnchor:[0,-15]
    });
  }

  function exhibitionMatches(item){
    const f = state.filters.exhibition;

    if(f.status.length && !f.status.includes(item.status)) return false;
    if(f.expression.length && !f.expression.includes(item.expressionCategory)) return false;

    return true;
  }

  function museumMatches(item){
    const f = state.filters.museum;

    if(f.scope && item.scope !== f.scope) return false;

    if(f.area.length){
      const value = item.scope === "jp" ? item.region : item.city;
      if(!f.area.includes(value)) return false;
    }

    return true;
  }

  function currentItems(){
    return state.mode === "museum"
      ? museums.filter(museumMatches)
      : exhibitions.filter(exhibitionMatches);
  }

  function popupHTML(item,type){
    const saved = isSaved(type,item.id);
    const isMuseum = type === "museum";

    const meta = isMuseum
      ? [item.prefecture || item.country,item.city || item.location].filter(Boolean).join(" · ")
      : [item.statusLabel,item.expressionCategory].filter(Boolean).join(" · ");

    const sub = isMuseum
      ? item.category
      : `${item.venue} · ${item.date}`;

    const href = isMuseum
      ? `./museum.html?id=${encodeURIComponent(item.id)}`
      : (item.href || `./exhibition.html?id=${encodeURIComponent(item.id)}`);

    return `
      <article class="map-popup-card ${isMuseum ? "is-museum" : "is-exhibition"}">
        <div class="map-popup-image">
          <img src="${esc(isMuseum ? item.image : item.src)}" alt="${esc(item.name || item.title)}">
        </div>
        <div class="map-popup-body">
          <div class="map-popup-topline">
            <span class="map-popup-meta">${esc(meta)}</span>
            ${saved ? '<span class="map-popup-saved">保存済</span>' : ""}
          </div>
          <h3 class="map-popup-title">${esc(item.name || item.title)}</h3>
          <p class="map-popup-sub">${esc(sub)}</p>
          <div class="map-popup-actions">
            <button class="map-popup-save${saved ? " is-saved" : ""}" type="button"
              data-popup-save
              data-popup-type="${type}"
              data-popup-id="${esc(item.id)}">
              ${saved ? "保存済" : "保存"}
            </button>
            <a class="map-popup-detail" href="${esc(href)}">詳細を見る →</a>
          </div>
        </div>
      </article>`;
  }

  function renderMarkers({fit=false} = {}){
    markerLayer.clearLayers();

    const items = currentItems();

    items.forEach(item => {
      if(!Number.isFinite(item.lat) || !Number.isFinite(item.lng)) return;

      const type = state.mode;
      const marker = L.marker(
        [item.lat,item.lng],
        {icon:createIcon(type,isSaved(type,item.id))}
      );

      marker.bindPopup(
        popupHTML(item,type),
        {
          className:"muuzee-map-popup",
          maxWidth:420,
          minWidth:300,
          closeButton:false,
          offset:[0,-2]
        }
      );

      marker.addTo(markerLayer);
    });

    if(resultCount) resultCount.textContent = items.length;
    if(resultLabel) resultLabel.textContent = state.mode === "museum" ? "museums" : "exhibitions";

    renderModeButtons();
    renderSummary();

    if(fit && items.length){
      const bounds = L.latLngBounds(
        items
          .filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng))
          .map(item => [item.lat,item.lng])
      );

      if(bounds.isValid()){
        map.fitBounds(bounds,{padding:[70,70],maxZoom:13});
      }
    }
  }

  function renderModeButtons(){
    modeButtons.forEach(button => {
      const active = button.dataset.mapMode === state.mode;
      button.classList.toggle("is-active",active);
      button.setAttribute("aria-pressed",String(active));
    });
  }

  function summaryLabels(){
    if(state.mode === "exhibition"){
      const f = state.filters.exhibition;
      return [
        ...f.status.map(value => value === "now" ? "開催中" : "開催予定"),
        ...f.expression
      ];
    }

    const f = state.filters.museum;
    return [
      f.scope === "jp" ? "国内" : "海外",
      ...f.area
    ].filter(Boolean);
  }

  function renderSummary(){
    if(!filterSummary) return;
    const labels = summaryLabels();

    filterSummary.hidden = labels.length === 0;
    filterSummary.innerHTML = labels.map(label => `<span>${esc(label)}</span>`).join("");
  }

  function unique(values){
    return [...new Set(values.filter(Boolean))];
  }

  function renderExpressionOptions(){
    if(!expressionOptions) return;

    const values = unique(exhibitions.map(item => item.expressionCategory));

    expressionOptions.innerHTML = values.map(value => `
      <button class="filter-chip${draftFilters.exhibition.expression.includes(value) ? " is-selected" : ""}"
        type="button" data-expression-value="${esc(value)}">${esc(value)}</button>
    `).join("");
  }

  function renderMuseumAreaOptions(){
    if(!museumAreaOptions) return;

    const scope = draftFilters.museum.scope;
    const scoped = museums.filter(item => item.scope === scope);
    const values = scope === "jp"
      ? unique(scoped.map(item => item.region))
      : unique(scoped.map(item => item.city));

    if(museumAreaTitle){
      museumAreaTitle.textContent = scope === "jp" ? "地方" : "主要都市";
    }

    museumAreaOptions.innerHTML = values.map(value => `
      <button class="filter-chip${draftFilters.museum.area.includes(value) ? " is-selected" : ""}"
        type="button" data-museum-area-value="${esc(value)}">${esc(value)}</button>
    `).join("");
  }

  function renderFilterUI(){
    filterModeButtons.forEach(button => {
      button.classList.toggle("is-selected",button.dataset.filterMode === draftMode);
    });

    exhibitionGroups.hidden = draftMode !== "exhibition";
    museumGroups.hidden = draftMode !== "museum";

    [...statusOptions.querySelectorAll("[data-value]")].forEach(button => {
      button.classList.toggle(
        "is-selected",
        draftFilters.exhibition.status.includes(button.dataset.value)
      );
    });

    [...museumScopeOptions.querySelectorAll("[data-value]")].forEach(button => {
      button.classList.toggle(
        "is-selected",
        draftFilters.museum.scope === button.dataset.value
      );
    });

    renderExpressionOptions();
    renderMuseumAreaOptions();
  }

  function setMode(mode,{fit=false} = {}){
    state.mode = mode;
    draftMode = mode;
    renderMarkers({fit});
  }

  modeButtons.forEach(button => {
    button.addEventListener("click",() => {
      setMode(button.dataset.mapMode,{fit:false});
    });
  });

  filterModeButtons.forEach(button => {
    button.addEventListener("click",() => {
      draftMode = button.dataset.filterMode;
      renderFilterUI();
    });
  });

  statusOptions?.addEventListener("click",event => {
    const button = event.target.closest("[data-value]");
    if(!button) return;

    const value = button.dataset.value;
    const values = draftFilters.exhibition.status;

    draftFilters.exhibition.status = values.includes(value)
      ? values.filter(item => item !== value)
      : [...values,value];

    renderFilterUI();
  });

  expressionOptions?.addEventListener("click",event => {
    const button = event.target.closest("[data-expression-value]");
    if(!button) return;

    const value = button.dataset.expressionValue;
    const values = draftFilters.exhibition.expression;

    draftFilters.exhibition.expression = values.includes(value)
      ? values.filter(item => item !== value)
      : [...values,value];

    renderFilterUI();
  });

  museumScopeOptions?.addEventListener("click",event => {
    const button = event.target.closest("[data-value]");
    if(!button) return;

    draftFilters.museum.scope = button.dataset.value;
    draftFilters.museum.area = [];
    renderFilterUI();
  });

  museumAreaOptions?.addEventListener("click",event => {
    const button = event.target.closest("[data-museum-area-value]");
    if(!button) return;

    const value = button.dataset.museumAreaValue;
    const values = draftFilters.museum.area;

    draftFilters.museum.area = values.includes(value)
      ? values.filter(item => item !== value)
      : [...values,value];

    renderFilterUI();
  });

  openButton?.addEventListener("click",() => {
    draftMode = state.mode;
    draftFilters = JSON.parse(JSON.stringify(state.filters));
    renderFilterUI();
  });

  applyButton?.addEventListener("click",() => {
    state.mode = draftMode;
    state.filters = JSON.parse(JSON.stringify(draftFilters));
    renderMarkers({fit:true});
    window.Muuzee?.filterSheet?.close?.();
  });

  resetButton?.addEventListener("click",() => {
    draftFilters = {
      exhibition:{status:[],expression:[]},
      museum:{scope:"jp",area:[]}
    };
    renderFilterUI();
  });

  mapEl.addEventListener("click",event => {
    const button = event.target.closest("[data-popup-save]");
    if(!button) return;

    event.preventDefault();
    event.stopPropagation();

    toggleSaved(button.dataset.popupType,button.dataset.popupId);
    renderMarkers({fit:false});
  });

  locateButton?.addEventListener("click",() => {
    if(!navigator.geolocation) return;

    locateButton.classList.add("is-loading");

    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if(currentLocationMarker){
          map.removeLayer(currentLocationMarker);
        }

        currentLocationMarker = L.marker(
          [lat,lng],
          {
            icon:L.divIcon({
              className:"",
              html:'<div class="muuzee-current-pin"></div>',
              iconSize:[18,18],
              iconAnchor:[9,9]
            }),
            interactive:false
          }
        ).addTo(map);

        map.setView([lat,lng],14,{animate:true});
        locateButton.classList.remove("is-loading");
      },
      () => {
        locateButton.classList.remove("is-loading");
      },
      {enableHighAccuracy:false,timeout:8000,maximumAge:300000}
    );
  });

  renderFilterUI();
  renderMarkers({fit:false});

  requestAnimationFrame(() => map.invalidateSize({pan:false}));
  setTimeout(() => map.invalidateSize({pan:false}),180);

  if("ResizeObserver" in window){
    const observer = new ResizeObserver(() => map.invalidateSize({pan:false}));
    observer.observe(mapEl);
  }

  window.addEventListener("orientationchange",() => {
    setTimeout(() => map.invalidateSize({pan:false}),240);
  });
})();
