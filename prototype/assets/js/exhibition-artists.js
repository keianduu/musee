/*
  Musee Exhibition Artists
  Page-specific prototype data + UI behavior.
  Add artist names to EXHIBITION_ARTIST_NAMES when an exhibition has multiple artists.
*/
(() => {
  "use strict";

  const EXHIBITION_ARTIST_NAMES = [
    "庄島歩音"
  ];

  const COLLAPSE_FROM = 5;
  const VISIBLE_WHEN_COLLAPSED = 4;

  const root = document.querySelector("[data-exhibition-artists]");
  const toggle = document.querySelector("[data-exhibition-artists-toggle]");
  if(!root) return;

  const catalog = window.MuseeArtistCatalog || [];

  const esc = value => String(value ?? "").replace(/[&<>"']/g,char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));

  const artists = EXHIBITION_ARTIST_NAMES
    .map(name => catalog.find(artist => artist.name === name))
    .filter(Boolean);

  const storageKey = "musee:saved-artists";

  const getSaved = () => {
    try{return JSON.parse(localStorage.getItem(storageKey) || "[]")}
    catch{return []}
  };

  const setSaved = names => {
    localStorage.setItem(storageKey,JSON.stringify(names));
  };

  const meta = artist => {
    const styles = (artist.category || []).slice(0,2).join(" / ");
    const place = artist.place || artist.country || "";
    return [styles,place].filter(Boolean);
  };

  const render = expanded => {
    const saved = getSaved();

    root.innerHTML = artists.map((artist,index) => {
      const isExtra = artists.length >= COLLAPSE_FROM && index >= VISIBLE_WHEN_COLLAPSED;
      const hidden = isExtra && !expanded;
      const isSaved = saved.includes(artist.name);
      const metadata = meta(artist);

      return `
        <article class="exhibition-artist-row${hidden ? " is-collapsed" : ""}" ${hidden ? "hidden" : ""}>
          <a class="exhibition-artist-main" href="./artist.html?name=${encodeURIComponent(artist.name)}">
            <img class="exhibition-artist-avatar"
              src="${esc(artist.image || artist.img || "")}"
              alt="${esc(artist.name)}"
              loading="lazy"
              style="object-position:${esc(artist.position || "center")}">
            <span class="exhibition-artist-copy">
              <strong>${esc(artist.name)}</strong>
              <span class="exhibition-artist-meta">
                ${metadata.map(item => `<span>${esc(item)}</span>`).join('<i aria-hidden="true">·</i>')}
              </span>
            </span>
          </a>
          <button
            class="exhibition-artist-save${isSaved ? " is-saved" : ""}"
            type="button"
            data-save-artist="${esc(artist.name)}"
            aria-label="${esc(artist.name)}を保存"
            aria-pressed="${isSaved}">
            <svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4Z"></path></svg>
            <span>${isSaved ? "保存済み" : "保存"}</span>
          </button>
        </article>
      `;
    }).join("");

    if(toggle){
      const hasCollapsed = artists.length >= COLLAPSE_FROM;
      toggle.hidden = !hasCollapsed;
      toggle.setAttribute("aria-expanded",String(Boolean(expanded)));
      if(hasCollapsed){
        const hiddenCount = Math.max(artists.length - VISIBLE_WHEN_COLLAPSED,0);
        toggle.innerHTML = expanded
          ? `<span>閉じる</span><svg viewBox="0 0 24 24"><path d="m7 15 5-5 5 5"></path></svg>`
          : `<span>もっと見る（${hiddenCount}名）</span><svg viewBox="0 0 24 24"><path d="m7 9 5 5 5-5"></path></svg>`;
      }
    }
  };

  root.addEventListener("click",event => {
    const button = event.target.closest("[data-save-artist]");
    if(!button) return;

    event.preventDefault();
    event.stopPropagation();

    const name = button.dataset.saveArtist;
    const saved = getSaved();
    const next = saved.includes(name)
      ? saved.filter(item => item !== name)
      : [...saved,name];

    setSaved(next);

    const expanded = toggle?.getAttribute("aria-expanded") === "true";
    render(expanded);
  });

  toggle?.addEventListener("click",() => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    render(!expanded);
  });

  render(false);
})();
