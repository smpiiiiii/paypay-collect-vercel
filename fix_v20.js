const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. バッジ表記を希望通りに修正
// ============================================
h = h.replace("badge.textContent = '✅ 確認済';", "badge.textContent = '✅ 幹事確認済み';");
h = h.replace("badge.textContent = '📝 申告済';", "badge.textContent = '💰 自己申告済み';");
h = h.replace("badge.textContent = '✅ 済';", "badge.textContent = '💰 自己申告済み';");

// ============================================
// 2. 作成ページのsplitCalcUI HTMLを削除
// ============================================
// 正確なHTML構造で削除
const startMarker = '<div id="splitCalcUI"';
const endMarker = '<span class="add-tier" id="addTierBtn">';
const startIdx = h.indexOf(startMarker);
const endIdx = h.indexOf(endMarker);
if (startIdx > 0 && endIdx > startIdx) {
  h = h.substring(0, startIdx) + h.substring(endIdx);
  console.log('splitCalcUI HTML removed (chars ' + startIdx + '-' + endIdx + ')');
}

// 作成ページ内のsplitCalcUI関連CSSを削除
h = h.replace(/\s*#splitCalcUI[^{]*\{[^}]*\}/g, '');

// ============================================
// 3. イベントページのスライダーJS修正
//    evSplitTotal等のIDを使うように既存のrenderSplitSliders等を確認
// ============================================
const lines = h.split('\n');
lines.forEach((l, i) => {
  if (l.includes('renderSplit') || l.includes('evSplitSliders') || l.includes('evSplitTotal') || l.includes('evSplitApply'))
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
console.log('バッジ 幹事確認済み:', r.includes('幹事確認済み'));
console.log('バッジ 自己申告済み:', r.includes('自己申告済み'));
console.log('区分変更なし:', !r.includes('changeTierBtn'));
