/* Muuzee Museum Detail — page specific */
(() => {
  "use strict";

  const catalog = window.MuuzeeMuseumCatalog || [];
  if(!catalog.length) return;

  const params = new URLSearchParams(location.search);
  const requestedId = params.get("id");
  const museum = catalog.find(item => item.id === requestedId) || catalog[0];

  const artistCatalog = window.MuuzeeArtistCatalog || [];

  const esc = value => String(value ?? "").replace(/[&<>"']/g,char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));

  const hero = document.querySelector("[data-museum-hero]");
  const nameEl = document.querySelector("[data-museum-name]");
  const metaEl = document.querySelector("[data-museum-meta]");
  const locationEl = document.querySelector("[data-museum-location]");
  const descriptionEl = document.querySelector("[data-museum-description]");
  const addressEl = document.querySelector("[data-museum-address]");
  const accessEl = document.querySelector("[data-museum-access]");
  const hoursEl = document.querySelector("[data-museum-hours]");
  const closedEl = document.querySelector("[data-museum-closed]");
  const openingNoteEl = document.querySelector("[data-museum-opening-note]");
  const mapLink = document.querySelector("[data-map-link]");
  const exhibitionsEl = document.querySelector("[data-museum-exhibitions]");
  const exhibitionsEmpty = document.querySelector("[data-exhibitions-empty]");
  const worksEl = document.querySelector("[data-collection-works]");
  const worksEmpty = document.querySelector("[data-collection-empty]");
  const artistsEl = document.querySelector("[data-collection-artists]");
  const artistsEmpty = document.querySelector("[data-artists-empty]");
  const monthsEl = document.querySelector("[data-calendar-months]");
  const eventsEl = document.querySelector("[data-calendar-events]");
  const saveButton = document.querySelector("[data-museum-save]");

  document.title = `${museum.name} — Muuzee`;

  if(hero){
    hero.src = museum.image;
    hero.alt = museum.name;
  }

  nameEl.textContent = museum.name;
  metaEl.textContent = museum.category;

  const locationText = museum.scope === "jp"
    ? [museum.prefecture,museum.city,museum.location].filter(Boolean).join(" · ")
    : [museum.city,museum.country].filter(Boolean).join(" · ");

  locationEl.textContent = locationText;
  descriptionEl.textContent = museum.description;
  addressEl.textContent = museum.address;
  accessEl.innerHTML = (museum.access || []).map(line => `<p>${esc(line)}</p>`).join("");
  hoursEl.textContent = museum.hours;
  closedEl.textContent = museum.closed;
  openingNoteEl.textContent = museum.openingNote || "";

  if(mapLink){
    mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(museum.address || museum.name)}`;
  }

  const exhibitions = museum.exhibitions || [];

  if(exhibitionsEl){
    exhibitionsEl.innerHTML = exhibitions.map(item => `
      <a class="poster-card" href="${esc(item.href || "./exhibition.html")}">
        <div class="poster-stage">
          <img src="${esc(item.src)}" alt="${esc(item.title)}" loading="lazy">
        </div>
        <div class="poster-status muuzee-pill muuzee-pill--status">${esc(item.statusLabel)}</div>
        <h3>${esc(item.title)}</h3>
        <p>${esc(museum.name)}</p>
        <p class="date">${esc(item.date)}</p>
      </a>
    `).join("");

    exhibitionsEl.hidden = exhibitions.length === 0;
    exhibitionsEmpty.hidden = exhibitions.length !== 0;
  }

  const works = museum.collectionWorks || [];

  if(worksEl){
    worksEl.innerHTML = works.map(work => `
      <article class="museum-work">
        <div class="museum-work-image">
          <img src="${esc(work.image)}" alt="${esc(work.title)}" loading="lazy">
        </div>
        <small>${esc(work.year || "")}</small>
        <strong>${esc(work.title)}</strong>
        <p>${esc(work.artist)}</p>
      </article>
    `).join("");

    worksEl.hidden = works.length === 0;
    worksEmpty.hidden = works.length !== 0;
    worksEmpty.textContent = museum.collectionNote || "所蔵作品データは準備中です。";
  }

  const artistNames = museum.artists || [];

  if(artistsEl){
    artistsEl.innerHTML = artistNames.map(name => {
      const artist = artistCatalog.find(item => item.name === name);
      const image = artist?.image || artist?.img || "";
      const imageMarkup = image
        ? `<div class="museum-artist-image"><img src="${esc(image)}" alt="${esc(name)}" loading="lazy" style="object-position:${esc(artist?.position || "center")}"></div>`
        : `<div class="museum-artist-image is-fallback">${esc(name.slice(0,1))}</div>`;

      return `<a class="museum-artist" href="./artist.html?name=${encodeURIComponent(name)}">
        ${imageMarkup}
        <strong>${esc(name)}</strong>
      </a>`;
    }).join("");

    artistsEl.hidden = artistNames.length === 0;
    artistsEmpty.hidden = artistNames.length !== 0;
    artistsEmpty.textContent = museum.collectionNote || "所蔵Artistデータは準備中です。";
  }

  function initMap(){
    const mapEl = document.querySelector("[data-museum-map]");
    if(!mapEl) return;

    if(typeof L === "undefined"){
      mapEl.innerHTML = '<div class="museum-quiet-empty">Map could not load.</div>';
      return;
    }

    const map = L.map(mapEl,{
      zoomControl:true,
      scrollWheelZoom:false,
      attributionControl:true
    }).setView([museum.lat,museum.lng],14);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{
      subdomains:"abcd",
      maxZoom:20,
      attribution:"&copy; OpenStreetMap contributors &copy; CARTO"
    }).addTo(map);

    const icon = L.divIcon({
      className:"",
      html:'<div class="museum-map-marker"></div>',
      iconSize:[26,26],
      iconAnchor:[13,13]
    });

    L.marker([museum.lat,museum.lng],{icon}).addTo(map);

    requestAnimationFrame(() => map.invalidateSize({pan:false}));
    setTimeout(() => map.invalidateSize({pan:false}),180);
  }

  function monthKey(dateString){
    return dateString ? dateString.slice(0,7) : "";
  }

  function monthLabel(key){
    const [year,month] = key.split("-").map(Number);
    return {
      year:String(year),
      month:new Intl.DateTimeFormat("ja-JP",{month:"short"}).format(new Date(year,month - 1,1))
    };
  }

  function monthsBetween(start,end){
    const first = new Date(start.getFullYear(),start.getMonth(),1);
    const last = new Date(end.getFullYear(),end.getMonth(),1);
    const values = [];
    const cursor = new Date(first);

    while(cursor <= last){
      values.push(`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,"0")}`);
      cursor.setMonth(cursor.getMonth()+1);
    }

    return values;
  }

  function eventOverlapsMonth(event,key){
    const [year,month] = key.split("-").map(Number);
    const monthStart = new Date(year,month - 1,1);
    const monthEnd = new Date(year,month,0,23,59,59);
    const start = new Date(event.start);
    const end = new Date(event.end);
    return start <= monthEnd && end >= monthStart;
  }

  function renderCalendar(){
    if(!monthsEl || !eventsEl) return;

    if(!exhibitions.length){
      monthsEl.innerHTML = "";
      eventsEl.innerHTML = '<div class="museum-calendar-empty">現在登録されている展覧会Scheduleはありません。</div>';
      return;
    }

    const starts = exhibitions.map(item => new Date(item.start)).filter(date => !Number.isNaN(date.getTime()));
    const ends = exhibitions.map(item => new Date(item.end)).filter(date => !Number.isNaN(date.getTime()));

    const minDate = new Date(Math.min(...starts.map(date => date.getTime())));
    const maxDate = new Date(Math.max(...ends.map(date => date.getTime())));
    const months = monthsBetween(minDate,maxDate);

    let activeMonth = months.find(key => exhibitions.some(event => eventOverlapsMonth(event,key))) || months[0];

    const renderEvents = () => {
      const matches = exhibitions.filter(event => eventOverlapsMonth(event,activeMonth));

      eventsEl.innerHTML = matches.length
        ? matches.map(event => `
          <a class="museum-calendar-event" href="${esc(event.href || "./exhibition.html")}">
            <time>${esc(event.date)}</time>
            <strong>${esc(event.title)}</strong>
            <span>${esc(event.statusLabel)}</span>
          </a>
        `).join("")
        : '<div class="museum-calendar-empty">この月に登録されている展覧会はありません。</div>';

      [...monthsEl.querySelectorAll("[data-month]")].forEach(button => {
        button.classList.toggle("is-active",button.dataset.month === activeMonth);
      });
    };

    monthsEl.innerHTML = months.map(key => {
      const label = monthLabel(key);
      return `<button class="museum-month${key === activeMonth ? " is-active" : ""}" type="button" data-month="${key}">
        <small>${esc(label.year)}</small>
        <strong>${esc(label.month)}</strong>
      </button>`;
    }).join("");

    monthsEl.addEventListener("click",event => {
      const button = event.target.closest("[data-month]");
      if(!button) return;
      activeMonth = button.dataset.month;
      renderEvents();
    });

    renderEvents();
  }

  const storageKey = "muuzee:saved-museums";

  function savedMuseums(){
    try{
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    }catch{
      return [];
    }
  }

  function updateSaveButton(){
    if(!saveButton) return;
    const saved = savedMuseums().includes(museum.id);
    saveButton.classList.toggle("is-saved",saved);
    saveButton.setAttribute("aria-pressed",String(saved));
    saveButton.querySelector("span").textContent = saved ? "保存済" : "保存";
  }

  saveButton?.addEventListener("click",() => {
    const saved = savedMuseums();
    const next = saved.includes(museum.id)
      ? saved.filter(id => id !== museum.id)
      : [...saved,museum.id];

    localStorage.setItem(storageKey,JSON.stringify(next));
    updateSaveButton();
  });

  initMap();
  renderCalendar();
  updateSaveButton();
})();
