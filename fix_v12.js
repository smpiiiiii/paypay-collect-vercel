const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// 参加フォームのtier select: amount=0でも「未定」表示
h = h.replace(
  "var tierAmtLabel = (tiers[k].amountType === 'tbd') ? '割り勘/未定' : '¥' + (tiers[k].amount || 0).toLocaleString();",
  "var tierAmtLabel = (tiers[k].amountType === 'tbd' || !tiers[k].amount) ? '未定' : '¥' + tiers[k].amount.toLocaleString();"
);

// tierInfo (複数区分)
h = h.replace(
  "tierInfo = tiers.map(function(t) { var al = (t.amountType === 'tbd') ? '割り勘/未定' : '¥' + (t.amount || 0).toLocaleString(); return t.label + ': ' + al; }).join(' / ');",
  "tierInfo = tiers.map(function(t) { var al = (t.amountType === 'tbd' || !t.amount) ? '未定' : '¥' + t.amount.toLocaleString(); return t.label + ': ' + al; }).join(' / ');"
);

// tierInfo (単一区分)
h = h.replace(
  "tierInfo = (tiers[0].amountType === 'tbd') ? '割り勘/未定' : '¥' + (tiers[0].amount || 0).toLocaleString() + '/人';",
  "tierInfo = (tiers[0].amountType === 'tbd' || !tiers[0].amount) ? '未定' : '¥' + tiers[0].amount.toLocaleString() + '/人';"
);

// メンバーカードのtierBadge
h = h.replace(
  "var mAmtLabel = (m.amount === 0 && eventData) ? (function() { var ti = (eventData.priceTiers || []).find(function(t) { return t.label === m.tier; }); return (ti && ti.amountType === 'tbd') ? '割り勘/未定' : '¥0'; })() : '¥' + (m.amount || 0).toLocaleString();",
  "var mAmtLabel = (!m.amount) ? '未定' : '¥' + m.amount.toLocaleString();"
);

// changeTier alert
h = h.replace(
  "var ctAmtLabel = (options[i].amountType === 'tbd') ? '割り勘/未定' : '¥' + (options[i].amount || 0).toLocaleString();",
  "var ctAmtLabel = (options[i].amountType === 'tbd' || !options[i].amount) ? '未定' : '¥' + options[i].amount.toLocaleString();"
);

fs.writeFileSync('public/index.html', h, 'utf8');

// 構文チェック
const r = fs.readFileSync('public/index.html', 'utf8');
r.match(/<script>([\s\S]*?)<\/script>/g).forEach((s, i) => {
  try { new Function(s.replace(/<\/?script>/g, '')); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR ' + e.message); }
});
