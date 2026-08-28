/* Muuzee Personal Data — compatibility layer for current prototype storage */
(() => {
  "use strict";

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

  const workPrefix = "muuzee:saved-works:";

  const savedWorks = () => {
    const works = [];

    for(let index = 0; index < localStorage.length; index += 1){
      const key = localStorage.key(index);
      if(!key || !key.startsWith(workPrefix)) continue;

      const artist = key.slice(workPrefix.length);

      readArray(key).forEach(title => {
        works.push({
          id:`${artist}::${title}`,
          artist,
          title,
          storageKey:key
        });
      });
    }

    return works;
  };

  const saved = {
    artists:() => readArray("muuzee:saved-artists"),
    museums:() => readArray("muuzee:saved-museums"),
    exhibitions:() => readArray("muuzee:saved-exhibitions"),
    works:savedWorks,

    removeArtist:name => {
      writeArray(
        "muuzee:saved-artists",
        readArray("muuzee:saved-artists").filter(item => item !== name)
      );
    },

    removeMuseum:id => {
      writeArray(
        "muuzee:saved-museums",
        readArray("muuzee:saved-museums").filter(item => item !== id)
      );
    },

    removeExhibition:id => {
      writeArray(
        "muuzee:saved-exhibitions",
        readArray("muuzee:saved-exhibitions").filter(item => item !== id)
      );
    },

    removeWork:(artist,title) => {
      const key = `${workPrefix}${artist}`;
      writeArray(
        key,
        readArray(key).filter(item => item !== title)
      );
    }
  };

  window.MuuzeePersonalData = {saved};
})();
