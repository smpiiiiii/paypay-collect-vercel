// ============================================
// 最終版: d854eeeからの全修正一括適用 (v5)
// 前回の問題: doneBtn削除のIIFE残骸, 区分変更復元でcreateBtn破壊, members変数名, 説明文文字化け
// 全て解決済み
// ============================================
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// A. URLコピーボタン削除 → LINE共有のみ（長押しでコピー）
// ============================================
html = html.replace(
  '<button class="btn btn-green" id="shareBtn">📤 LINE共有</button>\n            <button class="btn btn-outline" id="copyUrlBtn">📋 URLコピー</button>',
  '<button class="btn btn-green" id="shareBtn">📤 LINE共有</button>'
);
html = html.replace(
  '<button class="btn btn-remind" id="remindBtn">📣 LINE催促</button>\n            <button class="btn btn-outline" id="remindCopyBtn" style="margin-top:6px;font-size:12px;padding:8px">📋 催促文をコピー</button>',
  '<button class="btn btn-remind" id="remindBtn">📣 LINEで催促する</button>'
);
html = html.replace(
  '<div style="display:flex;gap:6px"><button class="btn btn-remind" id="remindBtnAll" style="font-size:12px;padding:10px;flex:1">📣 LINE催促</button><button class="btn btn-outline" id="remindCopyAll" style="font-size:12px;padding:10px;flex:1">📋 催促文コピー</button></div>',
  '<button class="btn btn-remind" id="remindBtnAll" style="font-size:12px;padding:10px">📣 未払いの人にLINEで催促</button>'
);
html = html.replace(/\n    \/\/ URLコピーボタン\n    document\.getElementById\('copyUrlBtn'\)\.addEventListener[\s\S]*?\n    \}\);\n/, '\n');
html = html.replace(/\n    \/\/ 催促文コピーボタン（詳細カード内）\n    document\.getElementById\('remindCopyBtn'\)\.addEventListener[\s\S]*?\n    \}\);\n/, '\n');
html = html.replace(/\n    \/\/ 催促文コピーボタン（メイン画面）\n    document\.getElementById\('remindCopyAll'\)\.addEventListener[\s\S]*?\n    \}\);\n/, '\n');

// ============================================
// B. 長押しヒントCSS（共有ボタンのみ）
// ============================================
html = html.replace(
  '.share-btns .btn { flex: 1; font-size: 12px; padding: 10px }',
  '.share-btns .btn { flex: 1; font-size: 12px; padding: 10px }\n        #shareBtn::after, #remindBtn::after, #remindBtnAll::after { content: "長押しでコピー"; display: block; font-size: 9px; opacity: 0.6; margin-top: 2px }'
);

// ============================================
// C. h-done-btn CSS削除 + お気に入りCSS追加
// ============================================
html = html.replace(
  "        .history-card .h-done-btn { width: 30px; height: 30px; border: 2px solid #ddd; border-radius: 50%; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all .2s; flex-shrink: 0 }\r\n        .history-card .h-done-btn:active { transform: scale(.9) }\r\n        .history-card.done .h-done-btn { background: #00b900; border-color: #00b900; color: #fff }\r\n",
  ""
);
html = html.replace(
  "        .history-card .h-del-btn:active { opacity: .7; transform: scale(.9) }",
  "        .history-card .h-del-btn:active { opacity: .7; transform: scale(.9) }\n        .history-card .h-fav-btn { width: 28px; height: 28px; border: none; border-radius: 8px; background: #fff8e1; color: #ffc107; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .2s }\n        .history-card .h-fav-btn:active { transform: scale(.9) }\n        .history-card .h-fav-btn.active { background: #ffc107; color: #fff }\n        .history-card.favorited { border-color: #ffc107; box-shadow: 0 1px 4px rgba(255,193,7,.2) }"
);

// ============================================
// D. 完了ボタンHTML
// ============================================
html = html.replace(
  '<div id="remindBtnSimple" class="hidden" style="margin-top:6px">',
  '<div id="completeBtnDiv" class="hidden" style="margin-top:6px;text-align:center"><button class="btn btn-green" id="completeBtn" style="font-size:14px;padding:12px">\uD83C\uDF89 集金完了！</button></div>\n        <div id="remindBtnSimple" class="hidden" style="margin-top:6px">'
);

// ============================================
// E. 幹事説明テキスト
// ============================================
html = html.replace(
  '<button class="btn btn-red" id="createBtn">✅ 作成する</button>',
  '<div style="font-size:11px;color:#666;background:#f0f4ff;border-radius:8px;padding:8px 12px;margin-bottom:10px;line-height:1.5">\uD83D\uDCA1 <b>企画者＝幹事</b>です。作成した端末から<b>幹事モード</b>で支払い確認・メンバー管理ができます。</div>\n            <button class="btn btn-red" id="createBtn">✅ 作成する</button>'
);
html = html.replace(
  '<div class="admin-toggle" id="adminToggle">🔐 幹事モード</div>',
  '<div class="admin-toggle" id="adminToggle">🔐 幹事モード</div>\n        <div id="adminHelpText" style="font-size:10px;color:#bbb;text-align:center;margin-top:4px;line-height:1.4">\uD83D\uDCA1 企画者＝幹事です。幹事モードで支払い確認・メンバー管理ができます</div>'
);
html = html.replace(
  "document.getElementById('adminToggle').style.display = adminToken ? '' : 'none';",
  "document.getElementById('adminToggle').style.display = adminToken ? '' : 'none';\n            document.getElementById('adminHelpText').style.display = adminToken ? '' : 'none';"
);

// ============================================
// F. 長押しヘルパー関数
// ============================================
html = html.replace('    // ===== 更新・共有 =====',
  `    // ===== 長押しでコピー機能 =====
    function addLongPress(btnId, getTextFn) {
        var btn = document.getElementById(btnId);
        if (!btn) return;
        var timer = null;
        var longPressed = false;
        function onStart(e) {
            longPressed = false;
            timer = setTimeout(function() {
                longPressed = true;
                var text = getTextFn();
                if (!text) return;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(function() {
                        var orig = btn.textContent;
                        btn.textContent = '\\u2705 コピー済み';
                        setTimeout(function() { btn.textContent = orig; }, 2000);
                    });
                } else {
                    var ta = document.createElement('textarea');
                    ta.value = text; document.body.appendChild(ta);
                    ta.select(); document.execCommand('copy');
                    document.body.removeChild(ta);
                    var orig = btn.textContent;
                    btn.textContent = '\\u2705 コピー済み';
                    setTimeout(function() { btn.textContent = orig; }, 2000);
                }
            }, 600);
        }
        function onEnd(e) {
            clearTimeout(timer);
            if (longPressed) { e.preventDefault(); e.stopPropagation(); }
        }
        btn.addEventListener('touchstart', onStart, { passive: true });
        btn.addEventListener('touchend', onEnd);
        btn.addEventListener('touchcancel', function() { clearTimeout(timer); });
        btn.addEventListener('mousedown', onStart);
        btn.addEventListener('mouseup', onEnd);
        btn.addEventListener('mouseleave', function() { clearTimeout(timer); });
    }

    // ===== 更新・共有 =====`
);

// 長押し登録
html = html.replace('\n\n    // ===== 未払い催促機能 =====',
  "\n\n    addLongPress('shareBtn', function() {\n        var refName = myName ? encodeURIComponent(myName) : '';\n        var url = location.origin + '/collect/' + eventId + (refName ? '?ref=' + refName : '');\n        var evName = eventData ? (eventData.name || '\\u96C6\\u91D1') : '\\u96C6\\u91D1';\n        return '\\uD83D\\uDCB0 ' + evName + '\\\\n\\\\n\\uD83D\\uDC47 \\u53C2\\u52A0\\u30FB\\u652F\\u6255\\u3044\\u5831\\u544A\\u306F\\u3053\\u3061\\u3089\\\\n' + url;\n    });\n    addLongPress('remindBtn', function() { return buildRemindMessage(); });\n    addLongPress('remindBtnAll', function() { return buildRemindMessage(); });\n\n    // ===== 未払い催促機能 ====="
);

// ============================================
// G. 済バッジ長押し
// ============================================
html = html.replace(
  "        actionsDiv.appendChild(badge);",
  `        actionsDiv.appendChild(badge);
        if (m.paid) {
            (function(member, badgeEl) {
                var timer = null;
                function showInfo() {
                    var info = [];
                    if (member.paidAt) info.push('\\uD83D\\uDCB0 支払日時: ' + new Date(member.paidAt).toLocaleString('ja-JP'));
                    if (member.selfReported) info.push('\\uD83D\\uDCDD 本人が自己申告');
                    if (member.actionBy) info.push('\\uD83D\\uDC64 操作者: ' + member.actionBy);
                    if (member.confirmed) info.push('\\u2705 幹事が確認済み');
                    if (info.length === 0) info.push('支払い済み');
                    alert(member.name + ' の支払い情報\\n\\n' + info.join('\\n'));
                }
                function onStart(e) { timer = setTimeout(function() { timer = 'done'; showInfo(); }, 600); }
                function onEnd(e) { if (timer === 'done') { e.preventDefault(); e.stopPropagation(); } else clearTimeout(timer); timer = null; }
                badgeEl.style.cursor = 'pointer';
                badgeEl.addEventListener('touchstart', onStart, { passive: true });
                badgeEl.addEventListener('touchend', onEnd);
                badgeEl.addEventListener('touchcancel', function() { clearTimeout(timer); timer = null; });
                badgeEl.addEventListener('mousedown', onStart);
                badgeEl.addEventListener('mouseup', onEnd);
                badgeEl.addEventListener('mouseleave', function() { clearTimeout(timer); timer = null; });
            })(m, badge);
        }`
);

// ============================================
// H. テンプレート + お気に入り + 履歴UI改善
// ============================================
html = html.replace("function addToHistory(id, name) {", "function addToHistory(id, name, tiers) {");
html = html.replace(
  "history.unshift({ id: id, name: name, date: new Date().toISOString(), done: done });",
  "history.unshift({ id: id, name: name, date: new Date().toISOString(), done: done, tiers: tiers || (existing ? existing.tiers : null) });"
);
html = html.replace("addToHistory(data.id, name);", "addToHistory(data.id, name, tiers);");
html = html.replace(
  "if (eventData && eventData.name) addToHistory(eventId, eventData.name);",
  "if (eventData && eventData.name) addToHistory(eventId, eventData.name, eventData.priceTiers || null);"
);

// joinBtnにadminToken送信
html = html.replace(
  "xhr.send(JSON.stringify({ name: name, tier: tier, addedBy: addedByName }));",
  "xhr.send(JSON.stringify({ name: name, tier: tier, addedBy: addedByName, adminToken: adminToken }));"
);

// お気に入り + applyTemplate 関数追加
html = html.replace("    function renderHistory() {",
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

    function applyTemplate(hist) {
        var nameInput = document.getElementById('cName');
        if (nameInput) nameInput.value = hist.name;
        var container = document.getElementById('tierRows');
        while (container.firstChild) container.removeChild(container.firstChild);
        if (hist.tiers && hist.tiers.length > 0) {
            for (var i = 0; i < hist.tiers.length; i++) {
                addTierRow(hist.tiers[i].label || '', hist.tiers[i].amount || '', hist.tiers[i].paypayLink || '');
            }
        } else { addTierRow('\\u7537\\u5B50', '', ''); addTierRow('\\u5973\\u5B50', '', ''); }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (nameInput) { nameInput.style.transition = 'background 0.3s'; nameInput.style.background = '#e8f5e9'; setTimeout(function() { nameInput.style.background = ''; }, 1500); }
    }

    function renderHistory() {`
);

// ソート: お気に入り優先
html = html.replace(
  "        var sorted = history.slice().sort(function(a, b) {\r\n            if (!!a.done === !!b.done) return 0;\r\n            return a.done ? 1 : -1;\r\n        });",
  "        var favs = getFavorites();\n        var sorted = history.slice().sort(function(a, b) {\n            var aFav = favs.indexOf(a.id) >= 0 ? 1 : 0;\n            var bFav = favs.indexOf(b.id) >= 0 ? 1 : 0;\n            if (aFav !== bFav) return bFav - aFav;\n            if (!!a.done === !!b.done) return 0;\n            return a.done ? 1 : -1;\n        });"
);

// card: お気に入りクラス追加
html = html.replace(
  "            card.className = 'history-card' + (h.done ? ' done' : '');",
  "            var isFav = favs.indexOf(h.id) >= 0;\n            card.className = 'history-card' + (h.done ? ' done' : '') + (isFav ? ' favorited' : '');"
);

// doneBtn全体を削除、iconにクリックイベント追加
let lines = html.split('\n');
let newLines = [];
let inDoneBtnBlock = false;
let skipIIFE = false;
let iifeBraces = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes("var doneBtn = document.createElement('button')")) { inDoneBtnBlock = true; continue; }
  if (inDoneBtnBlock && (line.includes("doneBtn.className") || line.includes("doneBtn.textContent") || line.includes("doneBtn.title"))) continue;
  if (inDoneBtnBlock && line.includes("(function(hid) {")) {
    skipIIFE = true; iifeBraces = 0;
    for (const c of line) { if (c === '{') iifeBraces++; if (c === '}') iifeBraces--; }
    inDoneBtnBlock = false; continue;
  }
  if (skipIIFE) {
    for (const c of line) { if (c === '{') iifeBraces++; if (c === '}') iifeBraces--; }
    if (line.includes('})(h.id)')) { skipIIFE = false; } continue;
  }
  if (line.includes("card.appendChild(doneBtn)")) continue;
  newLines.push(line);
}
html = newLines.join('\n');

// iconにクリックで済トグル
html = html.replace(
  "icon.className = 'h-icon'; icon.textContent = h.done ? '✅' : '💰';",
  "icon.className = 'h-icon'; icon.textContent = h.done ? '\\u2705' : '\\uD83D\\uDCB0';\n            icon.style.cursor = 'pointer'; icon.title = h.done ? 'タップで済を解除' : 'タップで済にする';\n            (function(hid) { icon.addEventListener('click', function(e) { e.stopPropagation(); toggleHistoryDone(hid); }); })(h.id);"
);

// actionsDiv内: ⭐お気に入りボタン + 🗑削除ボタン + 📋複製ボタン
html = html.replace(
  "            // アクション部分\r\n            var actionsDiv = document.createElement('div');\r\n            actionsDiv.className = 'h-actions';\r\n            actionsDiv.appendChild(delBtn);\r\n            card.appendChild(icon);",
  `            // アクション部分
            var actionsDiv = document.createElement('div');
            actionsDiv.className = 'h-actions';
            var favBtn = document.createElement('button');
            favBtn.className = 'h-fav-btn' + (isFav ? ' active' : '');
            favBtn.textContent = isFav ? '\\u2605' : '\\u2606';
            favBtn.title = isFav ? 'お気に入り解除' : 'お気に入り登録';
            (function(hid) { favBtn.addEventListener('click', function(e) { e.stopPropagation(); toggleFavorite(hid); }); })(h.id);
            actionsDiv.appendChild(favBtn);
            actionsDiv.appendChild(delBtn);
            if (h.tiers && h.tiers.length > 0) {
                var tplBtn = document.createElement('button');
                tplBtn.className = 'h-del-btn';
                tplBtn.style.cssText = 'background:#e3f2fd;font-size:11px;width:auto;padding:0 8px;border-radius:8px;color:#1976d2';
                tplBtn.textContent = '\\uD83D\\uDCCB 複製';
                tplBtn.title = 'この設定で新規集金を作成';
                (function(hist) { tplBtn.addEventListener('click', function(e) { e.stopPropagation(); applyTemplate(hist); }); })(h);
                actionsDiv.appendChild(tplBtn);
            }
            card.appendChild(icon);`
);

// 区分情報表示
html = html.replace(
  "            if (h.done) {\r\n                var doneBadge",
  "            if (h.tiers && h.tiers.length > 0) {\n                var tierSpan = document.createElement('span');\n                tierSpan.style.cssText = 'display:block;font-size:9px;color:#666;margin-top:1px';\n                tierSpan.textContent = h.tiers.map(function(t) { return t.label + ' \\u00A5' + (t.amount || 0).toLocaleString(); }).join(' / ');\n                meta.appendChild(tierSpan);\n            }\r\n            if (h.done) {\r\n                var doneBadge"
);

// ============================================
// I. 完了ボタンJS + 完了ボタン表示制御
// ============================================
html = html.replace(
  "    // ===== 幹事モード =====",
  `    // 完了ボタン
    document.getElementById('completeBtn').addEventListener('click', function() {
        var total = 0;
        var ms = eventData ? (eventData.members || []) : [];
        for (var i = 0; i < ms.length; i++) total += (ms[i].amount || 0);
        alert('\\uD83C\\uDF89 集金完了！\\n\\n参加者: ' + ms.length + '人\\n合計: \\u00A5' + total.toLocaleString() + '\\n\\nお疲れ様でした！');
        toggleHistoryDone(eventId);
        if (confirm('トップ画面に戻りますか？')) { location.href = '/'; }
    });

    // ===== 幹事モード =====`
);

// 完了ボタン表示制御（renderEvent内 remindBtnSimple後）
html = html.replace(
  "remindBtnSimple.classList.toggle('hidden', unpaidMembers.length === 0);",
  "remindBtnSimple.classList.toggle('hidden', unpaidMembers.length === 0);\n\n        var completeBtnDiv = document.getElementById('completeBtnDiv');\n        if (completeBtnDiv) {\n            var allPaid = membersAll.length > 0 && unpaidMembers.length === 0;\n            completeBtnDiv.classList.toggle('hidden', !(isAdmin && allPaid));\n        }"
);

fs.writeFileSync('public/index.html', html, 'utf8');

// ============================================
// 構文チェック + 機能チェック
// ============================================
const result = fs.readFileSync('public/index.html', 'utf8');
const scripts = result.match(/<script>([\s\S]*?)<\/script>/g);
let syntaxOk = true;
scripts.forEach((s, i) => {
  const code = s.replace(/<\/?script>/g, '');
  try { new Function(code); console.log('Script ' + i + ': ✅ OK (' + code.length + ')'); }
  catch(e) { console.log('Script ' + i + ': ❌ ' + e.message); syntaxOk = false; }
});

const checks = [
  ['構文', syntaxOk],
  ['LINE共有', result.includes('id="shareBtn"')],
  ['URLコピー削除', !result.includes('id="copyUrlBtn"')],
  ['長押し共有のみ', result.includes('#shareBtn::after')],
  ['済バッジ長押し', result.includes('支払い情報')],
  ['テンプレ', result.includes('applyTemplate')],
  ['お気に入り', result.includes('toggleFavorite')],
  ['doneBtn削除', !result.includes("doneBtn.className")],
  ['icon済トグル', result.includes('toggleHistoryDone(hid)')],
  ['幹事説明', result.includes('adminHelpText')],
  ['完了ボタン', result.includes('completeBtn')],
  ['トップ遷移', result.includes("トップ画面に戻りますか")],
  ['membersAll', result.includes('membersAll.length > 0')],
  ['adminToken送信', result.includes('adminToken: adminToken })')],
  ['createBtn保持', result.includes("getElementById('createBtn')")],
  ['joinBtn保持', result.includes("getElementById('joinBtn')")],
];
console.log('\n=== 全チェック ===');
let allOk = true;
checks.forEach(([n, ok]) => { console.log(`${ok ? '✅' : '❌'} ${n}`); if (!ok) allOk = false; });
console.log(allOk ? '\n🎉 ALL OK!' : '\n⚠️ FAILED');
