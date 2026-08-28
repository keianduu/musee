/* Muuzee Seen / Favorites shared renderer */
(() => {
  "use strict";

  const root = document.querySelector("[data-personal-list]");
  if(!root) return;

  const kind = root.dataset.personalList;
  const personal = window.MuuzeePersonalData;

  const artists = window.MuuzeeArtistCatalog || [];
  const museums = window.MuuzeeMuseumCatalog || [];
  const exhibitions = window.MuuzeeExhibitionCatalog || [];

  const source = kind === "favorites"
    ? (personal?.favorites?.() || [])
    : (personal?.seen?.() || []);

  const esc = value => String(value ?? "").replace(/[&<>"']/g,char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));

  function resolve(item){
    if(item.type === "artist"){
      const artist = artists.find(value => value.name === item.id);

      return {
        type:"Artist",
        title:artist?.name || item.id,
        meta:(artist?.category || []).slice(0,1).join(""),
        sub:artist?.country || "",
        image:artist?.image || artist?.img || "./assets/images/exhibitions/exhibition-10.jpg",
        position:artist?.position || "center",
        href:`./artist.html?name=${encodeURIComponent(item.id)}`,
        className:"is-artist"
      };
    }

    if(item.type === "museum"){
      const museum = museums.find(value => value.id === item.id);
      if(!museum) return null;

      return {
        type:"美術館",
        title:museum.name,
        meta:[museum.prefecture || museum.country,museum.city].filter(Boolean).join(" · "),
        sub:museum.category,
        image:museum.image,
        position:"center",
        href:`./museum.html?id=${encodeURIComponent(museum.id)}`,
        className:"is-museum"
      };
    }

    if(item.type === "exhibition"){
      const exhibition = exhibitions.find(value => value.id === item.id);
      if(!exhibition) return null;

      return {
        type:"展覧会",
        title:exhibition.title,
        meta:[exhibition.statusLabel,exhibition.date].filter(Boolean).join(" · "),
        sub:exhibition.venue,
        image:exhibition.src,
        position:"center",
        href:exhibition.href || `./exhibition.html?id=${encodeURIComponent(exhibition.id)}`,
        className:"is-exhibition"
      };
    }

    return null;
  }

  const resolved = source.map(resolve).filter(Boolean);

  root.innerHTML = resolved.map(item => `
    <article class="personal-list-card ${esc(item.className)}">
      <a class="personal-list-card-link" href="${esc(item.href)}">
        <div class="personal-list-image">
          <img src="${esc(item.image)}"
               alt="${esc(item.title)}"
               loading="lazy"
               style="object-position:${esc(item.position)}">
        </div>
        <div class="personal-list-meta">${esc(item.type)}${item.meta ? ` · ${esc(item.meta)}` : ""}</div>
        <h2>${esc(item.title)}</h2>
        <p>${esc(item.sub)}</p>
      </a>
    </article>
  `).join("");
})();
