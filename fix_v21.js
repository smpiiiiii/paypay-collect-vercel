const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// イベントページのスライダーJSが旧IDを参照している問題を修正
// 作成ページ用のsplitCalcUI関連JSも不要なので、イベントページ用に書き換える

// 旧: getElementById('splitSliders') → 新: getElementById('evSplitSliders')
// 旧: getElementById('splitTotal') → 新: getElementById('evSplitTotal')  (既にfix_v16で変更済みかチェック)

// 残っている旧ID参照を全て修正
h = h.replace("getElementById('splitSliders')", "getElementById('evSplitSliders')");
h = h.replace("getElementById('splitTotal')", "getElementById('evSplitTotal')");
h = h.replace("getElementById('splitResult')", "getElementById('evSplitSummary')");

// splitCalcUI参照を無効化（HTML削除済みなのでnullチェック追加）
h = h.replace(
  "var splitCalcUI = document.getElementById('splitCalcUI');",
  "var splitCalcUI = document.getElementById('splitCalcUI'); // 削除済み"
);
h = h.replace(
  "splitCalcUI.style.display = hasSplit ? 'block' : 'none';",
  "if (splitCalcUI) splitCalcUI.style.display = hasSplit ? 'block' : 'none';"
);

fs.writeFileSync('public/index.html', h, 'utf8');

const r = fs.readFileSync('public/index.html', 'utf8');
r.match(/<script>([\s\S]*?)<\/script>/g).forEach((s, i) => {
  try { new Function(s.replace(/<\/?script>/g, '')); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR ' + e.message); }
});

// 旧ID参照がJSに残っていないか
const oldRefs = (r.match(/getElementById\('split(Total|Sliders|Result|CalcUI)'\)/g) || []);
console.log('\n旧ID参照残り:', oldRefs.length === 0 ? 'なし ✅' : oldRefs);

const newRefs = (r.match(/getElementById\('evSplit/g) || []);
console.log('新ID参照数:', newRefs.length);
