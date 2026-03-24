// 1. 作成ページに幹事説明を追加
// 2. 最近の集金の□ボタンを分かりやすく改善
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. 作成フォーム内に幹事の説明を追加
// ============================================
// "✅ 作成する" ボタンの前に説明文を入れる
html = html.replace(
  '<button class="btn btn-red" id="createBtn">✅ 作成する</button>',
  '<div style="font-size:11px;color:#666;background:#f0f4ff;border-radius:8px;padding:8px 12px;margin-bottom:10px;line-height:1.5">💡 <b>企画者＝幹事</b>です。作成した端末から<b>幹事モード</b>で支払い確認・メンバー管理ができます。</div>\n            <button class="btn btn-red" id="createBtn">✅ 作成する</button>'
);

// ============================================
// 2. 最近の集金の□ボタンを分かりやすく改善
// ============================================
// 済チェックボタンを削除して、代わりに済状態をアイコンに統合
// □は分かりにくいので削除し、h-iconのクリックで済トグルにする

// doneBtn生成部分を削除し、iconクリックで済トグルに
html = html.replace(
  `            // 済チェックボタン
            var doneBtn = document.createElement('button');
            doneBtn.className = 'h-done-btn';
            doneBtn.textContent = h.done ? '✓' : '';
            doneBtn.title = h.done ? '済を解除' : '済にする';
            (function(hid) {
                doneBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleHistoryDone(hid);
                });
            })(h.id);`,
  `            // 済チェック: アイコンのクリックで済トグル`
);

// iconにクリックイベントを追加
html = html.replace(
  "icon.className = 'h-icon'; icon.textContent = h.done ? '✅' : '💰';",
  "icon.className = 'h-icon'; icon.textContent = h.done ? '✅' : '💰';\n            icon.style.cursor = 'pointer'; icon.title = h.done ? 'タップで済を解除' : 'タップで済にする';\n            (function(hid) {\n                icon.addEventListener('click', function(e) {\n                    e.stopPropagation();\n                    toggleHistoryDone(hid);\n                });\n            })(h.id);"
);

// card.appendChild(doneBtn); を削除
html = html.replace(
  "            card.appendChild(doneBtn);\n            card.appendChild(icon);",
  "            card.appendChild(icon);"
);

fs.writeFileSync('public/index.html', html, 'utf8');

// 検証
const result = fs.readFileSync('public/index.html', 'utf8');
console.log('✅ 幹事説明:', result.includes('企画者＝幹事'));
console.log('✅ doneBtn削除:', !result.includes("doneBtn.className = 'h-done-btn'"));
console.log('✅ iconクリック:', result.includes('タップで済を解除'));
console.log('✅ 作成ボタン保持:', result.includes('id="createBtn"'));
