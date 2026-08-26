/* Musee Artist List — page specific */
(() => {
  "use strict";

  const ARTISTS = [
    {name:"草間彌生",category:["現代美術"],origin:"日本人",country:"日本",eras:["20世紀後半","2000年代以降"],image:"./assets/images/exhibitions/exhibition-01.jpg"},
    {name:"奈良美智",category:["現代美術"],origin:"日本人",country:"日本",eras:["20世紀後半","2000年代以降"],image:"./assets/images/exhibitions/exhibition-02.jpg"},
    {name:"村上隆",category:["現代美術","ポップアート"],origin:"日本人",country:"日本",eras:["20世紀後半","2000年代以降"],image:"./assets/images/exhibitions/exhibition-03.jpg"},
    {name:"杉本博司",category:["現代美術"],origin:"日本人",country:"日本",eras:["20世紀後半","2000年代以降"],image:"./assets/images/exhibitions/exhibition-04.jpg"},
    {name:"塩田千春",category:["現代美術"],origin:"日本人",country:"日本",eras:["20世紀後半","2000年代以降"],image:"./assets/images/exhibitions/exhibition-05.jpg"},
    {name:"横尾忠則",category:["現代美術","ポップアート"],origin:"日本人",country:"日本",eras:["20世紀後半","2000年代以降"],image:"./assets/images/exhibitions/exhibition-06.jpg"},
    {name:"葛飾北斎",category:["日本美術"],origin:"日本人",country:"日本",eras:["19世紀以前","19世紀"],image:"./assets/images/exhibitions/exhibition-07.jpg"},
    {name:"アンディ・ウォーホル",category:["ポップアート","現代美術"],origin:"外国人",country:"アメリカ",eras:["20世紀後半"],image:"./assets/images/exhibitions/exhibition-08.jpg"},
    {name:"デイヴィッド・ホックニー",category:["現代美術","ポップアート"],origin:"外国人",country:"イギリス",eras:["20世紀後半","2000年代以降"],image:"./assets/images/exhibitions/exhibition-09.jpg"},
    {name:"バンクシー",category:["現代美術"],origin:"外国人",country:"イギリス",eras:["20世紀後半","2000年代以降"],image:"./assets/images/exhibitions/exhibition-01.jpg"},
    {name:"ゲルハルト・リヒター",category:["現代美術"],origin:"外国人",country:"ドイツ",eras:["20世紀後半","2000年代以降"],image:"./assets/images/exhibitions/exhibition-02.jpg"},
    {name:"クロード・モネ",category:["印象派"],origin:"外国人",country:"フランス",eras:["19世紀","20世紀前半"],image:"./assets/images/exhibitions/exhibition-03.jpg"},
    {name:"エドガー・ドガ",category:["印象派"],origin:"外国人",country:"フランス",eras:["19世紀","20世紀前半"],image:"./assets/images/exhibitions/exhibition-04.jpg"},
    {name:"ピエール＝オーギュスト・ルノワール",category:["印象派"],origin:"外国人",country:"フランス",eras:["19世紀","20世紀前半"],image:"./assets/images/exhibitions/exhibition-05.jpg"},
    {name:"フィンセント・ファン・ゴッホ",category:["ポスト印象派"],origin:"外国人",country:"オランダ",eras:["19世紀"],image:"./assets/images/exhibitions/exhibition-06.jpg"},
    {name:"ポール・セザンヌ",category:["ポスト印象派"],origin:"外国人",country:"フランス",eras:["19世紀","20世紀前半"],image:"./assets/images/exhibitions/exhibition-07.jpg"},
    {name:"パブロ・ピカソ",category:["近代美術"],origin:"外国人",country:"スペイン",eras:["20世紀前半","20世紀後半"],image:"./assets/images/exhibitions/exhibition-08.jpg"},
    {name:"フリーダ・カーロ",category:["近代美術"],origin:"外国人",country:"メキシコ",eras:["20世紀前半"],image:"./assets/images/exhibitions/exhibition-09.jpg"}
  ];

  const grid = document.querySelector("[data-artist-grid]");
  const count = document.querySelector("[data-artist-count]");
  const empty = document.querySelector("[data-artist-empty]");
  const activeFilters = document.querySelector("[data-active-filters]");
  const keyword = document.querySelector("[data-keyword]");
  const applyButton = document.querySelector("[data-filter-apply]");
  const resetButton = document.querySelector("[data-filter-reset]");
  const emptyReset = document.querySelector("[data-empty-reset]");
  const countrySection = document.querySelector("[data-country-section]");
  const groups = [...document.querySelectorAll("[data-filter-group]")];

  if(!grid) return;

  const esc = value => String(value).replace(/[&<>"']/g,char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));

  function selectedValues(groupName){
    const group = document.querySelector(`[data-filter-group="${groupName}"]`);
    if(!group) return [];
    return [...group.querySelectorAll(".filter-chip.is-selected")].map(button => button.dataset.value);
  }

  function currentFilters(){
    return {
      keyword:(keyword?.value || "").trim().toLowerCase(),
      category:selectedValues("category"),
      origin:selectedValues("origin"),
      country:selectedValues("country"),
      era:selectedValues("era")
    };
  }

  function matchesAny(source, selected){
    if(!selected.length) return true;
    const values = Array.isArray(source) ? source : [source];
    return selected.some(value => values.includes(value));
  }

  function filteredArtists(){
    const filters = currentFilters();
    return ARTISTS.filter(artist => {
      if(filters.keyword && !artist.name.toLowerCase().includes(filters.keyword)) return false;
      if(!matchesAny(artist.category,filters.category)) return false;
      if(!matchesAny(artist.origin,filters.origin)) return false;
      if(!matchesAny(artist.country,filters.country)) return false;
      if(!matchesAny(artist.eras,filters.era)) return false;
      return true;
    });
  }

  function primaryMeta(artist){
    if(artist.origin === "日本人") return `${artist.category[0]} · 日本`;
    return `${artist.category[0]} · ${artist.country}`;
  }

  function render(){
    const artists = filteredArtists();
    grid.innerHTML = artists.map(artist => `
      <a class="artist-card" href="#" aria-label="${esc(artist.name)}">
        <div class="artist-avatar"><img src="${esc(artist.image)}" alt="" loading="lazy"></div>
        <strong>${esc(artist.name)}</strong>
        <span>${esc(primaryMeta(artist))}</span>
      </a>
    `).join("");

    if(count) count.textContent = artists.length;
    if(empty) empty.hidden = artists.length !== 0;
    grid.hidden = artists.length === 0;
    renderActiveFilters();
  }

  function renderActiveFilters(){
    if(!activeFilters) return;
    const filters = currentFilters();
    const entries = [];
    if(filters.keyword) entries.push({group:"keyword",value:keyword.value,label:`「${keyword.value}」`});
    ["category","origin","country","era"].forEach(group => {
      filters[group].forEach(value => entries.push({group,value,label:value}));
    });

    activeFilters.hidden = entries.length === 0;
    activeFilters.innerHTML = entries.map(entry => `
      <button class="active-filter" type="button" data-remove-group="${esc(entry.group)}" data-remove-value="${esc(entry.value)}">${esc(entry.label)}</button>
    `).join("");
  }

  function syncCountrySection(){
    const japaneseSelected = selectedValues("origin").includes("日本人");
    const foreignSelected = selectedValues("origin").includes("外国人");
    const japaneseOnly = japaneseSelected && !foreignSelected;
    if(countrySection) countrySection.hidden = japaneseOnly;
    if(japaneseOnly){
      countrySection?.querySelectorAll(".filter-chip.is-selected").forEach(button => button.classList.remove("is-selected"));
    }
  }

  groups.forEach(group => {
    group.addEventListener("click",event => {
      const button = event.target.closest(".filter-chip");
      if(!button) return;
      const single = group.hasAttribute("data-single-select");
      if(single){
        const wasSelected = button.classList.contains("is-selected");
        group.querySelectorAll(".filter-chip").forEach(chip => chip.classList.remove("is-selected"));
        if(!wasSelected) button.classList.add("is-selected");
      }else{
        button.classList.toggle("is-selected");
      }
      syncCountrySection();
    });
  });

  function resetFilters(){
    groups.forEach(group => group.querySelectorAll(".filter-chip.is-selected").forEach(button => button.classList.remove("is-selected")));
    if(keyword) keyword.value = "";
    if(countrySection) countrySection.hidden = false;
    render();
  }

  applyButton?.addEventListener("click",() => {
    render();
    window.Musee?.filterSheet?.close();
  });
  resetButton?.addEventListener("click",resetFilters);
  emptyReset?.addEventListener("click",resetFilters);

  activeFilters?.addEventListener("click",event => {
    const button = event.target.closest("[data-remove-group]");
    if(!button) return;
    const group = button.dataset.removeGroup;
    const value = button.dataset.removeValue;
    if(group === "keyword"){
      if(keyword) keyword.value = "";
    }else{
      document.querySelector(`[data-filter-group="${group}"] .filter-chip[data-value="${CSS.escape(value)}"]`)?.classList.remove("is-selected");
    }
    syncCountrySection();
    render();
  });

  keyword?.addEventListener("keydown",event => {
    if(event.key === "Enter"){
      event.preventDefault();
      render();
      window.Musee?.filterSheet?.close();
    }
  });

  render();
})();
