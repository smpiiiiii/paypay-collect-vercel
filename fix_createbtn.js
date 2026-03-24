const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// createBtn内のpaypayLink参照を修正
h = h.replace(
  /var paypayInput = rows\[i\]\.querySelector\('\.tier-paypay'\);/,
  'var tAmountType = rows[i].querySelector(".tier-amount-type");'
);
h = h.replace(
  /var tPaypay = \(paypayInput\.value \|\| ''\)\.trim\(\);/,
  'var tType = tAmountType ? tAmountType.value : "fixed";'
);
h = h.replace(
  /if \(tLabel\) tiers\.push\(\{ label: tLabel, amount: tAmount, paypayLink: tPaypay \}\);/,
  'if (tLabel) tiers.push({ label: tLabel, amount: tAmount, amountType: tType });'
);

// CSSの.tier-paypay参照も削除
h = h.replace(/\.tier-row \.tier-paypay \{ flex: 100%; font-size: 12px \}\r?\n/, '');

fs.writeFileSync('public/index.html', h, 'utf8');

// 構文チェック
const r = fs.readFileSync('public/index.html', 'utf8');
const scripts = r.match(/<script>([\s\S]*?)<\/script>/g);
scripts.forEach((s, i) => {
  try { new Function(s.replace(/<\/?script>/g, '')); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR ' + e.message); }
});

// paypay残存チェック
const lines = r.split('\n');
let issues = [];
lines.forEach((l, i) => {
  if (l.includes('tier-paypay') || l.includes('tPaypay')) issues.push((i+1) + ': ' + l.trim());
});
console.log(issues.length === 0 ? '\nALL paypay refs removed!' : '\nRemaining:\n' + issues.join('\n'));
