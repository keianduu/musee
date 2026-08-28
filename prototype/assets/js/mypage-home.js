/* Muuzee MyPage TOP */
(() => {
  "use strict";

  const esc = value => String(value ?? "").replace(/[&<>"']/g,char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));

  const exhibitions = window.MuuzeeExhibitionCatalog || [];
  const museums = window.MuuzeeMuseumCatalog || [];
  const artists = window.MuuzeeArtistCatalog || [];

  const fallbackWall = Array.from({length:9},(_,index) => ({
    id:`wall-${index+1}`,
    title:`ArtWall ${index+1}`,
    src:`./assets/images/exhibitions/exhibition-${String(index+1).padStart(2,"0")}.jpg`,
    href:"./exhibitions.html"
  }));

  const wallItems = exhibitions.length
    ? exhibitions.map(item => ({
        ...item,
        src:item.src,
        href:item.href || `./exhibition.html?id=${encodeURIComponent(item.id)}`
      }))
    : fallbackWall;

  let renderToken = 0;

  async function renderWall(){
    const grid = document.querySelector("[data-mypage-wall-grid]");
    if(!grid || !window.Muuzee?.layoutMasonry) return;

    const token = ++renderToken;

    await window.Muuzee.layoutMasonry({
      grid,
      items:wallItems,
      columns:4,
      gapDesktop:8,
      gapMobile:4,
      renderItem:item => {
        if(token !== renderToken) return null;

        const link = document.createElement("a");
        link.className = "wall-item";
        link.href = item.href || "./exhibitions.html";
        link.setAttribute("aria-label",item.title || "ArtWall item");

        const img = document.createElement("img");
        img.src = item.src;
        img.alt = item.title || "";
        img.loading = "lazy";

        link.appendChild(img);
        return link;
      }
    });
  }

  const readArray = key => {
    try{
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    }catch{
      return [];
    }
  };

  function savedPreview(){
    const items = [];

    readArray("muuzee:saved-artists").forEach(name => {
      const artist = artists.find(item => item.name === name);
      if(artist){
        items.push({
          type:"Artist",
          title:artist.name,
          sub:[artist.category?.[0],artist.country].filter(Boolean).join(" · "),
          image:artist.image || artist.img,
          href:`./artist.html?name=${encodeURIComponent(artist.name)}`
        });
      }
    });

    readArray("muuzee:saved-museums").forEach(id => {
      const museum = museums.find(item => item.id === id);
      if(museum){
        items.push({
          type:"美術館",
          title:museum.name,
          sub:[museum.prefecture || museum.country,museum.city].filter(Boolean).join(" · "),
          image:museum.image,
          href:`./museum.html?id=${encodeURIComponent(museum.id)}`
        });
      }
    });

    readArray("muuzee:saved-exhibitions").forEach(id => {
      const exhibition = exhibitions.find(item => item.id === id || item.title === id);
      if(exhibition){
        items.push({
          type:"展覧会",
          title:exhibition.title,
          sub:exhibition.venue,
          image:exhibition.src,
          href:exhibition.href || `./exhibition.html?id=${encodeURIComponent(exhibition.id)}`,
          exhibition:true
        });
      }
    });

    return items.slice(0,8);
  }

  function cardMarkup(item){
    return `
      <a class="mypage-preview-card${item.exhibition ? " is-exhibition" : ""}" href="${esc(item.href || "#")}">
        <div class="mypage-preview-image">
          ${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy">` : ""}
        </div>
        <div class="mypage-preview-meta">${esc(item.type || "")}</div>
        <strong>${esc(item.title)}</strong>
        <p>${esc(item.sub || "")}</p>
      </a>`;
  }

  function emptyMarkup(title,copy){
    return `
      <div class="mypage-empty-preview">
        <strong>${esc(title)}</strong>
        <span>${esc(copy)}</span>
      </div>`;
  }

  const savedRail = document.querySelector("[data-preview-saved]");
  if(savedRail){
    const saved = savedPreview();
    savedRail.innerHTML = saved.length
      ? saved.map(cardMarkup).join("")
      : emptyMarkup("まだ保存はありません","気になるArtist・作品・美術館・展覧会を保存すると、ここに並びます。");
  }

  const seenRail = document.querySelector("[data-preview-seen]");
  if(seenRail){
    const seen = readArray("muuzee:seen-items");
    seenRail.innerHTML = seen.length
      ? seen.slice(0,8).map((item,index) => cardMarkup({
          type:"見た",
          title:item.title || item.name || `体験 ${index+1}`,
          sub:item.meta || "",
          image:item.image || "",
          href:item.href || "./seen.html"
        })).join("")
      : emptyMarkup("まだ「見た」はありません","実際に体験した展覧会や美術館を登録すると、ここに残ります。");
  }

  const favoriteRail = document.querySelector("[data-preview-favorites]");
  if(favoriteRail){
    const favorites = readArray("muuzee:favorite-items");
    favoriteRail.innerHTML = favorites.length
      ? favorites.slice(0,8).map((item,index) => cardMarkup({
          type:"推し",
          title:item.title || item.name || `Favorite ${index+1}`,
          sub:item.meta || "",
          image:item.image || "",
          href:item.href || "./favorites.html"
        })).join("")
      : emptyMarkup("まだ「推し」はありません","特に好きなArtistや対象を登録すると、ここに集まります。");
  }

  const friendRail = document.querySelector("[data-preview-friends]");
  if(friendRail){
    const demo = [
      ["Mina","Art & Architecture"],
      ["Ryo","Contemporary"],
      ["Nao","Impressionism"],
      ["Saki","Photography"],
      ["Jun","Design"]
    ];

    friendRail.innerHTML = demo.map(([name,interest],index) => `
      <a class="mypage-preview-person" href="./friends.html">
        <img src="./assets/images/profile-avatar.jpg" alt="${esc(name)}" loading="lazy" style="object-position:${50 + (index%2)*4}% 42%">
        <strong>${esc(name)}</strong>
        <span>${esc(interest)}</span>
      </a>
    `).join("");
  }

  const groupRail = document.querySelector("[data-preview-groups]");
  if(groupRail){
    const demo = [
      ["Tokyo Contemporary","124 members"],
      ["Museum Trips","86 members"],
      ["Impressionism Lovers","72 members"],
      ["Architecture & Art","58 members"]
    ];

    groupRail.innerHTML = demo.map(([name,members]) => `
      <a class="mypage-group-card" href="./groups.html">
        <small>Group</small>
        <strong>${esc(name)}</strong>
        <span>${esc(members)}</span>
      </a>
    `).join("");
  }

  const share = document.querySelector("[data-artwall-share]");

  share?.addEventListener("click",async () => {
    const data = {
      title:"ashelry's ArtWall | Muuzee",
      text:"Muuzeeで作ったArtWall",
      url:location.href
    };

    try{
      if(navigator.share){
        await navigator.share(data);
        return;
      }

      await navigator.clipboard.writeText(location.href);
      const label = share.querySelector("span");
      if(label){
        const original = label.textContent;
        label.textContent = "コピーしました";
        setTimeout(() => { label.textContent = original; },1400);
      }
    }catch{}
  });

  renderWall();

  let resizeTimer;
  window.addEventListener("resize",() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderWall,120);
  });
})();
