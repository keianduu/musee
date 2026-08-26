/*
  Musee Global JS
  Shared behavior only. Do not put page-specific data here.
*/
(() => {
  "use strict";

  /* Header Reveal
     A page opts in by adding data-musee-sheet to the rising content surface.
  */
  function initHeaderReveal(){
    const header = document.querySelector(".site-header");
    const sheet =
      document.querySelector("[data-musee-sheet]") ||
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

      node.classList.add("musee-masonry-item");
      node.style.left = `${geometry.left}px`;
      node.style.top = `${geometry.top}px`;
      node.style.width = `${geometry.width}px`;
      node.style.height = `${geometry.height}px`;
      grid.appendChild(node);
    });
  }

  window.Musee = window.Musee || {};
  window.Musee.layoutMasonry = layoutMasonry;

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initHeaderReveal, {once:true});
  }else{
    initHeaderReveal();
  }
})();
