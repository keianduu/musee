/*
  Muuzee Global JS
  Shared behavior only. Do not put page-specific data here.
*/
(() => {
  "use strict";

  /* Header Reveal
     A page opts in by adding data-muuzee-sheet to the rising content surface.
  */
  function initHeaderReveal(){
    const header = document.querySelector(".site-header");
    const sheet =
      document.querySelector("[data-muuzee-sheet]") ||
      document.querySelector(".main-surface, .detail-sheet");

    if(!header || !sheet) return;

    let ticking = false;
    let active = false;

    function update(){
      ticking = false;
      const headerHeight = header.offsetHeight;
      const sheetTop = sheet.getBoundingClientRect().top;
      const enterAt = headerHeight + 1;
      const exitAt = headerHeight + 10;

      if(!active && sheetTop <= enterAt){
        active = true;
        header.classList.add("is-over-sheet");
      }else if(active && sheetTop > exitAt){
        active = false;
        header.classList.remove("is-over-sheet");
      }
    }

    function requestUpdate(){
      if(ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", requestUpdate, {passive:true});
    window.addEventListener("resize", requestUpdate);
  }

  /* hamburger-navigation:start */
  function initHamburgerNavigation(){
    const header = document.querySelector(".site-header");
    const actions = header?.querySelector(".header-actions");

    if(!header || !actions) return;
    if(actions.querySelector("[data-muuzee-menu-toggle]")) return;

    const menuItems = [
      {label:"ホーム",href:"./index.html"},
      {label:"展示会を探す",href:"./exhibitions.html"},
      {label:"アーティストを探す",href:"./artists.html"},
      {label:"美術館を探す",href:"./museums.html"},
      {label:"地図から探す",href:"./map.html"},
      {label:"マイページ",href:"./my-art.html"},
      {label:"保存",href:"./saved.html"},
      {label:"ArtWall",href:"./my-art.html#artwall"},
      {label:"免責事項",href:"./disclaimer.html",secondary:true,secondaryFirst:true},
      {label:"プライバシーポリシー",href:"./privacy-policy.html",secondary:true},
      {label:"お問い合わせ",href:"./contact.html",secondary:true}
    ];

    const toggle = document.createElement("button");
    toggle.className = "icon-button muuzee-menu-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label","メニュー");
    toggle.setAttribute("aria-expanded","false");
    toggle.setAttribute("aria-controls","muuzee-hamburger-drawer");
    toggle.dataset.muuzeeMenuToggle = "";
    toggle.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 7h14M5 12h14M5 17h14"></path>
      </svg>
    `;
    actions.appendChild(toggle);

    const scrim = document.createElement("button");
    scrim.className = "muuzee-menu-scrim";
    scrim.type = "button";
    scrim.setAttribute("aria-label","メニューを閉じる");
    scrim.tabIndex = -1;

    const drawer = document.createElement("aside");
    drawer.className = "muuzee-menu-drawer";
    drawer.id = "muuzee-hamburger-drawer";
    drawer.setAttribute("aria-hidden","true");

    const nav = document.createElement("nav");
    nav.className = "muuzee-menu-nav";
    nav.setAttribute("aria-label","Menu navigation");

    const currentPath =
      location.pathname.split("/").pop()
      || "index.html";

    menuItems.forEach(item => {
      const link = document.createElement("a");
      link.className = "muuzee-menu-link";
      link.href = item.href;
      link.textContent = item.label;

      if(item.secondary){
        link.classList.add("is-secondary");
      }

      if(item.secondaryFirst){
        link.classList.add("is-secondary-first");
      }

      const hrefPath =
        item.href
          .split("#")[0]
          .replace("./","");

      if(
        hrefPath === currentPath
        && !item.href.includes("#")
      ){
        link.classList.add("is-current");
        link.setAttribute("aria-current","page");
      }

      nav.appendChild(link);
    });

    drawer.appendChild(nav);
    document.body.append(scrim,drawer);

    let open = false;

    function setOpen(next){
      open = Boolean(next);

      toggle.setAttribute("aria-expanded",String(open));
      drawer.setAttribute("aria-hidden",String(!open));

      header.classList.toggle("is-menu-open",open);
      scrim.classList.toggle("is-open",open);
      drawer.classList.toggle("is-open",open);
      document.body.classList.toggle("is-hamburger-open",open);

      if(open){
        window.requestAnimationFrame(() => {
          drawer.querySelector("a")?.focus({preventScroll:true});
        });
      }else{
        toggle.focus({preventScroll:true});
      }
    }

    toggle.addEventListener("click",() => {
      setOpen(!open);
    });

    scrim.addEventListener("click",() => {
      setOpen(false);
    });

    drawer.addEventListener("click",event => {
      if(event.target.closest("a")){
        setOpen(false);
      }
    });

    document.addEventListener("keydown",event => {
      if(event.key === "Escape" && open){
        setOpen(false);
      }
    });
  }
  /* hamburger-navigation:end */

  /* Generic true masonry helper.
     Important: this calculates masonry item geometry only.
     It never resizes Hero / exhibition artwork from viewport height.
  */
  const imageMetaCache = new Map();

  function loadImageMeta(src){
    if(imageMetaCache.has(src)){
      return Promise.resolve(imageMetaCache.get(src));
    }

    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const meta = {
          width: img.naturalWidth || 1,
          height: img.naturalHeight || 1,
          ratio: (img.naturalHeight || 1) / (img.naturalWidth || 1)
        };
        imageMetaCache.set(src, meta);
        resolve(meta);
      };
      img.onerror = () => {
        const meta = {width:1, height:1, ratio:1.25};
        imageMetaCache.set(src, meta);
        resolve(meta);
      };
      img.src = src;
    });
  }

  async function layoutMasonry({
    grid,
    items,
    getSrc = item => item.src,
    renderItem,
    columns = 4,
    gapDesktop = 8,
    gapMobile = 4,
    minRatio = .58,
    maxRatio = 1.85
  }){
    if(!grid || !Array.isArray(items) || !items.length || typeof renderItem !== "function"){
      return;
    }

    const metas = await Promise.all(items.map(item => loadImageMeta(getSrc(item))));
    const width = grid.clientWidth;
    if(!width) return;

    const mobile = window.matchMedia("(max-width:720px)").matches;
    const gap = mobile ? gapMobile : gapDesktop;
    const columnWidth = (width - gap * (columns - 1)) / columns;
    const columnHeights = new Array(columns).fill(0);

    grid.innerHTML = "";

    items.forEach((item, index) => {
      const ratio = Math.max(minRatio, Math.min(maxRatio, metas[index].ratio));
      const itemHeight = Math.round(columnWidth * ratio);

      let column = 0;
      for(let c = 1; c < columns; c++){
        if(columnHeights[c] < columnHeights[column]) column = c;
      }

      const geometry = {
        left: Math.round(column * (columnWidth + gap)),
        top: Math.round(columnHeights[column]),
        width: Math.round(columnWidth),
        height: itemHeight,
        column
      };
      columnHeights[column] += itemHeight + gap;

      const node = renderItem(item, geometry, index);
      if(!node) return;

      node.classList.add("muuzee-masonry-item");
      node.style.left = `${geometry.left}px`;
      node.style.top = `${geometry.top}px`;
      node.style.width = `${geometry.width}px`;
      node.style.height = `${geometry.height}px`;
      grid.appendChild(node);
    });
  }

  window.Muuzee = window.Muuzee || {};
  window.Muuzee.layoutMasonry = layoutMasonry;

  function initGlobalUI(){
    initHeaderReveal();
    initHamburgerNavigation();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initGlobalUI, {once:true});
  }else{
    initGlobalUI();
  }
})();
