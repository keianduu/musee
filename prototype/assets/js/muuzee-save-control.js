/* Muuzee Shared Save Control
   Detects savable list/card items and syncs with the current prototype storage model. */
(() => {
  "use strict";

  const BOOKMARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z"></path></svg>';

  const selectors = [
    ".exhibition-list-card",
    ".poster-card",
    ".artist-card",
    ".artist-rail .artist",
    ".related-artist",
    ".popular-museum-card",
    ".museum-list-card",
    ".museum-card",
    ".museum-work",
    ".museum-artist"
  ];

  const selector = selectors.join(",");

  const readArray = key => {
    try{
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    }catch{
      return [];
    }
  };

  const writeArray = (key,value) => {
    localStorage.setItem(key,JSON.stringify(value));
  };

  const togglePrimitive = (key,value) => {
    const current = readArray(key);
    const next = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current,value];

    writeArray(key,next);
    return next.includes(value);
  };

  const getHref = host => {
    if(host.matches("a[href]")) return host.getAttribute("href") || "";
    return host.querySelector("a[href]")?.getAttribute("href") || "";
  };

  const queryValue = (href,key) => {
    if(!href) return "";
    try{
      const url = new URL(href,location.href);
      return url.searchParams.get(key) || "";
    }catch{
      return "";
    }
  };

  const text = (host,selectors) => {
    for(const item of selectors){
      const el = host.querySelector(item);
      const value = el?.textContent?.trim();
      if(value) return value;
    }
    return "";
  };

  const catalogArtist = name => {
    return (window.MuuzeeArtistCatalog || []).find(item => item.name === name);
  };

  const catalogMuseumByName = name => {
    return (window.MuuzeeMuseumCatalog || []).find(item => item.name === name);
  };

  const catalogExhibitionByTitle = title => {
    return (window.MuuzeeExhibitionCatalog || []).find(item => item.title === title);
  };

  function resolveArtist(host){
    const href = getHref(host);
    const name = decodeURIComponent(queryValue(href,"name") || "")
      || text(host,["strong","h3","h2"]);

    if(!name) return null;

    return {
      type:"artist",
      id:name,
      label:name,
      storageKey:"muuzee:saved-artists"
    };
  }

  function resolveMuseum(host){
    const href = getHref(host);
    const hrefId = queryValue(href,"id");
    const name = text(host,["h2","h3","strong"]);
    const catalog = name ? catalogMuseumByName(name) : null;
    const id = host.dataset.saveId || host.dataset.museumId || hrefId || catalog?.id || "";

    if(!id) return null;

    return {
      type:"museum",
      id,
      label:name || catalog?.name || "美術館",
      storageKey:"muuzee:saved-museums"
    };
  }

  function resolveExhibition(host){
    const href = getHref(host);
    const hrefId = queryValue(href,"id");
    const title = text(host,["h2","h3",".exhibition-card-title"]);
    const catalog = title ? catalogExhibitionByTitle(title) : null;
    const id = host.dataset.saveId || hrefId || catalog?.id || title;

    if(!id) return null;

    return {
      type:"exhibition",
      id,
      label:title || catalog?.title || "展覧会",
      storageKey:"muuzee:saved-exhibitions"
    };
  }

  function resolveWork(host){
    const title = text(host,["strong",".work-name","h3"]);
    const artist = text(host,["p",".work-artist"])
      || new URLSearchParams(location.search).get("name")
      || document.querySelector("[data-artist-name]")?.textContent?.trim()
      || "";

    if(!title || !artist) return null;

    return {
      type:"work",
      id:title,
      label:title,
      artist,
      storageKey:`muuzee:saved-works:${artist}`
    };
  }

  function descriptorFor(host){
    if(host.matches(".museum-work")) return resolveWork(host);

    if(
      host.matches(".artist-card") ||
      host.matches(".artist-rail .artist") ||
      host.matches(".related-artist") ||
      host.matches(".museum-artist")
    ){
      return resolveArtist(host);
    }

    if(
      host.matches(".popular-museum-card") ||
      host.matches(".museum-list-card") ||
      host.matches(".museum-card")
    ){
      return resolveMuseum(host);
    }

    if(
      host.matches(".exhibition-list-card") ||
      host.matches(".poster-card")
    ){
      return resolveExhibition(host);
    }

    return null;
  }

  const isSaved = descriptor => {
    if(!descriptor) return false;
    return readArray(descriptor.storageKey).includes(descriptor.id);
  };

  function syncControl(control,descriptor){
    const saved = isSaved(descriptor);

    control.classList.toggle("is-saved",saved);
    control.setAttribute("aria-pressed",String(saved));
    control.setAttribute(
      "aria-label",
      `${descriptor.label}を${saved ? "保存済み" : "保存"}`
    );
    control.title = saved ? "保存済み" : "保存";
  }

  function createControl(host,descriptor){
    const control = document.createElement("span");
    control.className = "muuzee-card-save";
    control.setAttribute("role","button");
    control.setAttribute("tabindex","0");
    control.dataset.muuzeeSaveType = descriptor.type;
    control.dataset.muuzeeSaveId = descriptor.id;
    if(descriptor.artist) control.dataset.muuzeeSaveArtist = descriptor.artist;
    control.innerHTML = BOOKMARK;

    syncControl(control,descriptor);

    const toggle = event => {
      event.preventDefault();
      event.stopPropagation();

      togglePrimitive(descriptor.storageKey,descriptor.id);
      refreshAll();
    };

    control.addEventListener("click",toggle);
    control.addEventListener("keydown",event => {
      if(event.key !== "Enter" && event.key !== " ") return;
      toggle(event);
    });

    host.classList.add("muuzee-save-host");
    host.appendChild(control);
  }

  function enhanceHost(host){
    if(!(host instanceof HTMLElement)) return;
    if(host.dataset.muuzeeSaveEnhanced === "true") return;

    /* Existing dedicated save controls own their item and must not be duplicated. */
    if(
      host.querySelector(":scope > .work-save") ||
      host.querySelector(":scope > .exhibition-artist-save") ||
      host.querySelector(":scope > [data-work-save]") ||
      host.querySelector(":scope > [data-save-artist]")
    ){
      host.dataset.muuzeeSaveEnhanced = "true";
      return;
    }

    const descriptor = descriptorFor(host);
    if(!descriptor) return;

    host.dataset.muuzeeSaveEnhanced = "true";
    createControl(host,descriptor);
  }

  function scan(root=document){
    if(root instanceof Element && root.matches(selector)) enhanceHost(root);
    root.querySelectorAll?.(selector).forEach(enhanceHost);
  }

  function descriptorFromControl(control){
    const type = control.dataset.muuzeeSaveType;
    const id = control.dataset.muuzeeSaveId;
    const artist = control.dataset.muuzeeSaveArtist || "";

    if(type === "work"){
      return {
        type,
        id,
        label:id,
        artist,
        storageKey:`muuzee:saved-works:${artist}`
      };
    }

    const key = {
      artist:"muuzee:saved-artists",
      museum:"muuzee:saved-museums",
      exhibition:"muuzee:saved-exhibitions"
    }[type];

    return key ? {type,id,label:id,storageKey:key} : null;
  }

  function refreshAll(){
    document.querySelectorAll(".muuzee-card-save").forEach(control => {
      const descriptor = descriptorFromControl(control);
      if(descriptor) syncControl(control,descriptor);
    });
  }

  const observer = new MutationObserver(records => {
    for(const record of records){
      record.addedNodes.forEach(node => {
        if(node instanceof Element) scan(node);
      });
    }
  });

  const start = () => {
    scan(document);

    observer.observe(document.body,{
      childList:true,
      subtree:true
    });

    /* Sync when an existing page-specific save button changes the same storage. */
    document.addEventListener("click",event => {
      if(
        event.target.closest(
          "[data-work-save],[data-save-artist],[data-artist-save],[data-museum-save]"
        )
      ){
        setTimeout(refreshAll,0);
      }
    });

    window.addEventListener("storage",refreshAll);
  };

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",start,{once:true});
  }else{
    start();
  }

  window.Muuzee = window.Muuzee || {};
  window.Muuzee.saveControl = {
    scan,
    refresh:refreshAll
  };
})();
