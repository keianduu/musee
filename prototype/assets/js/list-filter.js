/* Musee shared list filter sheet — behavior only */
(() => {
  "use strict";

  const openButton = document.querySelector("[data-filter-open]");
  const sheet = document.querySelector("[data-filter-sheet]");
  const backdrop = document.querySelector("[data-filter-backdrop]");
  if(!openButton || !sheet || !backdrop) return;

  const closeButtons = sheet.querySelectorAll("[data-filter-close]");

  function openSheet(){
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      backdrop.classList.add("is-open");
      sheet.classList.add("is-open");
    });
    sheet.setAttribute("aria-hidden","false");
    document.body.classList.add("filter-sheet-open");
  }

  function closeSheet(){
    backdrop.classList.remove("is-open");
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden","true");
    document.body.classList.remove("filter-sheet-open");
    window.setTimeout(() => {
      if(!backdrop.classList.contains("is-open")) backdrop.hidden = true;
    }, 280);
  }

  openButton.addEventListener("click",openSheet);
  backdrop.addEventListener("click",closeSheet);
  closeButtons.forEach(button => button.addEventListener("click",closeSheet));
  document.addEventListener("keydown",event => {
    if(event.key === "Escape" && sheet.classList.contains("is-open")) closeSheet();
  });

  window.Musee = window.Musee || {};
  window.Musee.filterSheet = {open:openSheet,close:closeSheet};
})();
