/*
  Musee Exhibition Card — Shared behavior
  Detect poster orientation from the actual image dimensions.
*/
(() => {
  "use strict";

  function classifyImage(img){
    if(!img || !img.closest) return;

    const card = img.closest(".poster-card");
    if(!card) return;

    const width = img.naturalWidth || 0;
    const height = img.naturalHeight || 0;
    if(!width || !height) return;

    const landscape = width > height;

    card.classList.toggle("is-landscape", landscape);
    card.classList.toggle("is-portrait", !landscape);
  }

  function bindImage(img){
    if(img.dataset.museePosterOrientationBound === "true"){
      if(img.complete) classifyImage(img);
      return;
    }

    img.dataset.museePosterOrientationBound = "true";

    if(img.complete){
      classifyImage(img);
    }else{
      img.addEventListener("load", () => classifyImage(img), {once:true});
    }
  }

  function scan(root = document){
    root.querySelectorAll?.(".poster-card .poster-stage img").forEach(bindImage);
  }

  function init(){
    scan();

    const observer = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => {
          if(node.nodeType !== 1) return;

          if(node.matches?.(".poster-card .poster-stage img")){
            bindImage(node);
          }

          scan(node);
        });
      });
    });

    observer.observe(document.body,{
      childList:true,
      subtree:true
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",init,{once:true});
  }else{
    init();
  }
})();
