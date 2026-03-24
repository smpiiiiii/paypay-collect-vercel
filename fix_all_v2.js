// d854eeeベース: 全修正一括（doneBtn完全削除版）
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 修正1: URLコピーボタン削除 → LINE共有のみ（長押しでコピー）
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

// JS copyUrl/remindCopy リスナー削除
html = html.replace(/\n    \/\/ URLコピーボタン\n    document\.getElementById\('copyUrlBtn'\)\.addEventListener[\s\S]*?\n    \}\);\n/, '\n');
html = html.replace(/\n    \/\/ 催促文コピーボタン（詳細カード内）\n    document\.getElementById\('remindCopyBtn'\)\.addEventListener[\s\S]*?\n    \}\);\n/, '\n');
html = html.replace(/\n    \/\/ 催促文コピーボタン（メイン画面）\n    document\.getElementById\('remindCopyAll'\)\.addEventListener[\s\S]*?\n    \}\);\n/, '\n');

// ============================================
// 修正2: 長押しヒントCSS + 長押しヘルパー関数
// ============================================
html = html.replace(
  '.share-btns .btn { flex: 1; font-size: 12px; padding: 10px }',
  '.share-btns .btn { flex: 1; font-size: 12px; padding: 10px }\n        .btn-green::after, .btn-remind::after { content: "長押しでコピー"; display: block; font-size: 9px; opacity: 0.6; margin-top: 2px }'
);

const longPressHelper = `
    // ===== 長押しでコピー機能 =====
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

`;
html = html.replace('    // ===== 更新・共有 =====', longPressHelper + '    // ===== 更新・共有 =====');

// 長押し登録
html = html.replace('\n\n    // ===== 未払い催促機能 =====',
  "\n\n    addLongPress('shareBtn', function() {\n        var refName = myName ? encodeURIComponent(myName) : '';\n        var url = location.origin + '/collect/' + eventId + (refName ? '?ref=' + refName : '');\n        var evName = eventData ? (eventData.name || '集金') : '集金';\n        return '\\uD83D\\uDCB0 ' + evName + '\\\\n\\\\n\\uD83D\\uDC47 参加・支払い報告はこちら\\\\n' + url;\n    });\n    addLongPress('remindBtn', function() { return buildRemindMessage(); });\n    addLongPress('remindBtnAll', function() { return buildRemindMessage(); });\n\n    // ===== 未払い催促機能 ====="
);

// ============================================
// 修正3: 区分変更ボタン削除
// ============================================
let lines = html.split('\n');
let newLines = [];
let skipTier = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('tiersForChange = getTiers()')) {
    if (newLines.length > 0 && newLines[newLines.length - 1].includes('区分変更')) newLines.pop();
    skipTier = true; continue;
  }
  if (skipTier && lines[i].includes('actionsDiv.appendChild(changeBtn)')) { skipTier = 'closing'; continue; }
  if (skipTier === 'closing' && lines[i].trim() === '}') { skipTier = false; continue; }
  if (!skipTier) newLines.push(lines[i]);
}
html = newLines.join('\n');

// ============================================
// 修正4: 済バッジ長押し
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
// 修正5: テンプレート機能
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

html = html.replace("    function renderHistory() {",
  `    function applyTemplate(hist) {
        var nameInput = document.getElementById('cName');
        if (nameInput) nameInput.value = hist.name;
        var container = document.getElementById('tierRows');
        while (container.firstChild) container.removeChild(container.firstChild);
        if (hist.tiers && hist.tiers.length > 0) {
            for (var i = 0; i < hist.tiers.length; i++) {
                addTierRow(hist.tiers[i].label || '', hist.tiers[i].amount || '', hist.tiers[i].paypayLink || '');
            }
        } else { addTierRow('男子', '', ''); addTierRow('女子', '', ''); }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (nameInput) { nameInput.style.transition = 'background 0.3s'; nameInput.style.background = '#e8f5e9'; setTimeout(function() { nameInput.style.background = ''; }, 1500); }
    }

    function renderHistory() {`
);

// renderHistory: delBtn後にテンプレボタン追加 + doneBtn→icon済トグル
// doneBtn生成コード全体を削除し、iconにクリックイベント追加
// card.appendChild(doneBtn) も削除
// 重要: 行単位で正確に処理

// doneBtn関連の行を完全削除
lines = html.split('\n');
newLines = [];
let inDoneBtnBlock = false;
let skipDoneBtnIIFE = false;
let iifeBraces = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // doneBtn生成4行をスキップ
  if (line.includes("var doneBtn = document.createElement('button')")) { inDoneBtnBlock = true; continue; }
  if (inDoneBtnBlock && (line.includes("doneBtn.className") || line.includes("doneBtn.textContent") || line.includes("doneBtn.title"))) continue;
  if (inDoneBtnBlock && line.includes("(function(hid) {")) {
    // doneBtnのIIFE開始 - この全体をスキップ
    skipDoneBtnIIFE = true;
    iifeBraces = 0;
    for (const c of line) { if (c === '{') iifeBraces++; if (c === '}') iifeBraces--; }
    inDoneBtnBlock = false;
    continue;
  }
  if (skipDoneBtnIIFE) {
    for (const c of line) { if (c === '{') iifeBraces++; if (c === '}') iifeBraces--; }
    if (line.includes('})(h.id)')) { skipDoneBtnIIFE = false; }
    continue;
  }
  
  // card.appendChild(doneBtn) をスキップ
  if (line.includes("card.appendChild(doneBtn)")) continue;
  
  newLines.push(line);
}
html = newLines.join('\n');

// iconにクリックで済トグル追加
html = html.replace(
  "icon.className = 'h-icon'; icon.textContent = h.done ? '✅' : '💰';",
  "icon.className = 'h-icon'; icon.textContent = h.done ? '\\u2705' : '\\uD83D\\uDCB0';\n            icon.style.cursor = 'pointer'; icon.title = h.done ? 'タップで済を解除' : 'タップで済にする';\n            (function(hid) { icon.addEventListener('click', function(e) { e.stopPropagation(); toggleHistoryDone(hid); }); })(h.id);"
);

// delBtn後にテンプレボタン追加
html = html.replace(
  "            actionsDiv.appendChild(delBtn);\r\n            card.appendChild(icon);",
  "            actionsDiv.appendChild(delBtn);\n            if (h.tiers && h.tiers.length > 0) {\n                var tplBtn = document.createElement('button');\n                tplBtn.className = 'h-del-btn';\n                tplBtn.style.cssText = 'background:#e3f2fd;font-size:11px;width:auto;padding:0 8px;border-radius:8px;color:#1976d2';\n                tplBtn.textContent = '\\uD83D\\uDCCB';\n                tplBtn.title = 'この設定で新規作成';\n                (function(hist) { tplBtn.addEventListener('click', function(e) { e.stopPropagation(); applyTemplate(hist); }); })(h);\n                actionsDiv.appendChild(tplBtn);\n            }\r\n            card.appendChild(icon);"
);

// 区分情報をmeta表示に追加
html = html.replace(
  "            if (h.done) {\r\n                var doneBadge",
  "            if (h.tiers && h.tiers.length > 0) {\n                var tierSpan = document.createElement('span');\n                tierSpan.style.cssText = 'display:block;font-size:9px;color:#666;margin-top:1px';\n                tierSpan.textContent = h.tiers.map(function(t) { return t.label + ' \\u00A5' + (t.amount || 0).toLocaleString(); }).join(' / ');\n                meta.appendChild(tierSpan);\n            }\r\n            if (h.done) {\r\n                var doneBadge"
);

// ============================================
// 修正6: 幹事説明テキスト
// ============================================
html = html.replace(
  '<button class="btn btn-red" id="createBtn">✅ 作成する</button>',
  '<div style="font-size:11px;color:#666;background:#f0f4ff;border-radius:8px;padding:8px 12px;margin-bottom:10px;line-height:1.5">\\uD83D\\uDCA1 <b>企画者＝幹事</b>です。作成した端末から<b>幹事モード</b>で支払い確認・メンバー管理ができます。</div>\n            <button class="btn btn-red" id="createBtn">✅ 作成する</button>'
);
html = html.replace(
  '<div class="admin-toggle" id="adminToggle">🔐 幹事モード</div>',
  '<div class="admin-toggle" id="adminToggle">🔐 幹事モード</div>\n        <div id="adminHelpText" style="font-size:10px;color:#bbb;text-align:center;margin-top:4px;line-height:1.4">\\uD83D\\uDCA1 企画者＝幹事です。幹事モードで支払い確認・メンバー管理ができます</div>'
);
html = html.replace(
  "document.getElementById('adminToggle').style.display = adminToken ? '' : 'none';",
  "document.getElementById('adminToggle').style.display = adminToken ? '' : 'none';\n            document.getElementById('adminHelpText').style.display = adminToken ? '' : 'none';"
);

fs.writeFileSync('public/index.html', html, 'utf8');

// ============================================
// 構文チェック
// ============================================
const result = fs.readFileSync('public/index.html', 'utf8');
const scripts = result.match(/<script>([\s\S]*?)<\/script>/g);
let allOk = true;
if (scripts) {
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i].replace(/<\/?script>/g, '');
    try {
      new Function(s);
      console.log('Script ' + i + ': ✅ OK (' + s.length + ' chars)');
    } catch(e) {
      console.log('Script ' + i + ': ❌ ' + e.message);
      allOk = false;
    }
  }
}
console.log(allOk ? '\n🎉 構文OK!' : '\n⚠️ 構文エラーあり');

// 機能チェック
const checks = [
  ['LINE共有', result.includes('id="shareBtn"')],
  ['URLコピー削除', !result.includes('id="copyUrlBtn"')],
  ['長押し機能', result.includes('function addLongPress')],
  ['区分変更削除', !result.includes('tiersForChange')],
  ['済バッジ長押し', result.includes('支払い情報')],
  ['テンプレ', result.includes('function applyTemplate')],
  ['tiers保存', result.includes('function addToHistory(id, name, tiers)')],
  ['幹事説明', result.includes('adminHelpText')],
  ['doneBtn完全削除', !result.includes("doneBtn.className")],
  ['icon済トグル', result.includes('toggleHistoryDone(hid)')],
  ['作成保持', result.includes("xhr.open('POST', API + '/api/create'")],
  ['参加保持', result.includes("getElementById('joinBtn')")],
];
checks.forEach(([n, ok]) => console.log(`${ok ? '✅' : '❌'} ${n}`));
