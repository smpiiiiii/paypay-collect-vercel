// ============================================
// 最終安定版: d854eeeから全修正一括適用
// 含む機能:
// A. URLコピーボタン削除→長押しでコピー
// B. 長押しヒントCSS
// C. お気に入りCSS + doneBtn CSS削除  
// D. 完了ボタンHTML
// E. 幹事説明テキスト
// F. 長押しヘルパー関数
// G. 済バッジ長押し
// H. テンプレ+お気に入り+履歴UI
// I. 完了ボタンJS+表示制御
// J. stats(人数・金額)表示
// K. 金額タイプ(金額指定 or 割り勘/未定)
// L. PayPayリンク欄を作成ページから削除
// M. 割り勘連動スライダー
// ============================================
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// A. URLコピーボタン削除
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
// B. 長押しヒントCSS
// ============================================
html = html.replace(
  '.share-btns .btn { flex: 1; font-size: 12px; padding: 10px }',
  '.share-btns .btn { flex: 1; font-size: 12px; padding: 10px }\n        #shareBtn::after, #remindBtn::after, #remindBtnAll::after { content: "長押しでコピー"; display: block; font-size: 9px; opacity: 0.6; margin-top: 2px }'
);

// ============================================
// C. doneBtn CSS削除 + お気に入りCSS + 割り勘UI CSS
// ============================================
html = html.replace(
  "        .history-card .h-done-btn { width: 30px; height: 30px; border: 2px solid #ddd; border-radius: 50%; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all .2s; flex-shrink: 0 }\r\n        .history-card .h-done-btn:active { transform: scale(.9) }\r\n        .history-card.done .h-done-btn { background: #00b900; border-color: #00b900; color: #fff }\r\n",
  ""
);
html = html.replace(
  "        .history-card .h-del-btn:active { opacity: .7; transform: scale(.9) }",
  `        .history-card .h-del-btn:active { opacity: .7; transform: scale(.9) }
        .history-card .h-fav-btn { width: 28px; height: 28px; border: none; border-radius: 8px; background: #fff8e1; color: #ffc107; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .2s }
        .history-card .h-fav-btn:active { transform: scale(.9) }
        .history-card .h-fav-btn.active { background: #ffc107; color: #fff }
        .history-card.favorited { border-color: #ffc107; box-shadow: 0 1px 4px rgba(255,193,7,.2) }
        #splitCalcUI { background: #1a2332; border: 1px solid #2a3f5f; border-radius: 12px; padding: 14px; margin: 10px 0; display: none }
        #splitCalcUI .split-header { font-size: 13px; font-weight: bold; color: #64b5f6; margin-bottom: 10px }
        #splitCalcUI .split-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 12px; color: #ccc }
        #splitCalcUI .split-row label { min-width: 50px }
        #splitCalcUI .split-row input[type=range] { flex: 1 }
        #splitCalcUI .split-row .split-val { min-width: 70px; text-align: right; font-weight: bold; color: #fff }`
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
// H. テンプレート + お気に入り + 履歴UI
// ============================================
html = html.replace("function addToHistory(id, name) {", "function addToHistory(id, name, tiers, stats) {");
html = html.replace(
  "history.unshift({ id: id, name: name, date: new Date().toISOString(), done: done });",
  "history.unshift({ id: id, name: name, date: new Date().toISOString(), done: done, tiers: tiers || (existing ? existing.tiers : null), stats: stats || (existing ? existing.stats : null) });"
);
html = html.replace("addToHistory(data.id, name);", "addToHistory(data.id, name, tiers, null);");
html = html.replace(
  "if (eventData && eventData.name) addToHistory(eventId, eventData.name);",
  `if (eventData && eventData.name) {
                    var ms = eventData.members || [];
                    var st = { total: ms.length, paid: 0, totalAmt: 0, paidAmt: 0, tierCounts: {} };
                    for (var si = 0; si < ms.length; si++) {
                        var sm = ms[si];
                        st.totalAmt += (sm.amount || 0);
                        if (sm.paid) { st.paid++; st.paidAmt += (sm.amount || 0); }
                        var tk = sm.tier || '一般';
                        if (!st.tierCounts[tk]) st.tierCounts[tk] = { count: 0, paid: 0 };
                        st.tierCounts[tk].count++;
                        if (sm.paid) st.tierCounts[tk].paid++;
                    }
                    addToHistory(eventId, eventData.name, eventData.priceTiers || null, st);
                }`
);
html = html.replace(
  "xhr.send(JSON.stringify({ name: name, tier: tier, addedBy: addedByName }));",
  "xhr.send(JSON.stringify({ name: name, tier: tier, addedBy: addedByName, adminToken: adminToken }));"
);

// お気に入り + applyTemplate
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
                addTierRow(hist.tiers[i].label || '', hist.tiers[i].amount || '', hist.tiers[i].amountType || 'fixed');
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
html = html.replace(
  "            card.className = 'history-card' + (h.done ? ' done' : '');",
  "            var isFav = favs.indexOf(h.id) >= 0;\n            card.className = 'history-card' + (h.done ? ' done' : '') + (isFav ? ' favorited' : '');"
);

// doneBtn全体を削除
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

// iconクリックで済トグル
html = html.replace(
  "icon.className = 'h-icon'; icon.textContent = h.done ? '✅' : '💰';",
  "icon.className = 'h-icon'; icon.textContent = h.done ? '\\u2705' : '\\uD83D\\uDCB0';\n            icon.style.cursor = 'pointer'; icon.title = h.done ? 'タップで済を解除' : 'タップで済にする';\n            (function(hid) { icon.addEventListener('click', function(e) { e.stopPropagation(); toggleHistoryDone(hid); }); })(h.id);"
);

// actionsDiv: ⭐お気に入り + 🗑削除 + 📋複製
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

// J. stats表示
html = html.replace(
  "            if (h.done) {\r\n                var doneBadge",
  `            if (h.stats && h.stats.total > 0) {
                var progressSpan = document.createElement('span');
                progressSpan.style.cssText = 'display:block;font-size:10px;color:#333;margin-top:2px;font-weight:600';
                progressSpan.textContent = '\\u2705 ' + h.stats.paid + '/' + h.stats.total + '人済 (\\u00A5' + h.stats.paidAmt.toLocaleString() + '/' + h.stats.totalAmt.toLocaleString() + ')';
                if (h.stats.paid === h.stats.total) progressSpan.style.color = '#2e7d32';
                meta.appendChild(progressSpan);
                if (h.tiers && h.tiers.length > 1) {
                    var tierDiv = document.createElement('span');
                    tierDiv.style.cssText = 'display:block;font-size:9px;color:#888;margin-top:1px';
                    tierDiv.textContent = h.tiers.map(function(t) {
                        var tc = h.stats.tierCounts && h.stats.tierCounts[t.label];
                        var cnt = tc ? tc.count + '人' : '';
                        var al = (t.amountType === 'tbd') ? '割り勘/未定' : '\\u00A5' + (t.amount || 0).toLocaleString();
                        return t.label + ' ' + al + (cnt ? '(' + cnt + ')' : '');
                    }).join(' / ');
                    meta.appendChild(tierDiv);
                }
            } else if (h.tiers && h.tiers.length > 0) {
                var tierSpan = document.createElement('span');
                tierSpan.style.cssText = 'display:block;font-size:9px;color:#666;margin-top:1px';
                tierSpan.textContent = h.tiers.map(function(t) {
                    var al = (t.amountType === 'tbd') ? '割り勘/未定' : '\\u00A5' + (t.amount || 0).toLocaleString();
                    return t.label + ' ' + al;
                }).join(' / ');
                meta.appendChild(tierSpan);
            }
            if (h.done) {
                var doneBadge`
);

// ============================================
// I. 完了ボタンJS
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
html = html.replace(
  "remindBtnSimple.classList.toggle('hidden', unpaidMembers.length === 0);",
  "remindBtnSimple.classList.toggle('hidden', unpaidMembers.length === 0);\n\n        var completeBtnDiv = document.getElementById('completeBtnDiv');\n        if (completeBtnDiv) {\n            var allPaid = membersAll.length > 0 && unpaidMembers.length === 0;\n            completeBtnDiv.classList.toggle('hidden', !(isAdmin && allPaid));\n        }"
);

// ============================================
// K. 金額タイプ: 金額指定 or 割り勘/未定（統合）
// ============================================
// addTierRow関数の引数変更（PayPayリンク削除）
html = html.replace(
  "function addTierRow(label, amount, paypayLink) {",
  "function addTierRow(label, amount, amountTypeVal) {"
);
// amountInput設定の直後に金額タイプ追加
html = html.replace(
  "amountInput.inputMode = 'numeric'; amountInput.value = amount || '';\r\n        amountInput.max = '9999999';",
  `amountInput.inputMode = 'numeric'; amountInput.value = amount || '';
        amountInput.max = '9999999';
        var amountType = document.createElement('select');
        amountType.className = 'tier-amount-type';
        amountType.style.cssText = 'padding:8px;border-radius:8px;border:1px solid #333;background:#1a1a1a;color:#fff;font-size:11px;min-width:80px';
        amountType.innerHTML = '<option value="fixed">金額指定</option><option value="tbd">割り勘/未定</option>';
        amountType.value = amountTypeVal || 'fixed';
        amountType.addEventListener('change', function() {
            if (amountType.value === 'fixed') {
                amountInput.style.display = ''; amountInput.required = true; amountInput.placeholder = '金額';
            } else {
                amountInput.style.display = 'none'; amountInput.required = false; amountInput.value = '0';
            }
            if (typeof checkSplitMode === 'function') checkSplitMode();
        });
        if (amountTypeVal && amountTypeVal !== 'fixed') {
            amountInput.style.display = 'none'; amountInput.required = false;
        }`
);

// L. PayPayリンク入力を削除、amountType追加
html = html.replace(
  "var paypayInput = document.createElement('input');\r\n        paypayInput.type = 'url'; paypayInput.placeholder = 'PayPayリンク（任意）';\r\n        paypayInput.className = 'tier-paypay'; paypayInput.value = paypayLink || '';\r\n        row.appendChild(labelInput); row.appendChild(amountInput); row.appendChild(del);\r\n        row.appendChild(paypayInput);",
  "row.appendChild(labelInput); row.appendChild(amountType); row.appendChild(amountInput); row.appendChild(del);"
);

// 初期行
html = html.replace(
  "addTierRow('男子', '', ''); addTierRow('女子', '', '');",
  "addTierRow('男子', '', ''); addTierRow('女子', '', '');"
);
html = html.replace(
  "document.getElementById('addTierBtn').addEventListener('click', function() { addTierRow('', '', ''); });",
  "document.getElementById('addTierBtn').addEventListener('click', function() { addTierRow('', '', ''); });"
);

// createBtn: tiersにamountType含む、paypayLink削除
html = html.replace(
  "var tPaypay = rows[i].querySelector('.tier-paypay');",
  "var tAmountType = rows[i].querySelector('.tier-amount-type');"
);
html = html.replace(
  "if (tLabel) tiers.push({ label: tLabel, amount: tAmount, paypayLink: tPaypay ? tPaypay.value : '' });",
  "var tType = tAmountType ? tAmountType.value : 'fixed';\n            if (tLabel) tiers.push({ label: tLabel, amount: tAmount, amountType: tType });"
);

// M. 割り勘スライダーHTML
html = html.replace(
  '<button type="button" class="add-tier-btn" id="addTierBtn">＋ 区分を追加</button>',
  `<div id="splitCalcUI">
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

// 割り勘制御JS
const splitJS = `
    // ===== 割り勘連動スライダー =====
    var splitCalcUI = document.getElementById('splitCalcUI');
    var splitTotalInput = document.getElementById('splitTotal');
    var splitSlidersDiv = document.getElementById('splitSliders');
    var splitResultDiv = document.getElementById('splitResult');

    function checkSplitMode() {
        var types = tierContainer.querySelectorAll('.tier-amount-type');
        var hasSplit = false;
        for (var i = 0; i < types.length; i++) { if (types[i].value === 'tbd') hasSplit = true; }
        splitCalcUI.style.display = hasSplit ? 'block' : 'none';
        if (hasSplit) updateSplitSliders();
    }

    function updateSplitSliders() {
        var rows = tierContainer.querySelectorAll('.tier-row');
        splitSlidersDiv.innerHTML = '';
        var tierNames = [];
        for (var i = 0; i < rows.length; i++) {
            var nameInput = rows[i].querySelector('.tier-name');
            var typeSelect = rows[i].querySelector('.tier-amount-type');
            if (typeSelect && typeSelect.value === 'tbd') {
                tierNames.push({ name: nameInput.value || '区分' + (i+1), row: rows[i], index: i });
            }
        }
        if (tierNames.length < 2) {
            splitResultDiv.textContent = '合計金額を入力すると自動計算します';
            return;
        }
        for (var j = 0; j < tierNames.length; j++) {
            var sr = document.createElement('div');
            sr.className = 'split-row';
            sr.innerHTML = '<label>' + tierNames[j].name + '</label><input type="range" min="0" max="100" value="' + Math.round(100/tierNames.length) + '" data-idx="' + j + '"><span class="split-val">\\u00A50/人</span>';
            splitSlidersDiv.appendChild(sr);
        }
        var sliders = splitSlidersDiv.querySelectorAll('input[type=range]');
        for (var s = 0; s < sliders.length; s++) {
            (function(idx) { sliders[idx].addEventListener('input', function() { recalcSplit(tierNames, idx); }); })(s);
        }
        splitTotalInput.oninput = function() { recalcSplit(tierNames, -1); };
        recalcSplit(tierNames, -1);
    }

    function recalcSplit(tierNames, changedIdx) {
        var total = parseInt(splitTotalInput.value) || 0;
        var sliders = splitSlidersDiv.querySelectorAll('input[type=range]');
        var vals = splitSlidersDiv.querySelectorAll('.split-val');
        if (sliders.length < 2) return;
        if (changedIdx >= 0 && sliders.length === 2) {
            var otherIdx = changedIdx === 0 ? 1 : 0;
            sliders[otherIdx].value = 100 - parseInt(sliders[changedIdx].value);
        }
        var totalParts = 0;
        for (var p = 0; p < sliders.length; p++) totalParts += parseInt(sliders[p].value);
        if (totalParts === 0) totalParts = 1;
        var resultParts = [];
        for (var m = 0; m < sliders.length; m++) {
            var ratio = parseInt(sliders[m].value) / totalParts;
            var perPerson = Math.round(total * ratio);
            vals[m].textContent = '\\u00A5' + perPerson.toLocaleString() + '/人';
            resultParts.push(tierNames[m].name + ': \\u00A5' + perPerson.toLocaleString() + '/人');
            var amtInput = tierNames[m].row.querySelector('.tier-amount');
            if (amtInput) amtInput.value = perPerson;
        }
        if (total > 0) splitResultDiv.textContent = resultParts.join(' / ') + ' (合計: \\u00A5' + total.toLocaleString() + ')';
    }

`;
html = html.replace("    // ===== イベント作成 =====", splitJS + "    // ===== イベント作成 =====");

// ============================================
// イベントページの金額表示でamountType対応
// ============================================
// tierInfo表示
html = html.replace(
  "tierInfo = tiers.map(function(t) { return t.label + ': ¥' + (t.amount || 0).toLocaleString(); }).join(' / ');",
  "tierInfo = tiers.map(function(t) { var al = (t.amountType === 'tbd') ? '割り勘/未定' : '¥' + (t.amount || 0).toLocaleString(); return t.label + ': ' + al; }).join(' / ');"
);
html = html.replace(
  "tierInfo = '¥' + (tiers[0].amount || 0).toLocaleString() + '/人';",
  "tierInfo = (tiers[0].amountType === 'tbd') ? '割り勘/未定' : '¥' + (tiers[0].amount || 0).toLocaleString() + '/人';"
);

// 参加フォームのtier select
html = html.replace(
  "opt.textContent = (tiers[k].label || '一般') + '（¥' + (tiers[k].amount || 0).toLocaleString() + '）';",
  "var tierAmtLabel = (tiers[k].amountType === 'tbd') ? '割り勘/未定' : '¥' + (tiers[k].amount || 0).toLocaleString();\n            opt.textContent = (tiers[k].label || '一般') + '（' + tierAmtLabel + '）';"
);

// メンバーカードのtierBadge
html = html.replace(
  "tierBadge.textContent = (m.tier || '一般') + ' ¥' + (m.amount || 0).toLocaleString();",
  "var mAmtLabel = (m.amount === 0 && eventData) ? (function() { var ti = (eventData.priceTiers || []).find(function(t) { return t.label === m.tier; }); return (ti && ti.amountType === 'tbd') ? '割り勘/未定' : '¥0'; })() : '¥' + (m.amount || 0).toLocaleString();\n        tierBadge.textContent = (m.tier || '一般') + ' ' + mAmtLabel;"
);

// changeTier alert
html = html.replace(
  "msg += (i + 1) + '. ' + options[i].label + '（¥' + (options[i].amount || 0).toLocaleString() + '）\\n';",
  "var ctAmtLabel = (options[i].amountType === 'tbd') ? '割り勘/未定' : '¥' + (options[i].amount || 0).toLocaleString();\n            msg += (i + 1) + '. ' + options[i].label + '（' + ctAmtLabel + '）\\n';"
);

// tier-row CSS
html = html.replace(
  ".tier-row { display: flex; gap: 6px; margin-bottom: 8px; align-items: center }",
  ".tier-row { display: flex; gap: 4px; margin-bottom: 8px; align-items: center; flex-wrap: wrap }"
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
  try { new Function(code); console.log('Script ' + i + ': OK (' + code.length + ')'); }
  catch(e) { console.log('Script ' + i + ': ERR ' + e.message); syntaxOk = false; }
});

const checks = [
  ['構文', syntaxOk],
  ['お気に入り', result.includes('toggleFavorite')],
  ['複製', result.includes('applyTemplate')],
  ['完了ボタン', result.includes('completeBtn')],
  ['トップ遷移', result.includes('トップ画面に戻りますか')],
  ['stats表示', result.includes('progressSpan')],
  ['amountType select', result.includes('tier-amount-type')],
  ['割り勘/未定統合', result.includes('割り勘/未定')],
  ['PayPayInput削除', !result.includes('tier-paypay')],
  ['割り勘スライダー', result.includes('splitCalcUI')],
  ['recalcSplit', result.includes('recalcSplit')],
  ['adminToken送信', result.includes('adminToken: adminToken })')],
  ['createBtn保持', result.includes("getElementById('createBtn')")],
  ['joinBtn保持', result.includes("getElementById('joinBtn')")],
  ['doneBtn削除', !result.includes("doneBtn.className")],
];
console.log('\n=== 全チェック ===');
let allOk = true;
checks.forEach(([n, ok]) => { console.log(`${ok ? '✅' : '❌'} ${n}`); if (!ok) allOk = false; });
console.log(allOk ? '\n🎉 ALL OK!' : '\n⚠️ FAILED');
