// 5点修正を一括適用
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 修正1: 説明文の文字化け修正（\uD83D\uDCA1 → 💡に）
// ============================================
html = html.replace(
  '\\uD83D\\uDCA1 <b>企画者＝幹事</b>',
  '💡 <b>企画者＝幹事</b>'
);
html = html.replace(
  '\\uD83D\\uDCA1 企画者＝幹事',
  '💡 企画者＝幹事'
);

// ============================================
// 修正2: 長押しコピーのヒントを共有ボタンのみに限定
// ============================================
// 現在: .btn-green::after, .btn-remind::after → これは参加ボタンにもかかる
// 修正: #shareBtn::after, #remindBtn::after, #remindBtnAll::after のみに
html = html.replace(
  '.btn-green::after, .btn-remind::after { content: "長押しでコピー"; display: block; font-size: 9px; opacity: 0.6; margin-top: 2px }',
  '#shareBtn::after, #remindBtn::after, #remindBtnAll::after { content: "長押しでコピー"; display: block; font-size: 9px; opacity: 0.6; margin-top: 2px }'
);

// ============================================
// 修正3: 区分変更ボタンを復元
// ============================================
// c05e6e6の元コードを参考に復元。削除コメントを探して元に戻す
// 現在 "// 区分変更ボタン: 削除済み" のコメントがあるはず（もしなければ別で対応）
// fix_all_v2.jsで区分変更ボタンのコード行自体を削除した
// canDeleteの直後に区分変更ボタンコードを追加

// 削除ボタンのappendChild後に区分変更ボタンを追加
// actionsDiv.appendChild(delBtn); の後を探す（createPersonDiv内）
html = html.replace(
  "            actionsDiv.appendChild(delBtn);\r\n        }",
  `            actionsDiv.appendChild(delBtn);

            // 区分変更ボタン
            var tiersForChange = getTiers();
            if (tiersForChange.length >= 2) {
                var changeBtn = document.createElement('button');
                changeBtn.className = 'btn-sm';
                changeBtn.textContent = '🔄';
                changeBtn.title = m.name + 'の区分を変更';
                changeBtn.style.cssText = 'margin-left:4px;background:#5c6bc0;color:#fff;border:none;border-radius:6px;padding:2px 8px;font-size:12px;cursor:pointer';
                (function(memberName, currentTier) {
                    changeBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        changeTier(memberName, currentTier);
                    });
                })(m.name, m.tier);
                actionsDiv.appendChild(changeBtn);
            }
        }`
);

// ============================================
// 修正4: 幹事は最初から支払い済み（API側で対応）
// ============================================
// API: /api/join で、イベント作成者（adminToken保持者）が参加した場合、自動的にpaid=trueにする
// → フロント側: joinBtn送信時にadminTokenも一緒に送る
html = html.replace(
  "xhr.send(JSON.stringify({ name: name, tier: tier, addedBy: addedByName }));",
  "xhr.send(JSON.stringify({ name: name, tier: tier, addedBy: addedByName, adminToken: adminToken }));"
);

// ============================================
// 修正5: 全員支払い済みで「完了」ボタン（幹事モード）
// ============================================
// renderEvent内でメンバー全員が支払い済みかチェックし、完了ボタンを表示
// remindBtnSimple の非表示/表示制御の近くに追加

// HTML: 完了ボタンのdivを追加
html = html.replace(
  '<div id="remindBtnSimple" class="hidden" style="margin-top:6px">',
  '<div id="completeBtnDiv" class="hidden" style="margin-top:6px;text-align:center"><button class="btn btn-green" id="completeBtn" style="font-size:14px;padding:12px">🎉 集金完了！</button></div>\n        <div id="remindBtnSimple" class="hidden" style="margin-top:6px">'
);

// JS: 完了ボタンの表示制御（renderEvent内） + クリックイベント
// remindBtnSimple.classList.toggle の近くに追加
html = html.replace(
  "remindBtnSimple.classList.toggle('hidden', unpaidMembers.length === 0);",
  "remindBtnSimple.classList.toggle('hidden', unpaidMembers.length === 0);\n\n        // 全員支払い済みなら完了ボタン表示（幹事のみ）\n        var completeBtnDiv = document.getElementById('completeBtnDiv');\n        if (completeBtnDiv) {\n            var allPaid = members.length > 0 && unpaidMembers.length === 0;\n            completeBtnDiv.classList.toggle('hidden', !(isAdmin && allPaid));\n        }"
);

// 完了ボタンのクリックイベント
html = html.replace(
  "    // ===== 幹事モード =====",
  "    // 完了ボタン\n    document.getElementById('completeBtn').addEventListener('click', function() {\n        var total = 0;\n        var members = eventData ? (eventData.members || []) : [];\n        for (var i = 0; i < members.length; i++) total += (members[i].amount || 0);\n        alert('🎉 集金完了！\\n\\n参加者: ' + members.length + '人\\n合計: ¥' + total.toLocaleString() + '\\n\\nお疲れ様でした！');\n        // 履歴を済にする\n        toggleHistoryDone(eventId);\n    });\n\n    // ===== 幹事モード ====="
);

fs.writeFileSync('public/index.html', html, 'utf8');

// 構文チェック
const result = fs.readFileSync('public/index.html', 'utf8');
const scripts = result.match(/<script>([\s\S]*?)<\/script>/g);
let allOk = true;
scripts.forEach((s, i) => {
  const code = s.replace(/<\/?script>/g, '');
  try { new Function(code); console.log('Script ' + i + ': ✅ OK'); }
  catch(e) { console.log('Script ' + i + ': ❌ ' + e.message); allOk = false; }
});

const checks = [
  ['説明文修正', result.includes('💡 <b>企画者＝幹事</b>')],
  ['長押しヒント限定', result.includes('#shareBtn::after')],
  ['区分変更復元', result.includes('tiersForChange')],
  ['幹事adminToken送信', result.includes('adminToken: adminToken })')],
  ['完了ボタンHTML', result.includes('id="completeBtn"')],
  ['完了ボタンJS', result.includes('集金完了')],
  ['構文OK', allOk],
];
console.log('\n=== チェック ===');
checks.forEach(([n, ok]) => console.log(`${ok ? '✅' : '❌'} ${n}`));
