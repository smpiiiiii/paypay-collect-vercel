// お気に入り機能 + テンプレボタン改善 + h-done-btn CSS削除
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. h-done-btn CSS残骸削除
// ============================================
html = html.replace(
  "        .history-card .h-done-btn { width: 30px; height: 30px; border: 2px solid #ddd; border-radius: 50%; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all .2s; flex-shrink: 0 }\r\n        .history-card .h-done-btn:active { transform: scale(.9) }\r\n        .history-card.done .h-done-btn { background: #00b900; border-color: #00b900; color: #fff }\r\n",
  ""
);

// ============================================
// 2. お気に入りCSS追加
// ============================================
html = html.replace(
  "        .history-card .h-del-btn:active { opacity: .7; transform: scale(.9) }",
  "        .history-card .h-del-btn:active { opacity: .7; transform: scale(.9) }\n        .history-card .h-fav-btn { width: 28px; height: 28px; border: none; border-radius: 8px; background: #fff8e1; color: #ffc107; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .2s }\n        .history-card .h-fav-btn:active { transform: scale(.9) }\n        .history-card .h-fav-btn.active { background: #ffc107; color: #fff }\n        .history-card.favorited { border-color: #ffc107; box-shadow: 0 1px 4px rgba(255,193,7,.2) }"
);

// ============================================
// 3. お気に入り管理JS追加(getHistory後に)
// ============================================
html = html.replace(
  "    function addToHistory(id, name, tiers) {",
  `    // お気に入り管理
    function getFavorites() {
        try { return JSON.parse(localStorage.getItem('collect_favorites') || '[]'); } catch(e) { return []; }
    }
    function toggleFavorite(id) {
        var favs = getFavorites();
        var idx = favs.indexOf(id);
        if (idx >= 0) favs.splice(idx, 1);
        else favs.push(id);
        try { localStorage.setItem('collect_favorites', JSON.stringify(favs)); } catch(e) {}
        renderHistory();
    }
    function isFavorite(id) { return getFavorites().indexOf(id) >= 0; }

    function addToHistory(id, name, tiers) {`
);

// ============================================
// 4. renderHistory: お気に入り優先ソート + ⭐ボタン追加 + 📋を分かりやすく
// ============================================
// ソート順: お気に入り→未完了→済
html = html.replace(
  "        var sorted = history.slice().sort(function(a, b) {\r\n            if (!!a.done === !!b.done) return 0;\r\n            return a.done ? 1 : -1;\r\n        });",
  "        var favs = getFavorites();\n        var sorted = history.slice().sort(function(a, b) {\n            var aFav = favs.indexOf(a.id) >= 0 ? 1 : 0;\n            var bFav = favs.indexOf(b.id) >= 0 ? 1 : 0;\n            if (aFav !== bFav) return bFav - aFav;\n            if (!!a.done === !!b.done) return 0;\n            return a.done ? 1 : -1;\n        });"
);

// card生成後にお気に入りクラス追加
html = html.replace(
  "            card.className = 'history-card' + (h.done ? ' done' : '');",
  "            var isFav = favs.indexOf(h.id) >= 0;\n            card.className = 'history-card' + (h.done ? ' done' : '') + (isFav ? ' favorited' : '');"
);

// actionsDiv内に⭐ボタンを追加（delBtnの前に）
html = html.replace(
  "            // アクション部分\r\n            var actionsDiv = document.createElement('div');\r\n            actionsDiv.className = 'h-actions';\r\n            actionsDiv.appendChild(delBtn);",
  `            // アクション部分
            var actionsDiv = document.createElement('div');
            actionsDiv.className = 'h-actions';
            // お気に入りボタン
            var favBtn = document.createElement('button');
            favBtn.className = 'h-fav-btn' + (isFav ? ' active' : '');
            favBtn.textContent = isFav ? '★' : '☆';
            favBtn.title = isFav ? 'お気に入り解除' : 'お気に入り登録';
            (function(hid) { favBtn.addEventListener('click', function(e) { e.stopPropagation(); toggleFavorite(hid); }); })(h.id);
            actionsDiv.appendChild(favBtn);
            actionsDiv.appendChild(delBtn);`
);

// テンプレボタンをより分かりやすく
html = html.replace(
  "tplBtn.textContent = '\\uD83D\\uDCCB';",
  "tplBtn.textContent = '📋 複製';"
);
html = html.replace(
  "tplBtn.title = 'この設定で新規作成';",
  "tplBtn.title = 'この設定で新規集金を作成';"
);

fs.writeFileSync('public/index.html', html, 'utf8');

// 構文チェック
const result = fs.readFileSync('public/index.html', 'utf8');
const scripts = result.match(/<script>([\s\S]*?)<\/script>/g);
let allOk = true;
scripts.forEach((s, i) => {
  const code = s.replace(/<\/?script>/g, '');
  try { new Function(code); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERROR: ' + e.message); allOk = false; }
});

const checks = [
  ['h-done-btn CSS削除', !result.includes('h-done-btn')],
  ['お気に入りCSS', result.includes('h-fav-btn')],
  ['toggleFavorite関数', result.includes('function toggleFavorite')],
  ['お気に入りソート', result.includes('bFav - aFav')],
  ['⭐ボタン', result.includes('h-fav-btn')],
  ['複製ボタン改善', result.includes("📋 複製")],
  ['構文OK', allOk],
];
console.log('\n=== チェック ===');
checks.forEach(([n, ok]) => console.log(`${ok ? '✅' : '❌'} ${n}`));
