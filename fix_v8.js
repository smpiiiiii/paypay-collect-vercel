// 作成ページ簡素化: PayPayリンク削除、割り勘/未定統合
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. PayPayリンク入力欄を作成ページから削除
// ============================================
html = html.replace(
  "        var paypayInput = document.createElement('input');\r\n        paypayInput.type = 'url'; paypayInput.placeholder = 'PayPayリンク（任意）';\r\n        paypayInput.className = 'tier-paypay'; paypayInput.value = paypayLink || '';\r\n        row.appendChild(labelInput); row.appendChild(amountType); row.appendChild(amountInput); row.appendChild(del);\r\n        row.appendChild(paypayInput);",
  "        row.appendChild(labelInput); row.appendChild(amountType); row.appendChild(amountInput); row.appendChild(del);"
);

// ============================================
// 2. 割り勘と未定を「割り勘/未定」に統合
// ============================================
html = html.replace(
  `amountType.innerHTML = '<option value="fixed">金額指定</option><option value="tbd">未定</option><option value="split">割り勘</option>';`,
  `amountType.innerHTML = '<option value="fixed">金額指定</option><option value="tbd">割り勘/未定</option>';`
);

// splitモードのチェックもtbdに統合
// checkSplitMode: split→tbdに変更
html = html.replace(
  "if (types[i].value === 'split') hasSplit = true;",
  "if (types[i].value === 'tbd') hasSplit = true;"
);

// ============================================
// 3. イベントページの表示もsplit参照をtbdに統合
// ============================================
// tierAmtLabel: split判定を削除（tbdに統合）
html = html.replace(
  "var tierAmtLabel = (tiers[k].amountType === 'tbd') ? '未定' : (tiers[k].amountType === 'split') ? '割り勘' : '¥' + (tiers[k].amount || 0).toLocaleString();",
  "var tierAmtLabel = (tiers[k].amountType === 'tbd' || tiers[k].amountType === 'split') ? '割り勘/未定' : '¥' + (tiers[k].amount || 0).toLocaleString();"
);

// tierInfo表示
html = html.replace(
  "var al = (t.amountType === 'tbd') ? '未定' : (t.amountType === 'split') ? '割り勘' : '¥' + (t.amount || 0).toLocaleString();",
  "var al = (t.amountType === 'tbd' || t.amountType === 'split') ? '割り勘/未定' : '¥' + (t.amount || 0).toLocaleString();"
);

// 単一tier
html = html.replace(
  "tierInfo = (tiers[0].amountType === 'tbd') ? '金額未定' : (tiers[0].amountType === 'split') ? '割り勘' : '¥' + (tiers[0].amount || 0).toLocaleString() + '/人';",
  "tierInfo = (tiers[0].amountType === 'tbd' || tiers[0].amountType === 'split') ? '割り勘/未定' : '¥' + (tiers[0].amount || 0).toLocaleString() + '/人';"
);

// メンバーカード
html = html.replace(
  "return ti && ti.amountType === 'tbd' ? '未定' : ti && ti.amountType === 'split' ? '割り勘' : '¥0';",
  "return (ti && (ti.amountType === 'tbd' || ti.amountType === 'split')) ? '割り勘/未定' : '¥0';"
);

// changeTier alert
html = html.replace(
  "var ctAmtLabel = (options[i].amountType === 'tbd') ? '未定' : (options[i].amountType === 'split') ? '割り勘' : '¥' + (options[i].amount || 0).toLocaleString();",
  "var ctAmtLabel = (options[i].amountType === 'tbd' || options[i].amountType === 'split') ? '割り勘/未定' : '¥' + (options[i].amount || 0).toLocaleString();"
);

// ============================================
// 4. createBtnのtiers取得からpaypayLink削除
// ============================================
html = html.replace(
  "var tPaypay = rows[i].querySelector('.tier-paypay');",
  "// PayPayリンクは幹事モードで設定"
);
html = html.replace(
  /tPaypay\s*\?\s*tPaypay\.value\s*:\s*''/g,
  "''"
);

// ============================================
// 5. PayPayリンクのCSSを削除（あれば）
// ============================================
html = html.replace(
  ".tier-row input.tier-paypay { flex: 2; font-size: 11px }",
  ""
);

fs.writeFileSync('public/index.html', html, 'utf8');

// 構文チェック
const result = fs.readFileSync('public/index.html', 'utf8');
const scripts = result.match(/<script>([\s\S]*?)<\/script>/g);
let ok = true;
scripts.forEach((s, i) => {
  const code = s.replace(/<\/?script>/g, '');
  try { new Function(code); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR: ' + e.message); ok = false; }
});

const checks = [
  ['構文OK', ok],
  ['PayPayInput削除', !result.includes('tier-paypay')],
  ['割り勘/未定統合', result.includes('割り勘/未定')],
  ['splitオプション削除', !result.includes('value="split">割り勘<')],
  ['tbd表示統合', result.includes("'割り勘/未定'")],
];
console.log('\n=== チェック ===');
checks.forEach(([n, v]) => console.log(`${v ? '✅' : '❌'} ${n}`));
