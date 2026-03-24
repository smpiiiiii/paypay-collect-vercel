// 全修正を一括適用するスクリプト（d854eeeベース）
// d854eee = LINE共有+URLコピー、催促コピー、紹介者表示小さく が適用済み
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

// JSのcopyUrlBtn/remindCopyBtn/remindCopyAllリスナーを削除
html = html.replace(
  /\n    \/\/ URLコピーボタン\n    document\.getElementById\('copyUrlBtn'\)\.addEventListener[\s\S]*?\n    \}\);\n/,
  '\n'
);
html = html.replace(
  /\n    \/\/ 催促文コピーボタン（詳細カード内）\n    document\.getElementById\('remindCopyBtn'\)\.addEventListener[\s\S]*?\n    \}\);\n/,
  '\n'
);
html = html.replace(
  /\n    \/\/ 催促文コピーボタン（メイン画面）\n    document\.getElementById\('remindCopyAll'\)\.addEventListener[\s\S]*?\n    \}\);\n/,
  '\n'
);

// ============================================
// 修正2: 長押しでコピー機能 + ヒントCSS
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
                        btn.textContent = '✅ コピー済み';
                        setTimeout(function() { btn.textContent = orig; }, 2000);
                    });
                } else {
                    var ta = document.createElement('textarea');
                    ta.value = text; document.body.appendChild(ta);
                    ta.select(); document.execCommand('copy');
                    document.body.removeChild(ta);
                    var orig = btn.textContent;
                    btn.textContent = '✅ コピー済み';
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

html = html.replace(
  '    // ===== 更新・共有 =====',
  longPressHelper + '    // ===== 更新・共有 ====='
);

// 長押し登録
html = html.replace(
  '\n\n    // ===== 未払い催促機能 =====',
  `

    // 長押しでコピー登録
    addLongPress('shareBtn', function() {
        var refName = myName ? encodeURIComponent(myName) : '';
        var url = location.origin + '/collect/' + eventId + (refName ? '?ref=' + refName : '');
        var eventName = eventData ? (eventData.name || '集金') : '集金';
        return '💰 ' + eventName + '\\n\\n👇 参加・支払い報告はこちら\\n' + url;
    });
    addLongPress('remindBtn', function() { return buildRemindMessage(); });
    addLongPress('remindBtnAll', function() { return buildRemindMessage(); });

    // ===== 未払い催促機能 =====`
);

// ============================================
// 修正3: 区分変更ボタン削除（レンダリング部分のみ）
// ============================================
const lines = html.split('\n');
let newLines = [];
let skipTier = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('tiersForChange = getTiers()')) {
    if (newLines.length > 0 && newLines[newLines.length - 1].includes('区分変更')) {
      newLines.pop();
    }
    skipTier = true;
    continue;
  }
  if (skipTier && lines[i].includes('actionsDiv.appendChild(changeBtn)')) {
    skipTier = 'closing';
    continue;
  }
  if (skipTier === 'closing' && lines[i].trim() === '}') {
    skipTier = false;
    continue;
  }
  if (!skipTier) {
    newLines.push(lines[i]);
  }
}
html = newLines.join('\n');

// ============================================
// 修正4: 済バッジ長押しで支払い情報表示
// ============================================
html = html.replace(
  "        actionsDiv.appendChild(badge);",
  `        actionsDiv.appendChild(badge);

        // 済バッジ長押しで支払い情報表示
        if (m.paid) {
            (function(member, badgeEl) {
                var timer = null;
                function showInfo() {
                    var info = [];
                    if (member.paidAt) info.push('💰 支払日時: ' + new Date(member.paidAt).toLocaleString('ja-JP'));
                    if (member.selfReported) info.push('📝 本人が自己申告');
                    if (member.actionBy) info.push('👤 操作者: ' + member.actionBy);
                    if (member.confirmed) info.push('✅ 幹事が確認済み');
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
// 修正5: テンプレート集金機能
// ============================================
// addToHistoryにtiers保存
html = html.replace(
  "function addToHistory(id, name) {",
  "function addToHistory(id, name, tiers) {"
);
html = html.replace(
  "history.unshift({ id: id, name: name, date: new Date().toISOString(), done: done });",
  "history.unshift({ id: id, name: name, date: new Date().toISOString(), done: done, tiers: tiers || (existing ? existing.tiers : null) });"
);
html = html.replace(
  "addToHistory(data.id, name);",
  "addToHistory(data.id, name, tiers);"
);
html = html.replace(
  "if (eventData && eventData.name) addToHistory(eventId, eventData.name);",
  "if (eventData && eventData.name) addToHistory(eventId, eventData.name, eventData.priceTiers || null);"
);

// applyTemplate関数追加
html = html.replace(
  "    function renderHistory() {",
  `    function applyTemplate(hist) {
        var nameInput = document.getElementById('createName');
        if (nameInput) nameInput.value = hist.name;
        var container = document.getElementById('tierRows');
        while (container.firstChild) container.removeChild(container.firstChild);
        if (hist.tiers && hist.tiers.length > 0) {
            for (var i = 0; i < hist.tiers.length; i++) {
                var t = hist.tiers[i];
                addTierRow(t.label || '', t.amount || '', t.paypayLink || '');
            }
        } else { addTierRow('男子', '', ''); addTierRow('女子', '', ''); }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        nameInput.style.transition = 'background 0.3s';
        nameInput.style.background = '#e8f5e9';
        setTimeout(function() { nameInput.style.background = ''; }, 1500);
    }

    function renderHistory() {`
);

// renderHistory内のdelBtnの後にテンプレボタン追加
html = html.replace(
  "            actionsDiv.appendChild(delBtn);\r\n            card.appendChild(doneBtn);",
  `            actionsDiv.appendChild(delBtn);
            if (h.tiers && h.tiers.length > 0) {
                var tplBtn = document.createElement('button');
                tplBtn.className = 'h-del-btn';
                tplBtn.style.cssText = 'background:#e3f2fd;border-color:#90caf9;font-size:11px;width:auto;padding:0 8px;border-radius:8px;color:#1976d2';
                tplBtn.textContent = '📋';
                tplBtn.title = 'この設定で新規作成';
                (function(hist) { tplBtn.addEventListener('click', function(e) { e.stopPropagation(); applyTemplate(hist); }); })(h);
                actionsDiv.appendChild(tplBtn);
            }
            card.appendChild(icon);`
);

// doneBtnの生成コード・appendを削除、アイコンクリックで済トグルに変更
// doneBtn生成部分を済チェックコメントに置換
const lines2 = html.split('\n');
let newLines2 = [];
for (let i = 0; i < lines2.length; i++) {
  if (lines2[i].includes("var doneBtn = document.createElement('button')") ||
      lines2[i].includes("doneBtn.className = 'h-done-btn'") ||
      lines2[i].includes("doneBtn.textContent = h.done") ||
      lines2[i].includes("doneBtn.title = h.done")) {
    continue;
  }
  if (lines2[i].includes("doneBtn.addEventListener('click'") ||
      (lines2[i].includes("toggleHistoryDone(hid)") && !lines2[i].includes('function'))) {
    continue;
  }
  // doneBtn IIFE closing
  if (lines2[i].trim() === '})(h.id);' && i > 0 && lines2[i-1] && lines2[i-1].includes('toggleHistoryDone')) {
    continue;
  }
  newLines2.push(lines2[i]);
}
html = newLines2.join('\n');

// アイコンにクリックで済トグル
html = html.replace(
  "icon.className = 'h-icon'; icon.textContent = h.done ? '✅' : '💰';",
  "icon.className = 'h-icon'; icon.textContent = h.done ? '✅' : '💰';\n            icon.style.cursor = 'pointer'; icon.title = h.done ? 'タップで済を解除' : 'タップで済にする';\n            (function(hid) { icon.addEventListener('click', function(e) { e.stopPropagation(); toggleHistoryDone(hid); }); })(h.id);"
);

// 区分情報をmeta表示に追加
html = html.replace(
  "            if (h.done) {\r\n                var doneBadge",
  `            if (h.tiers && h.tiers.length > 0) {
                var tierSpan = document.createElement('span');
                tierSpan.style.cssText = 'display:block;font-size:9px;color:#666;margin-top:1px';
                tierSpan.textContent = h.tiers.map(function(t) { return t.label + ' \\u00A5' + (t.amount || 0).toLocaleString(); }).join(' / ');
                meta.appendChild(tierSpan);
            }
            if (h.done) {\r\n                var doneBadge`
);

// ============================================
// 修正6: 幹事説明テキスト（作成ページ + イベントページ）
// ============================================
html = html.replace(
  '<button class="btn btn-red" id="createBtn">✅ 作成する</button>',
  '<div style="font-size:11px;color:#666;background:#f0f4ff;border-radius:8px;padding:8px 12px;margin-bottom:10px;line-height:1.5">💡 <b>企画者＝幹事</b>です。作成した端末から<b>幹事モード</b>で支払い確認・メンバー管理ができます。</div>\n            <button class="btn btn-red" id="createBtn">✅ 作成する</button>'
);

html = html.replace(
  '<div class="admin-toggle" id="adminToggle">🔐 幹事モード</div>',
  '<div class="admin-toggle" id="adminToggle">🔐 幹事モード</div>\n        <div id="adminHelpText" style="font-size:10px;color:#bbb;text-align:center;margin-top:4px;line-height:1.4">💡 企画者＝幹事です。幹事モードで支払い確認・メンバー管理ができます</div>'
);

html = html.replace(
  "document.getElementById('adminToggle').style.display = adminToken ? '' : 'none';",
  "document.getElementById('adminToggle').style.display = adminToken ? '' : 'none';\n            document.getElementById('adminHelpText').style.display = adminToken ? '' : 'none';"
);

fs.writeFileSync('public/index.html', html, 'utf8');

// ============================================
// 検証
// ============================================
const result = fs.readFileSync('public/index.html', 'utf8');
const checks = [
  ['LINE共有ボタン', result.includes('id="shareBtn"')],
  ['URLコピーボタン削除', !result.includes('id="copyUrlBtn"')],
  ['長押し機能', result.includes('function addLongPress')],
  ['長押しヒント', result.includes('長押しでコピー')],
  ['区分変更削除', !result.includes('tiersForChange')],
  ['済バッジ長押し', result.includes('支払い情報')],
  ['テンプレート機能', result.includes('function applyTemplate')],
  ['テンプレボタン', result.includes('tplBtn')],
  ['tiers保存', result.includes('function addToHistory(id, name, tiers)')],
  ['幹事説明(作成)', result.includes('企画者＝幹事')],
  ['幹事説明(イベント)', result.includes('adminHelpText')],
  ['doneBtn削除', !result.includes("doneBtn.className")],
  ['アイコン済トグル', result.includes('タップで済を解除')],
  ['イベント作成保持', result.includes("xhr.open('POST', API + '/api/create'")],
  ['参加登録保持', result.includes("getElementById('joinBtn')")],
  ['紹介者小さく', result.includes('font-size:10px;color:#999')],
];
console.log('=== 全修正検証 ===');
let allOk = true;
checks.forEach(([name, ok]) => { console.log(`${ok ? '✅' : '❌'} ${name}`); if (!ok) allOk = false; });
console.log(allOk ? '\n🎉 全チェックOK!' : '\n⚠️ 一部失敗あり');
