export function createVenueImageResearchPrompt(venue: { name: string; address?: string | null; officialUrl?: string | null }) {
  return `以下の美術館・ギャラリーについて、Muuzeeという美術館・展覧会紹介Web/PWAサービスで使用する施設画像候補と、その再配布条件を調査してください。

施設名：${venue.name}
住所：${venue.address || "不明"}
公式URL：${venue.officialUrl || "不明"}

優先順：Wikimedia Commons、Wikidata、施設公式Press / Media、公式配布素材、Public Domain / Open Data、自治体Open Data、施設への問い合わせ。
Google画像検索結果、Google Maps / Street View、非公式Blog、SNS転載、出所不明画像は候補にしないでください。

候補ごとに、画像または取得ページURL、提供元、Source type、License、利用条件、Credit、利用期限、トリミング可否、Download可否、確認できた根拠を整理してください。不明な項目は「不明」で構いません。

Rights classificationは必ず次の3分類から選び、確認できた表記と分けてください。
1. 明確に不可
2. 記載なし・不明
3. 明確に利用可能

禁止表記がないだけで利用可能とは判断しないでください。一方、許諾表記が見つからないだけで利用不可とは判断せず、「記載なし・不明」にしてください。AIは利用許諾の最終判断をせず、根拠情報を提示してください。`;
}
