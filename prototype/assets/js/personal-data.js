/* Muuzee Personal Data — prototype local persistence + sample seed */
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

  const objectIdentity = item => {
    if(!item || typeof item !== "object") return "";
    if(item.type === "work"){
      return `${item.type}:${item.artist || ""}:${item.title || item.id || ""}`;
    }
    return `${item.type || ""}:${item.id || item.name || ""}`;
  };

  const mergeObjects = (key,samples) => {
    const current = readArray(key);
    const identities = new Set(current.map(objectIdentity));
    const merged = [...current];

    samples.forEach(sample => {
      const identity = objectIdentity(sample);
      if(identity && !identities.has(identity)){
        merged.push(sample);
        identities.add(identity);
      }
    });

    writeArray(key,merged);
  };

  /* v4 adds samples for every visible personal collection tab.
     It only merges; existing user prototype data is never overwritten. */
  const seedKey = "muuzee:prototype-personal-samples:v4";

  if(localStorage.getItem(seedKey) !== "done"){
    mergePrimitive("muuzee:saved-artists",[
      "クロード・モネ",
      "村上隆",
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

    mergePrimitive("muuzee:saved-works:村上隆",[
      "727"
    ]);

    mergeObjects("muuzee:seen-items",[
      {type:"artist",id:"クロード・モネ",date:"2026.08.10"},
      {type:"artist",id:"村上隆",date:"2026.07.02"},
      {type:"work",id:"monet-water-lilies",artist:"クロード・モネ",title:"睡蓮",year:"1916",date:"2026.08.10"},
      {type:"work",id:"monet-impression",artist:"クロード・モネ",title:"印象・日の出",year:"1872",date:"2026.06.15"},
      {type:"museum",id:"nact",date:"2026.08.24"},
      {type:"museum",id:"21kanazawa",date:"2026.07.18"},
      {type:"exhibition",id:"dream-river",date:"2026.08.24"},
      {type:"exhibition",id:"curious-matters",date:"2026.06.06"}
    ]);

    mergeObjects("muuzee:favorite-items",[
      {type:"artist",id:"クロード・モネ"},
      {type:"artist",id:"村上隆"},
      {type:"artist",id:"庄島歩音"},
      {type:"museum",id:"21kanazawa"},
      {type:"museum",id:"moma"},
      {type:"museum",id:"chichu"}
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
          year:""
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
