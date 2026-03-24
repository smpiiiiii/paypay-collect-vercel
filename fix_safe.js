// 安全な修正スクリプト - 復元されたindex.htmlに正しく変更を適用
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 修正1: HTMLボタン - URLコピーボタンを追加
// ============================================
html = html.replace(
  '<button class="btn btn-green" id="shareBtn">📤 LINE共有</button>',
  '<button class="btn btn-green" id="shareBtn">📤 LINE共有</button>\n            <button class="btn btn-outline" id="copyUrlBtn">📋 URLコピー</button>'
);

// ============================================
// 修正2: HTMLボタン - 催促にもコピーボタン追加
// ============================================
html = html.replace(
  '<button class="btn btn-remind" id="remindBtn">📣 LINEで催促する</button>',
  '<button class="btn btn-remind" id="remindBtn">📣 LINE催促</button>\n            <button class="btn btn-outline" id="remindCopyBtn" style="margin-top:6px;font-size:12px;padding:8px">📋 催促文コピー</button>'
);

html = html.replace(
  '<button class="btn btn-remind" id="remindBtnAll" style="font-size:12px;padding:10px">📣 未払いの人にLINEで催促</button>',
  '<div style="display:flex;gap:6px"><button class="btn btn-remind" id="remindBtnAll" style="font-size:12px;padding:10px;flex:1">📣 LINE催促</button><button class="btn btn-outline" id="remindCopyAll" style="font-size:12px;padding:10px;flex:1">📋 催促文コピー</button></div>'
);

// ============================================
// 修正3: JS - shareBtn → navigator.share の代わりに LINE共有URL
// ============================================
// 元のコード: if (navigator.share) { navigator.share({...}).catch(...); } else { navigator.clipboard... }
// → LINE共有URLに変更
html = html.replace(
  /if \(navigator\.share\) \{\s*\r?\n\s*navigator\.share\(\{ title: eventName, text: text \}\)\.catch\(function\(\) \{\}\);\s*\r?\n\s*\} else \{\s*\r?\n\s*navigator\.clipboard\.writeText\(text\)\.then\(function\(\) \{ alert\('📋 共有テキストをコピーしました！LINEに貼り付けて送ってね'\); \}\);\s*\r?\n\s*\}/,
  'var lineUrl = "https://line.me/R/share?text=" + encodeURIComponent(text);\n        window.open(lineUrl, "_blank");'
);

// ============================================
// 修正4: JS - remindBtn → LINE共有URL（2箇所）
// ============================================
html = html.replace(
  /if \(navigator\.share\) \{\s*\r?\n\s*navigator\.share\(\{ title: '支払いリマインダー', text: text \}\)\.catch\(function\(\) \{\}\);\s*\r?\n\s*\} else \{\s*\r?\n\s*navigator\.clipboard\.writeText\(text\)\.then\(function\(\) \{ alert\('📋 催促テキストをコピーしました！'\); \}\);\s*\r?\n\s*\}/g,
  'var lineUrl = "https://line.me/R/share?text=" + encodeURIComponent(text);\n        window.open(lineUrl, "_blank");'
);

// ============================================
// 修正5: URLコピーボタンのイベントリスナーを追加
// ============================================
const copyUrlCode = `

    // URLコピーボタン
    document.getElementById('copyUrlBtn').addEventListener('click', function() {
        var refName = myName ? encodeURIComponent(myName) : '';
        var url = location.origin + '/collect/' + eventId + (refName ? '?ref=' + refName : '');
        var eventName = eventData ? (eventData.name || '集金') : '集金';
        var text = '💰 ' + eventName + '\\n\\n👇 参加・支払い報告はこちら\\n' + url;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() {
                var btn = document.getElementById('copyUrlBtn');
                btn.textContent = '✅ コピー済み';
                setTimeout(function() { btn.textContent = '📋 URLコピー'; }, 2000);
            });
        } else {
            var ta = document.createElement('textarea');
            ta.value = text; document.body.appendChild(ta);
            ta.select(); document.execCommand('copy');
            document.body.removeChild(ta);
            var btn = document.getElementById('copyUrlBtn');
            btn.textContent = '✅ コピー済み';
            setTimeout(function() { btn.textContent = '📋 URLコピー'; }, 2000);
        }
    });`;

// shareBtnリスナーの閉じ括弧の後に挿入
// "// ===== 未払い催促機能 =====" の前に挿入
html = html.replace(
  '    // ===== 未払い催促機能 =====',
  copyUrlCode + '\n\n    // ===== 未払い催促機能 ====='
);

// ============================================
// 修正6: 催促コピーボタンのイベントリスナー追加
// ============================================
const remindCopyCode = `

    // 催促文コピーボタン（詳細カード内）
    document.getElementById('remindCopyBtn').addEventListener('click', function() {
        var text = buildRemindMessage();
        if (!text) { alert('未払いの参加者はいません🎉'); return; }
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() {
                var btn = document.getElementById('remindCopyBtn');
                btn.textContent = '✅ コピー済み';
                setTimeout(function() { btn.textContent = '📋 催促文コピー'; }, 2000);
            });
        } else {
            var ta = document.createElement('textarea');
            ta.value = text; document.body.appendChild(ta);
            ta.select(); document.execCommand('copy');
            document.body.removeChild(ta);
            var btn = document.getElementById('remindCopyBtn');
            btn.textContent = '✅ コピー済み';
            setTimeout(function() { btn.textContent = '📋 催促文コピー'; }, 2000);
        }
    });`;

// remindBtnリスナーの後に挿入
// "// 全員向け催促ボタン" の前に挿入
html = html.replace(
  '    // 全員向け催促ボタン',
  remindCopyCode + '\n\n    // 全員向け催促ボタン'
);

const remindCopyAllCode = `

    // 催促文コピーボタン（メイン画面）
    document.getElementById('remindCopyAll').addEventListener('click', function() {
        var text = buildRemindMessage();
        if (!text) { alert('未払いの参加者はいません🎉'); return; }
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() {
                var btn = document.getElementById('remindCopyAll');
                btn.textContent = '✅ コピー済み';
                setTimeout(function() { btn.textContent = '📋 催促文コピー'; }, 2000);
            });
        } else {
            var ta = document.createElement('textarea');
            ta.value = text; document.body.appendChild(ta);
            ta.select(); document.execCommand('copy');
            document.body.removeChild(ta);
            var btn = document.getElementById('remindCopyAll');
            btn.textContent = '✅ コピー済み';
            setTimeout(function() { btn.textContent = '📋 催促文コピー'; }, 2000);
        }
    });`;

// remindBtnAllリスナーの後に挿入
// "// ===== 幹事モード =====" の前に挿入
html = html.replace(
  '    // ===== 幹事モード =====',
  remindCopyAllCode + '\n\n    // ===== 幹事モード ====='
);

// ============================================
// 修正7: 紹介者表示を小さくする
// ============================================
html = html.replace(
  "nameText += '（' + m.addedBy + 'の招待）';",
  "nameHtml += '<span style=\"font-size:10px;color:#999;margin-left:2px\">（' + safeRef + 'の紹介）</span>';"
);
html = html.replace(
  "nameText += '（幹事が追加）';",
  "nameHtml += '<span style=\"font-size:10px;color:#999;margin-left:2px\">（幹事が追加）</span>';"
);
html = html.replace(
  "var nameText = (m.name || '') + (m.name === myName ? ' 👈' : '');",
  "var safeName = (m.name || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');\n        var nameHtml = safeName + (m.name === myName ? ' 👈' : '');"
);
// addedByのエスケープ追加
html = html.replace(
  "if (m.addedBy && m.addedBy !== m.name && m.addedBy !== '幹事') {\r\n            nameHtml",
  "if (m.addedBy && m.addedBy !== m.name && m.addedBy !== '幹事') {\r\n            var safeRef = m.addedBy.replace(/</g,'&lt;').replace(/>/g,'&gt;');\r\n            nameHtml"
);
html = html.replace(
  "nameEl.textContent = nameText;",
  "nameEl.innerHTML = nameHtml;"
);

fs.writeFileSync('public/index.html', html, 'utf8');

// 検証
const result = fs.readFileSync('public/index.html', 'utf8');
const checks = [
  ['copyUrlBtn HTML', result.includes('id="copyUrlBtn"')],
  ['remindCopyBtn HTML', result.includes('id="remindCopyBtn"')],
  ['remindCopyAll HTML', result.includes('id="remindCopyAll"')],
  ['LINE共有URL (share)', result.includes('line.me/R/share')],
  ['URLコピーリスナー', result.includes("getElementById('copyUrlBtn').addEventListener")],
  ['紹介者span', result.includes('font-size:10px;color:#999')],
  ['innerHTML', result.includes('nameEl.innerHTML = nameHtml')],
  ['イベント作成XHR保持', result.includes("xhr.open('POST', API + '/api/create'")],
  ['参加登録保持', result.includes("getElementById('joinBtn')")],
];

console.log('=== 検証結果 ===');
checks.forEach(([name, ok]) => console.log(`${ok ? '✅' : '❌'} ${name}`));
