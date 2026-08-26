/* Musee Artist Detail — page specific */
(() => {
  "use strict";

  const catalog = window.MuseeArtistCatalog || [];
  if(!catalog.length) return;

  const DETAILS = {
    "草間彌生":{
      intro:"水玉や網目、反復するパターンを通して、自己と世界の境界が溶けていくような感覚を表現してきた日本を代表する現代美術家。絵画、彫刻、インスタレーションまで表現領域は広く、強い視覚性と身体的な鑑賞体験を併せ持ちます。",
      works:[["無限の鏡の間","1965–"],["かぼちゃ","1990年代–"],["Infinity Nets","1959–"]],
      museums:[["松本市美術館","長野県・松本","草間彌生の作品を継続的に紹介"],["国立国際美術館","大阪府・大阪","現代美術コレクション"],["東京都現代美術館","東京都・江東","国内外の現代美術を所蔵"]],
      related:["奈良美智","村上隆","塩田千春"]
    },
    "クロード・モネ":{
      intro:"刻々と変化する光や大気、水面の反射を、色彩の重なりと素早い筆触で捉えた印象派を代表する画家。同じモティーフを時間や天候を変えて描く連作によって、見ることそのものの変化を絵画にしました。",
      works:[["印象・日の出","1872"],["睡蓮","1890年代–1920年代"],["散歩、日傘をさす女性","1875"]],
      museums:[["オランジュリー美術館","フランス・パリ","〈睡蓮〉大装飾画を展示"],["マルモッタン・モネ美術館","フランス・パリ","モネ作品を多数所蔵"],["国立西洋美術館","東京都・上野","モネを含む西洋近代絵画を所蔵"]],
      related:["エドガー・ドガ","ピエール＝オーギュスト・ルノワール","ポール・セザンヌ"]
    },
    "フィンセント・ファン・ゴッホ":{
      intro:"強い色彩とリズミカルな筆触によって、風景や人物に自身の感覚を重ねたポスト印象派の画家。短い活動期間に数多くの作品を残し、その後の表現主義や20世紀美術に大きな影響を与えました。",
      works:[["星月夜","1889"],["ひまわり","1888–1889"],["夜のカフェテラス","1888"]],
      museums:[["ファン・ゴッホ美術館","オランダ・アムステルダム","世界最大規模のゴッホ作品群"],["クレラー＝ミュラー美術館","オランダ・オッテルロー","多数の油彩・素描を所蔵"],["国立西洋美術館","東京都・上野","西洋近代美術コレクション"]],
      related:["ポール・セザンヌ","クロード・モネ","パブロ・ピカソ"]
    },
    "パブロ・ピカソ":{
      intro:"20世紀美術を大きく変えた画家・彫刻家。キュビスムをはじめ、古典的表現から大胆な造形実験まで生涯を通してスタイルを更新し続け、絵画の見方そのものに大きな影響を与えました。",
      works:[["アヴィニョンの娘たち","1907"],["ゲルニカ","1937"],["泣く女","1937"]],
      museums:[["ピカソ美術館","スペイン・バルセロナ","初期作品を中心に所蔵"],["国立ピカソ美術館","フランス・パリ","幅広い時代の作品を所蔵"],["国立西洋美術館","東京都・上野","西洋近代美術コレクション"]],
      related:["ポール・セザンヌ","アンディ・ウォーホル","ゲルハルト・リヒター"]
    },
    "奈良美智":{
      intro:"大きな頭部と鋭いまなざしを持つ子どもの像で知られる現代美術家。かわいらしさと反抗心、孤独や静けさが同居する人物像を通して、見る側の記憶や感情を揺さぶります。",
      works:[["Miss Forest","2010"],["Knife Behind Back","2000"],["The Little Ambassador","2000"]],
      museums:[["青森県立美術館","青森県・青森","奈良美智の作品を継続的に展示"],["豊田市美術館","愛知県・豊田","現代美術コレクション"],["横浜美術館","神奈川県・横浜","近現代美術を所蔵"]],
      related:["草間彌生","村上隆","横尾忠則"]
    },
    "アンディ・ウォーホル":{
      intro:"広告や商品、セレブリティのイメージを反復し、大量消費社会と芸術の境界を問い直したポップアートの代表的存在。シルクスクリーンによる反復と鮮烈な色彩は、現代の視覚文化にも大きな影響を残しています。",
      works:[["Marilyn Diptych","1962"],["Campbell's Soup Cans","1962"],["Shot Marilyns","1964"]],
      museums:[["アンディ・ウォーホル美術館","アメリカ・ピッツバーグ","ウォーホル作品を包括的に所蔵"],["MoMA","アメリカ・ニューヨーク","ポップアートを含む近現代美術"],["テート・モダン","イギリス・ロンドン","国際的な近現代美術コレクション"]],
      related:["村上隆","デイヴィッド・ホックニー","バンクシー"]
    }
  };

  const EXHIBITIONS = [
    {title:"光と色、その先へ",venue:"Musee Art Center",date:"開催中 — 2026.10.18",image:"./assets/images/exhibitions/exhibition-03.jpg"},
    {title:"Modern Masters: Selected Works",venue:"City Museum of Art",date:"2026.09.05 — 11.23",image:"./assets/images/exhibitions/exhibition-06.jpg"}
  ];

  const params = new URLSearchParams(location.search);
  const requested = params.get("name");
  const artist = catalog.find(item => item.name === requested) || catalog[0];
  const detail = DETAILS[artist.name] || {
    intro:`${artist.category.join("、")}の文脈で知られる${artist.name}。作品の背景や時代との関係を知ることで、展示で作品に出会ったときの見え方がより立体的になります。Museeでは代表作、展覧会、所蔵美術館を一つのプロフィールとしてまとめます。`,
    works:[[`${artist.name} 代表作 I`,"—"],[`${artist.name} 代表作 II`,"—"],[`${artist.name} 代表作 III`,"—"]],
    museums:[["主要所蔵美術館","Collection","所蔵情報は今後データ連携予定"],["国内の関連美術館","Japan","展示・所蔵情報を順次追加予定"]],
    related:[]
  };

  const esc = value => String(value ?? "").replace(/[&<>"']/g,char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));

  const hero = document.querySelector("[data-artist-hero]");
  if(hero){
    hero.src = artist.image || artist.img || "";
    hero.alt = artist.name;
    hero.style.objectPosition = artist.position || "center";
  }

  document.title = `${artist.name} — Musee`;
  document.querySelector("[data-artist-name]").textContent = artist.name;
  document.querySelector("[data-artist-sub]").textContent = `${artist.country} · ${artist.eras.join(" / ")}`;
  document.querySelector("[data-artist-style]").textContent = artist.category.join(" / ");
  document.querySelector("[data-artist-country]").textContent = artist.country;
  document.querySelector("[data-artist-era]").textContent = artist.eras.join(" / ");
  document.querySelector("[data-artist-intro]").textContent = detail.intro;

  document.querySelector("[data-artist-categories]").innerHTML = artist.category
    .map(category => `<span class="artist-tag">${esc(category)}</span>`).join("");

  const workStorageKey = `musee:saved-works:${artist.name}`;
  const getSavedWorks = () => {
    try{return JSON.parse(localStorage.getItem(workStorageKey) || "[]")}catch{return []}
  };
  const setSavedWorks = works => localStorage.setItem(workStorageKey,JSON.stringify(works));

  const worksEl = document.querySelector("[data-famous-works]");
  const renderWorks = () => {
    const saved = getSavedWorks();
    worksEl.innerHTML = detail.works.map((work,index) => {
      const [name,year] = work;
      const isSaved = saved.includes(name);
      return `<article class="work-item">
        <div class="work-copy">
          <span class="work-number">${String(index + 1).padStart(2,"0")}</span>
          <h3 class="work-name">${esc(name)}</h3>
          <span class="work-year">${esc(year)}</span>
        </div>
        <button class="work-save${isSaved ? " is-saved" : ""}" type="button" data-work-save="${esc(name)}" aria-label="${esc(name)}を保存" aria-pressed="${isSaved}">
          <svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4Z"></path></svg>
        </button>
      </article>`;
    }).join("");
  };
  renderWorks();

  worksEl.addEventListener("click",event => {
    const button = event.target.closest("[data-work-save]");
    if(!button) return;
    const name = button.dataset.workSave;
    const saved = getSavedWorks();
    const next = saved.includes(name) ? saved.filter(item => item !== name) : [...saved,name];
    setSavedWorks(next);
    renderWorks();
  });

  const artistSave = document.querySelector("[data-artist-save]");
  const artistStorageKey = "musee:saved-artists";
  const getSavedArtists = () => {
    try{return JSON.parse(localStorage.getItem(artistStorageKey) || "[]")}catch{return []}
  };
  const syncArtistSave = () => {
    const saved = getSavedArtists().includes(artist.name);
    artistSave.classList.toggle("is-saved",saved);
    artistSave.setAttribute("aria-pressed",String(saved));
    artistSave.querySelector("span").textContent = saved ? "保存済み" : "保存";
  };
  artistSave.addEventListener("click",() => {
    const saved = getSavedArtists();
    const next = saved.includes(artist.name) ? saved.filter(name => name !== artist.name) : [...saved,artist.name];
    localStorage.setItem(artistStorageKey,JSON.stringify(next));
    syncArtistSave();
  });
  syncArtistSave();

  const exhibitionsEl = document.querySelector("[data-current-exhibitions]");
  exhibitionsEl.innerHTML = EXHIBITIONS.map(item => `
    <a class="detail-related-card" href="./exhibition.html">
      <div class="detail-related-image"><img src="${esc(item.image)}" alt="" loading="lazy"></div>
      <span class="status">${esc(item.date)}</span>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.venue)}</p>
    </a>
  `).join("");

  document.querySelector("[data-museums]").innerHTML = detail.museums.map(museum => `
    <article class="museum-card">
      <small>${esc(museum[1])}</small>
      <h3>${esc(museum[0])}</h3>
      <p>${esc(museum[2])}</p>
    </article>
  `).join("");

  let related = detail.related
    .map(name => catalog.find(item => item.name === name))
    .filter(Boolean);

  if(!related.length){
    related = catalog
      .filter(item => item.name !== artist.name && item.category.some(category => artist.category.includes(category)))
      .slice(0,5);
  }
  if(related.length < 4){
    const used = new Set([artist.name,...related.map(item => item.name)]);
    related = [...related,...catalog.filter(item => !used.has(item.name)).slice(0,4-related.length)];
  }

  document.querySelector("[data-related-artists]").innerHTML = related.slice(0,6).map(item => `
    <a class="related-artist" href="./artist.html?name=${encodeURIComponent(item.name)}">
      <img src="${esc(item.image || item.img)}" alt="${esc(item.name)}" loading="lazy" style="object-position:${esc(item.position || "center")}">
      <strong>${esc(item.name)}</strong>
      <span>${esc(item.category[0])}</span>
    </a>
  `).join("");
})();
