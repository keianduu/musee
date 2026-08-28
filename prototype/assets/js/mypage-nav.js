/* Muuzee MyPage primary navigation — collection pages only */
(() => {
  "use strict";

  const NAV = [
    {
      key:"saved",
      label:"保存",
      href:"./saved.html",
      icon:'<path d="M6 3h12v18l-6-4-6 4Z"></path>'
    },
    {
      key:"seen",
      label:"見た",
      href:"./seen.html",
      icon:'<circle cx="12" cy="12" r="9"></circle><path d="m8 12 2.6 2.6L16.5 9"></path>'
    },
    {
      key:"favorites",
      label:"推し",
      href:"./favorites.html",
      icon:'<path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"></path>'
    }
  ];

  document.querySelectorAll("[data-mypage-profile]").forEach(root => {
    root.innerHTML = `
      <div class="mypage-profile-person">
        <img src="./assets/images/profile-avatar.jpg" alt="ashelry">
        <div>
          <strong>ashelry</strong>
          <span>Art Profile</span>
        </div>
      </div>
      <a class="mypage-profile-settings" href="./profile-settings.html">プロフィール設定 →</a>
    `;
  });

  document.querySelectorAll("[data-mypage-nav]").forEach(root => {
    const active = root.dataset.mypageActive || "";

    root.innerHTML = `
      <nav class="mypage-primary-nav" aria-label="MyPage navigation">
        ${NAV.map(item => `
          <a class="mypage-primary-nav-item${active === item.key ? " is-active" : ""}"
             href="${item.href}"
             ${active === item.key ? 'aria-current="page"' : ""}>
            <svg viewBox="0 0 24 24">${item.icon}</svg>
            <span>${item.label}</span>
          </a>
        `).join("")}
      </nav>
    `;
  });
})();
