const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. 幹事（adminToken保持者）は自動で幹事モードON
// ============================================
// adminToggle表示直後に自動クリックを追加
h = h.replace(
  "document.getElementById('adminToggle').style.display = adminToken ? '' : 'none';\n            document.getElementById('adminHelpText').style.display = adminToken ? '' : 'none';",
  "document.getElementById('adminToggle').style.display = adminToken ? '' : 'none';\n            document.getElementById('adminHelpText').style.display = adminToken ? '' : 'none';\n            // 幹事は自動的に幹事モードON\n            if (adminToken) {\n                isAdmin = true;\n                document.getElementById('adminToggle').textContent = '\\uD83D\\uDD13 幹事モード ON';\n                document.getElementById('adminToggle').classList.add('active');\n            }"
);

// ============================================
// 2. 催促メッセージ内の¥0→割り勘/未定
// ============================================
h = h.replace(
  "return '⏳ ' + m.name + '（' + (m.tier || '一般') + ' ¥' + (m.amount || 0).toLocaleString() + '）';",
  "var rmAmt = (m.amount === 0) ? '割り勘/未定' : '¥' + m.amount.toLocaleString();\n                return '⏳ ' + m.name + '（' + (m.tier || '一般') + ' ' + rmAmt + '）';"
);

// ============================================
// 3. PayPay送金ボタン: amount=0の場合非表示
// ============================================
h = h.replace(
  "payBtn.textContent = '💱 PayPayで ¥' + (me.amount || 0).toLocaleString() + ' 送金する';",
  "if (me.amount > 0) { payBtn.textContent = '\\uD83D\\uDCB1 PayPayで ¥' + me.amount.toLocaleString() + ' 送金する'; } else { payBtn.style.display = 'none'; }"
);

// ============================================
// 4. 自己申告の送金確認: amount=0時にスキップ
// ============================================
h = h.replace(
  "if (!confirm('¥' + (me.amount || 0).toLocaleString() + ' を送金しましたか？')) return;",
  "if (me.amount > 0 && !confirm('¥' + me.amount.toLocaleString() + ' を送金しましたか？')) return;"
);

// ============================================
// 5. 自分の支払い情報の「¥0」→「割り勘/未定」
// ============================================
h = h.replace(
  "var amountText = (me.amount > 0) ? '¥' + me.amount.toLocaleString() : '未定';",
  "var amountText = (me.amount > 0) ? '¥' + me.amount.toLocaleString() : '割り勘/未定';"
);

fs.writeFileSync('public/index.html', h, 'utf8');

// 構文チェック
const r = fs.readFileSync('public/index.html', 'utf8');
const scripts = r.match(/<script>([\s\S]*?)<\/script>/g);
let ok = true;
scripts.forEach((s, i) => {
  try { new Function(s.replace(/<\/?script>/g, '')); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR ' + e.message); ok = false; }
});

console.log('\n=== チェック ===');
console.log(ok ? '✅ 構文OK' : '❌ 構文エラー');
console.log(r.includes('isAdmin = true') ? '✅ 幹事自動ON' : '❌ 幹事自動ON');
console.log(r.includes("rmAmt") ? '✅ 催促メッセ割り勘表示' : '❌ 催促メッセ');
console.log(r.includes("payBtn.style.display = 'none'") ? '✅ PayPay 0円非表示' : '❌ PayPay');
