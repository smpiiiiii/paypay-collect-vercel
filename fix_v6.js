// 金額フィールドに金額タイプ選択を追加
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. addTierRow関数を修正: 金額入力の横にタイプ選択を追加
// ============================================
// 現在のaddTierRow関数を探す
// amountInput の後に amountType セレクトを追加
html = html.replace(
  "amountInput.inputMode = 'numeric'; amountInput.value = amount || '';\r\n        amountInput.max = '9999999';",
  `amountInput.inputMode = 'numeric'; amountInput.value = amount || '';
        amountInput.max = '9999999';
        // 金額タイプ選択
        var amountType = document.createElement('select');
        amountType.className = 'tier-amount-type';
        amountType.style.cssText = 'padding:8px;border-radius:8px;border:1px solid #333;background:#1a1a1a;color:#fff;font-size:11px;min-width:70px';
        amountType.innerHTML = '<option value="fixed">金額指定</option><option value="tbd">未定</option><option value="split">割り勘</option>';
        amountType.value = amountTypeVal || 'fixed';
        amountType.addEventListener('change', function() {
            if (amountType.value === 'fixed') {
                amountInput.style.display = ''; amountInput.required = true; amountInput.placeholder = '金額';
            } else {
                amountInput.style.display = 'none'; amountInput.required = false; amountInput.value = '0';
            }
        });
        if (amountTypeVal && amountTypeVal !== 'fixed') {
            amountInput.style.display = 'none'; amountInput.required = false;
        }`
);

// addTierRow関数の引数に amountTypeVal を追加
html = html.replace(
  "function addTierRow(label, amount, paypayLink) {",
  "function addTierRow(label, amount, paypayLink, amountTypeVal) {"
);

// row.appendChild にamountTypeを追加（amountInputの後に）
html = html.replace(
  "row.appendChild(labelInput); row.appendChild(amountInput); row.appendChild(del);",
  "row.appendChild(labelInput); row.appendChild(amountType); row.appendChild(amountInput); row.appendChild(del);"
);

// ============================================
// 2. 初期行もamountType対応
// ============================================
html = html.replace(
  "addTierRow('男子', '', ''); addTierRow('女子', '', '');",
  "addTierRow('男子', '', '', ''); addTierRow('女子', '', '', '');"
);
// addTierBtn
html = html.replace(
  "document.getElementById('addTierBtn').addEventListener('click', function() { addTierRow('', '', ''); });",
  "document.getElementById('addTierBtn').addEventListener('click', function() { addTierRow('', '', '', ''); });"
);

// ============================================
// 3. createBtn: tiersにamountTypeを含める
// ============================================
html = html.replace(
  "if (tLabel) tiers.push({ label: tLabel, amount: tAmount, paypayLink: tPaypay });",
  "var tAmountType = rows[i].querySelector('.tier-amount-type');\n            var tType = tAmountType ? tAmountType.value : 'fixed';\n            if (tLabel) tiers.push({ label: tLabel, amount: tAmount, paypayLink: tPaypay, amountType: tType });"
);

// ============================================
// 4. applyTemplate: amountType対応
// ============================================
html = html.replace(
  "addTierRow(hist.tiers[i].label || '', hist.tiers[i].amount || '', hist.tiers[i].paypayLink || '');",
  "addTierRow(hist.tiers[i].label || '', hist.tiers[i].amount || '', hist.tiers[i].paypayLink || '', hist.tiers[i].amountType || 'fixed');"
);
html = html.replace(
  /addTierRow\('\\u7537\\u5B50', '', ''\)/,
  "addTierRow('\\u7537\\u5B50', '', '', '')"
);
html = html.replace(
  /addTierRow\('\\u5973\\u5B50', '', ''\)/,
  "addTierRow('\\u5973\\u5B50', '', '', '')"
);

// ============================================
// 5. イベントページ: 金額表示でamountTypeを反映
// ============================================
// tierInfo表示（joinフォームのselect）で未定/割り勘を表示
html = html.replace(
  "opt.textContent = t.label + '（¥' + t.amount.toLocaleString() + '）';",
  "var amtText = t.amountType === 'tbd' ? '未定' : t.amountType === 'split' ? '参加人数次第' : '¥' + t.amount.toLocaleString();\n                opt.textContent = t.label + '（' + amtText + '）';"
);

// ============================================
// 6. CSS: tier-rowのレイアウト調整
// ============================================
html = html.replace(
  ".tier-row { display: flex; gap: 6px; margin-bottom: 8px; align-items: center }",
  ".tier-row { display: flex; gap: 4px; margin-bottom: 8px; align-items: center; flex-wrap: wrap }"
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
  ['amountType select', result.includes('tier-amount-type')],
  ['未定option', result.includes("'tbd'")],
  ['割り勘option', result.includes("'split'")],
  ['createBtn amountType', result.includes("amountType: tType")],
  ['applyTemplate amountType', result.includes("amountType || 'fixed'")],
  ['表示反映', result.includes("参加人数次第")],
  ['構文OK', ok],
];
console.log('\n=== チェック ===');
checks.forEach(([n, v]) => console.log(`${v ? '✅' : '❌'} ${n}`));
