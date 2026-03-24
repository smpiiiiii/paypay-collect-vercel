const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. 作成ページの splitCalcUI HTML を復元
//    fix_v14で追加した作成ページ用UIのIDを確認・修正
// ============================================

// 作成ページ用: splitCalcUI div が消えている
// addTierBtnの前にsplitCalcUI HTMLを再挿入
if (!h.includes('id="splitCalcUI"')) {
  h = h.replace(
    '<button type="button" class="add-tier-btn" id="addTierBtn">＋ 区分を追加</button>',
    `<div id="splitCalcUI" style="display:none">
                <div class="split-header">\uD83D\uDCB1 割り勘計算</div>
                <div class="split-row">
                    <label>合計</label>
                    <input type="number" id="splitTotal" placeholder="合計金額" inputmode="numeric" style="flex:1;padding:8px;border-radius:8px;border:1px solid #333;background:#111;color:#fff;font-size:14px">
                    <span style="font-size:11px;color:#888">円</span>
                </div>
                <div id="splitSliders"></div>
                <div id="splitResult" style="font-size:11px;color:#888;margin-top:4px"></div>
            </div>
            <button type="button" class="add-tier-btn" id="addTierBtn">＋ 区分を追加</button>`
  );
}

// ============================================
// 2. JS: 作成ページ用のsplitTotal参照を修正
// ============================================
// 作成ページのJSは splitTotal / splitSliders / splitResult を参照すべき
// 現在JSは getElementById('splitTotal') → 上で復元したので問題なし

// splitResultDiv の参照を確認
if (!h.includes("getElementById('splitResult')")) {
  h = h.replace(
    "var splitSlidersDiv = document.getElementById('splitSliders');",
    "var splitSlidersDiv = document.getElementById('splitSliders');\n    var splitResultDiv = document.getElementById('splitResult');"
  );
}

// ============================================
// 3. 集金完了後の表記を整理
//    「済」「確認済み」「幹事確認済み」→ シンプルに「✅ 完了」だけに
// ============================================
// 済バッジのテキストを統一
h = h.replace(
  "badge.textContent = m.confirmed ? '✅ 確認済' : (m.paid ? '💰 済' : '⏳ 未払い');",
  "badge.textContent = m.paid ? '✅ 済' : '⏳ 未払い';"
);

// 長押し情報パネルの「幹事が確認済み」表記を簡略化
h = h.replace(
  "if (member.confirmed) info.push('\\u2705 幹事が確認済み');",
  "if (member.confirmed) info.push('\\u2705 確認OK');"
);

// 完了ボタンのアラート文を簡潔に
h = h.replace(
  "alert('\\uD83C\\uDF89 集金完了！\\n\\n参加者: ' + ms.length + '人\\n合計: \\u00A5' + total.toLocaleString() + '\\n\\nお疲れ様でした！');\n        toggleHistoryDone(eventId);\n        if (confirm('トップ画面に戻りますか？')) { location.href = '/'; }",
  "alert('\\uD83C\\uDF89 集金完了！\\n\\n参加者: ' + ms.length + '人\\n合計: \\u00A5' + total.toLocaleString());\n        toggleHistoryDone(eventId);\n        if (confirm('トップに戻りますか？')) { location.href = '/'; }"
);

fs.writeFileSync('public/index.html', h, 'utf8');

// 構文チェック
const r = fs.readFileSync('public/index.html', 'utf8');
r.match(/<script>([\s\S]*?)<\/script>/g).forEach((s, i) => {
  try { new Function(s.replace(/<\/?script>/g, '')); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR ' + e.message); }
});

// ID チェック
console.log('\nsplitCalcUI HTML:', r.includes('id="splitCalcUI"'));
console.log('splitTotal HTML:', r.includes('id="splitTotal"'));
console.log('splitSliders HTML:', r.includes('id="splitSliders"'));
console.log('evSplitTotal HTML:', r.includes('id="evSplitTotal"'));
console.log('badge simplified:', r.includes("'✅ 済'"));
