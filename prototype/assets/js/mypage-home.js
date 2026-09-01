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


  /* saved-exhibition-schedule:start */
  function parseDatePart(text,fallbackYear){
    const parts = String(text || "")
      .trim()
      .split(/[.\-/]/)
      .map(Number)
      .filter(Number.isFinite);

    if(parts.length === 3){
      return {
        year:parts[0],
        month:parts[1],
        day:parts[2]
      };
    }

    if(parts.length === 2 && fallbackYear){
      return {
        year:fallbackYear,
        month:parts[0],
        day:parts[1]
      };
    }

    return null;
  }

  function parseExhibitionRange(item){
    const raw = String(item?.date || "").trim();
    const parts = raw.split(/\s*[—–]\s*/);

    if(parts.length !== 2) return null;

    const startPart = parseDatePart(parts[0]);
    if(!startPart) return null;

    const endPart = parseDatePart(parts[1],startPart.year);
    if(!endPart) return null;

    return {
      start:new Date(
        startPart.year,
        startPart.month - 1,
        startPart.day,
        0,0,0,0
      ),
      end:new Date(
        endPart.year,
        endPart.month - 1,
        endPart.day,
        23,59,59,999
      )
    };
  }

  function monthStart(date){
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    );
  }

  function addMonths(date,count){
    return new Date(
      date.getFullYear(),
      date.getMonth() + count,
      1
    );
  }

  function monthEnd(date){
    return new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,59,59,999
    );
  }

  function overlapsMonth(range,month){
    return (
      range
      && range.start <= monthEnd(month)
      && range.end >= monthStart(month)
    );
  }

  function scheduleStatus(range){
    const now = new Date();

    if(now < range.start){
      return {
        label:"開催前",
        className:"is-upcoming"
      };
    }

    if(now > range.end){
      return {
        label:"終了",
        className:"is-ended"
      };
    }

    return {
      label:"開催中",
      className:"is-now"
    };
  }

  function venueHref(venue){
    const normalized = String(venue || "").trim();

    const museum = museums.find(item =>
      String(item.name || "").trim() === normalized
    );

    if(museum){
      return `./museum.html?id=${encodeURIComponent(museum.id)}`;
    }

    return `./museums.html?keyword=${encodeURIComponent(normalized)}`;
  }

  function renderSavedExhibitionSchedule(){
    const monthsEl = document.querySelector(
      "[data-saved-schedule-months]"
    );
    const listEl = document.querySelector(
      "[data-saved-schedule-list]"
    );

    if(!monthsEl || !listEl) return;

    const savedIds = readArray("muuzee:saved-exhibitions");

    const items = savedIds
      .map(id =>
        exhibitions.find(item =>
          item.id === id || item.title === id
        )
      )
      .filter(Boolean)
      .map(item => ({
        ...item,
        range:parseExhibitionRange(item)
      }))
      .filter(item => item.range)
      .sort((a,b) => a.range.start - b.range.start);

    /*
      Match the reference: previous month + current month + next 2 months.
      On 2026-09-01 this becomes Aug / Sep / Oct / Nov.
    */
    const currentMonth = monthStart(new Date());
    const months = [
      addMonths(currentMonth,-1),
      currentMonth,
      addMonths(currentMonth,1),
      addMonths(currentMonth,2)
    ];

    let activeIndex = 1;

    const renderMonths = () => {
      monthsEl.innerHTML = months.map((month,index) => `
        <button
          class="mypage-schedule-month${index === activeIndex ? " is-active" : ""}"
          type="button"
          data-schedule-month="${index}"
          aria-pressed="${String(index === activeIndex)}"
        >
          <small>${month.getFullYear()}</small>
          <strong>${month.getMonth() + 1}月</strong>
        </button>
      `).join("");
    };

    const renderList = () => {
      const month = months[activeIndex];

      const visible = items.filter(item =>
        overlapsMonth(item.range,month)
      );

      if(!visible.length){
        listEl.innerHTML = `
          <div class="mypage-schedule-empty">
            この月に開催される保存済み展示会はありません。
          </div>
        `;
        return;
      }

      listEl.innerHTML = visible.map(item => {
        const status = scheduleStatus(item.range);

        const exhibitionHref =
          item.href
          || `./exhibition.html?id=${encodeURIComponent(item.id)}`;

        return `
          <article class="mypage-schedule-item">
            <div class="mypage-schedule-date">
              ${esc(item.date || "")}
            </div>

            <div class="mypage-schedule-content">
              <a
                class="mypage-schedule-title"
                href="${esc(exhibitionHref)}"
              >
                ${esc(item.title || "")}
              </a>

              <a
                class="mypage-schedule-venue"
                href="${esc(venueHref(item.venue))}"
              >
                ${esc(item.venue || "")}
              </a>

              <span
                class="mypage-schedule-status ${esc(status.className)}"
              >
                ${esc(status.label)}
              </span>
            </div>
          </article>
        `;
      }).join("");
    };

    monthsEl.addEventListener("click",event => {
      const button = event.target.closest(
        "[data-schedule-month]"
      );

      if(!button) return;

      activeIndex =
        Number(button.dataset.scheduleMonth) || 0;

      renderMonths();
      renderList();
    });

    renderMonths();
    renderList();
  }

  renderSavedExhibitionSchedule();
  /* saved-exhibition-schedule:end */

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
