/* Muuzee MyPage Navigation — shared inside MyPage */
(() => {
  "use strict";

  const groups = [
    {
      label:"Profile",
      items:[
        {key:"top",label:"TOP",href:"./my-art.html"},
        {key:"artwall",label:"ArtWall編集",href:"./artwall-edit.html"}
      ]
    },
    {
      label:"Collection",
      items:[
        {key:"saved",label:"保存",href:"./saved.html"},
        {key:"seen",label:"見た",href:"./seen.html"},
        {key:"favorites",label:"推し",href:"./favorites.html"}
      ]
    },
    {
      label:"Social",
      items:[
        {key:"friends",label:"フレンド",href:"./friends.html"},
        {key:"groups",label:"グループ",href:"./groups.html"}
      ]
    },
    {
      label:"Settings",
      items:[
        {key:"notifications",label:"通知",href:"./notifications.html"},
        {key:"notification-settings",label:"通知設定",href:"./notification-settings.html"}
      ]
    }
  ];

  const esc = value => String(value ?? "").replace(/[&<>"']/g,char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));

  document.querySelectorAll("[data-mypage-nav]").forEach(root => {
    const active = root.dataset.mypageActive || "";

    root.innerHTML = `
      <nav class="mypage-nav" aria-label="MyPage navigation">
        ${groups.map(group => `
          <div class="mypage-nav-group">
            <div class="mypage-nav-group-label">${esc(group.label)}</div>
            <div class="mypage-nav-items">
              ${group.items.map(item => `
                <a class="mypage-nav-item${item.key === active ? " is-active" : ""}"
                  href="${esc(item.href)}"
                  ${item.key === active ? 'aria-current="page"' : ""}>
                  ${esc(item.label)}
                </a>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </nav>
    `;
  });
})();
