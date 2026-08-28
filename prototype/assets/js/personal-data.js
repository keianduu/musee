/* Muuzee Personal Data — prototype local persistence + one-time sample seed */
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

  const mergePrimitive = (key,samples) => {
    const current = readArray(key);
    const merged = [...current];

    samples.forEach(value => {
      if(!merged.includes(value)) merged.push(value);
    });

    writeArray(key,merged);
  };

  const mergeObjects = (key,samples) => {
    const current = readArray(key);
    const merged = [...current];

    samples.forEach(sample => {
      const exists = merged.some(item =>
        item &&
        item.type === sample.type &&
        item.id === sample.id
      );

      if(!exists) merged.push(sample);
    });

    writeArray(key,merged);
  };

  const seedKey = "muuzee:prototype-personal-samples:v2";

  if(localStorage.getItem(seedKey) !== "done"){
    mergePrimitive("muuzee:saved-artists",[
      "草間彌生",
      "クロード・モネ",
      "庄島歩音"
    ]);

    mergePrimitive("muuzee:saved-museums",[
      "nact",
      "21kanazawa",
      "moma"
    ]);

    mergePrimitive("muuzee:saved-exhibitions",[
      "dream-river",
      "storytelling",
      "noise"
    ]);

    mergePrimitive("muuzee:saved-works:クロード・モネ",[
      "睡蓮",
      "印象・日の出"
    ]);

    mergePrimitive("muuzee:saved-works:草間彌生",[
      "Infinity Nets"
    ]);

    mergeObjects("muuzee:seen-items",[
      {type:"exhibition",id:"dream-river",date:"2026.08.24"},
      {type:"museum",id:"21kanazawa",date:"2026.07.18"},
      {type:"exhibition",id:"curious-matters",date:"2026.06.06"},
      {type:"museum",id:"nact",date:"2026.05.24"}
    ]);

    mergeObjects("muuzee:favorite-items",[
      {type:"artist",id:"草間彌生"},
      {type:"artist",id:"クロード・モネ"},
      {type:"museum",id:"21kanazawa"},
      {type:"exhibition",id:"dream-river"}
    ]);

    localStorage.setItem(seedKey,"done");
  }

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

  window.MuuzeePersonalData = {
    saved,
    seen:() => readArray("muuzee:seen-items"),
    favorites:() => readArray("muuzee:favorite-items")
  };
})();
