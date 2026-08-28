/* Muuzee Exhibition List — page specific */
(() => {
  "use strict";

  const SOURCE = [{"title": "庄島歩音 個展『Storytelling』", "venue": "Sprout Books and Art", "city": "東京", "date": "2026.09.12 — 09.27", "status": "upcoming", "statusLabel": "開催前", "category": "企画展", "area": "銀座・丸の内", "src": "./assets/images/exhibitions/exhibition-01.jpg", "href": "./exhibition.html"}, {"title": "小山久美子 個展「うちうちのことは」", "venue": "Gallery MUMON", "city": "東京", "date": "2026.09.18 — 10.03", "status": "upcoming", "statusLabel": "開催前", "category": "個展", "area": "六本木・青山", "src": "./assets/images/exhibitions/exhibition-02.jpg", "href": "#"}, {"title": "夢二の日本　描かれた理想郷", "venue": "竹久夢二美術館", "city": "東京", "date": "2026.10.03 — 12.20", "status": "upcoming", "statusLabel": "開催前", "category": "現代美術", "area": "上野・谷中", "src": "./assets/images/exhibitions/exhibition-03.jpg", "href": "#"}, {"title": "Zak Prekop “Noise”", "venue": "HAGIWARA PROJECTS", "city": "東京", "date": "2026.09.12 — 10.17", "status": "upcoming", "statusLabel": "開催前", "category": "デザイン", "area": "清澄白河・湾岸", "src": "./assets/images/exhibitions/exhibition-04.jpg", "href": "#"}, {"title": "綿引展子『光がいちはやくなぞる道』", "venue": "ホワイトストーンギャラリー銀座新館", "city": "東京", "date": "2026.09.10 — 10.03", "status": "upcoming", "statusLabel": "開催前", "category": "企画展", "area": "銀座・丸の内", "src": "./assets/images/exhibitions/exhibition-05.jpg", "href": "#"}, {"title": "DONEGALⅡ Threshold / ドニゴールⅡ-閾値-", "venue": "ART FACTORY城南島", "city": "東京", "date": "2026.09.26 — 10.25", "status": "upcoming", "statusLabel": "開催前", "category": "個展", "area": "六本木・青山", "src": "./assets/images/exhibitions/exhibition-06.jpg", "href": "#"}, {"title": "Curious Matters – 材料を再発見するデザイン", "venue": "GOOD DESIGN Marunouchi", "city": "東京", "date": "2026.09.02 — 09.12", "status": "upcoming", "statusLabel": "開催前", "category": "現代美術", "area": "上野・谷中", "src": "./assets/images/exhibitions/exhibition-07.jpg", "href": "#"}, {"title": "ISSEY MIYAKE「URUSHI BODY —身体と物質の間に—」", "venue": "ISSEY MIYAKE GINZA | CUBE", "city": "東京", "date": "2026.09.01 — 09.27", "status": "upcoming", "statusLabel": "開催前", "category": "デザイン", "area": "清澄白河・湾岸", "src": "./assets/images/exhibitions/exhibition-08.jpg", "href": "#"}, {"title": "中村太一『夢の川』", "venue": "CAVE-AYUMI GALLERY", "city": "東京", "date": "2026.08.23 — 09.22", "status": "now", "statusLabel": "開催中", "category": "企画展", "area": "銀座・丸の内", "src": "./assets/images/exhibitions/exhibition-09.jpg", "href": "#"}];
  const grid = document.querySelector("[data-exhibition-grid]");
  const sentinel = document.querySelector("[data-infinite-sentinel]");
  const statusEl = document.querySelector("[data-infinite-status]");
  const countEl = document.querySelector("[data-result-count]");
  const activeFiltersEl = document.querySelector("[data-active-filters]");

  const openButton = document.querySelector("[data-filter-open]");
  const closeButton = document.querySelector("[data-filter-close]");
  const backdrop = document.querySelector("[data-filter-backdrop]");
  const sheet = document.querySelector(".filter-sheet");
  const applyButton = document.querySelector("[data-filter-apply]");
  const resetButton = document.querySelector("[data-filter-reset]");
  const keywordInput = document.querySelector("[data-filter-keyword]");

  const state = {
    batch:0,
    batchSize:8,
    loading:false,
    filters:{keyword:"",area:[],status:[],period:[],category:[]}
  };

  function esc(value){
    return String(value ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;");
  }

  function getFilteredSource(){
    const f = state.filters;
    return SOURCE.filter(item => {
      const haystack = `${item.title} ${item.venue} ${item.city} ${item.category} ${item.area}`.toLowerCase();
      if(f.keyword && !haystack.includes(f.keyword.toLowerCase())) return false;
      if(f.area.length && !f.area.includes(item.area)) return false;
      if(f.status.length && !f.status.includes(item.status)) return false;
      if(f.category.length && !f.category.includes(item.category)) return false;
      return true;
    });
  }

  function virtualItem(item, index){
    // Prototype: reuse the current sample set for endless-scroll behavior.
    // Production will replace this with paginated API results.
    return {...item, virtualId:`${state.batch}-${index}`};
  }

  function cardHTML(item){
    const statusClass = item.status === "now" ? "muuzee-pill--status" : "muuzee-pill--neutral";
    const linkAttrs = item.href && item.href !== "#"
      ? `href="${esc(item.href)}"` : `href="#" data-no-nav="true"`;

    return `
      <article class="exhibition-list-card">
        <a class="exhibition-card-link" ${linkAttrs}>
          <div class="exhibition-card-image">
            <img src="${esc(item.src)}" alt="${esc(item.title)}" loading="lazy">
          </div>
          <div class="exhibition-card-body">
            <div class="exhibition-card-topline">
              <span class="muuzee-pill ${statusClass}">${esc(item.statusLabel)}</span>
              <span class="exhibition-card-category">${esc(item.category)}</span>
              <span class="exhibition-card-area">${esc(item.area)}</span>
            </div>
            <h2>${esc(item.title)}</h2>
            <p class="exhibition-card-venue">${esc(item.venue)}</p>
            <p class="exhibition-card-date">${esc(item.date)}</p>
          </div>
        </a>
      </article>`;
  }

  function updateCount(){
    if(countEl) countEl.textContent = grid.children.length;
  }

  function appendBatch(){
    if(state.loading) return;
    const filtered = getFilteredSource();
    if(!filtered.length){
      statusEl.innerHTML = "<span>条件に合う展示会がありません</span>";
      return;
    }

    state.loading = true;
    const fragment = document.createDocumentFragment();
    const holder = document.createElement("div");

    for(let i=0;i<state.batchSize;i++){
      const item = virtualItem(filtered[(state.batch * state.batchSize + i) % filtered.length], i);
      holder.innerHTML = cardHTML(item);
      fragment.appendChild(holder.firstElementChild);
    }

    grid.appendChild(fragment);
    state.batch += 1;
    state.loading = false;
    updateCount();
  }

  function resetResults(){
    state.batch = 0;
    grid.innerHTML = "";
    statusEl.innerHTML = '<span class="loading-dot"></span><span>More exhibitions</span>';
    appendBatch();
    appendBatch();
  }

  function openSheet(){
    backdrop.hidden = false;
    sheet.classList.add("is-open");
    backdrop.classList.add("is-open");
    sheet.setAttribute("aria-hidden","false");
    document.body.classList.add("filter-sheet-open");
    setTimeout(() => keywordInput?.focus({preventScroll:true}), 260);
  }

  function closeSheet(){
    sheet.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    sheet.setAttribute("aria-hidden","true");
    document.body.classList.remove("filter-sheet-open");
    setTimeout(() => { backdrop.hidden = true; }, 260);
    openButton?.focus({preventScroll:true});
  }

  function toggleChip(button){
    button.classList.toggle("is-selected");
  }

  function readFilters(){
    const next = {keyword:keywordInput?.value.trim() || "",area:[],status:[],period:[],category:[]};
    document.querySelectorAll("[data-filter-group]").forEach(group => {
      const key = group.dataset.filterGroup;
      next[key] = [...group.querySelectorAll(".filter-chip.is-selected")].map(x => x.dataset.value);
    });
    state.filters = next;
  }

  function renderActiveFilters(){
    const f = state.filters;
    const values = [f.keyword, ...f.area, ...f.status.map(x => x === "now" ? "開催中" : "開催前"), ...f.period, ...f.category].filter(Boolean);
    activeFiltersEl.innerHTML = values.map(x => `<span class="active-filter">${esc(x)}</span>`).join("");
    activeFiltersEl.hidden = values.length === 0;
  }

  function clearFilterUI(){
    if(keywordInput) keywordInput.value = "";
    document.querySelectorAll(".filter-chip.is-selected").forEach(x => x.classList.remove("is-selected"));
    state.filters = {keyword:"",area:[],status:[],period:[],category:[]};
  }

  openButton?.addEventListener("click", openSheet);
  closeButton?.addEventListener("click", closeSheet);
  backdrop?.addEventListener("click", closeSheet);

  document.querySelectorAll(".filter-chip").forEach(button => {
    button.addEventListener("click", () => toggleChip(button));
  });

  applyButton?.addEventListener("click", () => {
    readFilters();
    renderActiveFilters();
    resetResults();
    closeSheet();
    window.scrollTo({top:0,behavior:"smooth"});
  });

  resetButton?.addEventListener("click", () => {
    clearFilterUI();
    renderActiveFilters();
  });

  document.addEventListener("keydown", event => {
    if(event.key === "Escape" && sheet.classList.contains("is-open")) closeSheet();
  });

  grid?.addEventListener("click", event => {
    const link = event.target.closest("[data-no-nav]");
    if(link) event.preventDefault();
  });

  const observer = new IntersectionObserver(entries => {
    if(entries.some(entry => entry.isIntersecting)){
      appendBatch();
    }
  }, {rootMargin:"900px 0px 900px 0px"});

  appendBatch();
  appendBatch();
  if(sentinel) observer.observe(sentinel);
})();
