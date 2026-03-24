const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. バッジを3段階に: 未払い → 自己申告済み → 幹事確認済み
// ============================================
h = h.replace(
  "badge.textContent = m.paid ? '✅ 済' : '⏳ 未払い';",
  "badge.textContent = m.confirmed ? '✅ 確認済み' : m.paid ? '💰 自己申告済み' : '⏳ 未払い';\n        badge.style.background = m.confirmed ? '#c8e6c9' : m.paid ? '#fff3e0' : '#ffebee';\n        badge.style.color = m.confirmed ? '#2e7d32' : m.paid ? '#e65100' : '#c62828';"
);

// ============================================
// 2. 区分変更ボタンを削除
// ============================================
// changeTierBtnの生成コードを削除
h = h.replace(/\/\/ 区分変更ボタン[\s\S]*?actionsDiv\.appendChild\(changeTierBtn\);\s*\n/g, '');
// もし上で消えなかった場合、changeTierBtn参照を探して消す
h = h.replace(/var changeTierBtn[\s\S]*?actionsDiv\.appendChild\(changeTierBtn\);\s*\n/g, '');

// ============================================
// 3. 作成ページの割り勘計算UI(splitCalcUI)を削除
// ============================================
h = h.replace(/<div id="splitCalcUI"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<span class="add-tier"/, '<span class="add-tier"');

// splitCalcUI関連JS（checkSplitMode, updateSplitSliders等）を無効化
h = h.replace(
  "if (typeof checkSplitMode === 'function') checkSplitMode();",
  "// checkSplitMode disabled"
);

// 不要になったCSS（#splitCalcUI）を削除
h = h.replace(/#splitCalcUI \{[^}]*\}\s*/g, '');
h = h.replace(/#splitCalcUI [^{]*\{[^}]*\}\s*/g, '');

// ============================================
// 4. イベントページのスライダーJS: evSplit*のIDで参照するように修正
// ============================================
// イベントページのスライダーJSを探す
const evSplitIdx = h.indexOf('evSplitTotal');
console.log('evSplitTotal found at char:', evSplitIdx);

// イベントページ用のスライダーJS参照を確認
const lines = h.split('\n');
lines.forEach((l, i) => {
  if (l.includes('evSplit') || l.includes('splitApply') || l.includes('renderSplit'))
    console.log((i+1) + ': ' + l.trim().substring(0, 100));
});

fs.writeFileSync('public/index.html', h, 'utf8');

// 構文チェック
const r = fs.readFileSync('public/index.html', 'utf8');
r.match(/<script>([\s\S]*?)<\/script>/g).forEach((s, i) => {
  try { new Function(s.replace(/<\/?script>/g, '')); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR ' + e.message); }
});

console.log('\nチェック:');
console.log('splitCalcUI削除:', !r.includes('id="splitCalcUI"'));
console.log('バッジ3段階:', r.includes('自己申告済み'));
console.log('区分変更削除:', !r.includes('changeTierBtn'));
