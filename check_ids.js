const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// 1. splitCalcUI HTMLがあるか確認
console.log('splitCalcUI HTML:', h.includes('id="splitCalcUI"'));

// 作成ページ用のsplitTotal HTMLを確認
const m1 = h.match(/id="splitCalcUI"[\s\S]{0,500}/);
console.log('\nsplitCalcUI周辺:', m1 ? m1[0].substring(0, 300) : 'NOT FOUND');

// 作成ページ内のsplitTotal inputを確認
// fix_v15でイベントページのsplitTotalをevSplitTotalに変えたが、
// fix_v16で作成ページのsplitTotalもevSplitTotalに変わっていないか？
const splitTotalMatches = h.match(/id="splitTotal"/g);
const evSplitTotalMatches = h.match(/id="evSplitTotal"/g);
console.log('\nsplitTotal HTML count:', splitTotalMatches ? splitTotalMatches.length : 0);
console.log('evSplitTotal HTML count:', evSplitTotalMatches ? evSplitTotalMatches.length : 0);

// JS参照
const jsSplitTotal = h.match(/getElementById\('splitTotal'\)/g);
const jsEvSplitTotal = h.match(/getElementById\('evSplitTotal'\)/g);
console.log('\nJS splitTotal refs:', jsSplitTotal ? jsSplitTotal.length : 0);
console.log('JS evSplitTotal refs:', jsEvSplitTotal ? jsEvSplitTotal.length : 0);
