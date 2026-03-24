const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. イベントページのスライダーHTMLのIDをリネーム（evSplit*）
// ============================================
h = h.replace(
  'id="splitTotal" placeholder="0" inputmode="numeric" style="flex:1;font-size:18px',
  'id="evSplitTotal" placeholder="0" inputmode="numeric" style="flex:1;font-size:18px'
);
h = h.replace(
  '<div id="splitSliders"></div>\r\n            <div id="splitSummary"></div>\r\n            <button class="btn btn-red" id="splitApplyBtn"',
  '<div id="evSplitSliders"></div>\r\n            <div id="evSplitSummary"></div>\r\n            <button class="btn btn-red" id="evSplitApplyBtn"'
);

// ============================================
// 2. イベントページのJS: evSplit* IDに変更
// ============================================
// イベントページのスライダーJS参照を検索して修正
// 正確な場所を見つける
h = h.replace("getElementById('splitApplyBtn')", "getElementById('evSplitApplyBtn')");

// イベントページ側のsplitTotal/splitSliders/splitSummary参照を修正するため
// イベントページのスクリプト部分をnodeで検索
const evSplitJS = h.indexOf("getElementById('splitTotal')");
const createSplitJS = h.indexOf("var splitTotalInput = document.getElementById('splitTotal')");
// createSplitJS は作成ページ用（残す）。イベントページ用のsplit参照はevSplit*にする

// イベントページのsplit JS (evSplitTotal等を参照するはず) を探す
// 実はイベントページのJSは別のセクションにあるかも...

fs.writeFileSync('public/index.html', h, 'utf8');

// まずイベントページ側のsplitの参照を全部洗い出す
const lines = h.split('\n');
lines.forEach((l, i) => {
  if (l.includes("'splitTotal'") || l.includes("'splitSliders'") || l.includes("'splitSummary'") || l.includes("'splitApplyBtn'")) {
    console.log((i+1) + ': ' + l.trim().substring(0, 120));
  }
});
