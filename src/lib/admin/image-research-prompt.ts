type PromptExhibition = {
  title: string;
  venue: string | null;
  startDate: string | null;
  endDate: string | null;
  officialUrl: string | null;
};

function dateLabel(startDate: string | null, endDate: string | null) {
  if (startDate && endDate) return `${startDate}〜${endDate}`;
  return startDate || endDate || "不明";
}

export function createImageResearchPrompt(exhibition: PromptExhibition) {
  return `以下の展覧会について、
Muuzeeという展覧会紹介Web/PWAサービスで使用する
画像候補と、その配布条件の表記を調査してください。

展覧会：
${exhibition.title}

会場：
${exhibition.venue || "不明"}

会期：
${dateLabel(exhibition.startDate, exhibition.endDate)}

公式URL：
${exhibition.officialUrl || "不明"}

以下の順番を優先してください。

1. ARTPR
2. 美術館公式Pressページ
3. 展覧会公式Pressページ
4. 主催者公式Press素材
5. Public Domain / Open Collection
6. Wikimedia Commons
7. 主催者・美術館への直接問い合わせ

Google画像検索結果、非公式Blog、SNS転載、出所不明画像は、
元の提供元を確認できない限り候補にしないでください。

画像候補ごとに、配布条件を必ず次の3分類のいずれかで判定してください。

1. 明確に再配布NGとされている
   - 転載禁止、再配布禁止、Web掲載不可などの明示がある
2. 表記がなく判断がつかない
   - 利用条件が見つからない、曖昧、またはMuuzeeでの利用可否を判断できない
3. 配布OKとされている
   - Web掲載、転載、再配布、商用利用等について、今回の用途を許可する明示がある

禁止の明示がないことだけを理由に「配布OK」としないでください。
一方、許可表記が見つからないことだけを理由に「再配布NG」とせず、
その場合は「表記がなく判断がつかない」に分類してください。

画像候補ごとに、

- 画像または取得ページURL
- 提供元
- Source type
- 利用条件
- 3分類の判定
- 申請の要否
- Credit
- 利用期限
- トリミング可否
- Download可否
- 判断根拠URL

を整理してください。

URL、Credit、判断根拠が見つからない項目は「不明」で構いません。
確認できた表記と、そこから上記3分類のどれにしたかを分けて記載してください。`;
}
