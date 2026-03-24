// UI改善: 区分変更ボタン削除、LINE共有/催促を長押しでURLコピーに変更
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. HTMLボタン: URLコピーボタンを削除（LINE共有ボタンのみに）
// ============================================
html = html.replace(
  '<button class="btn btn-green" id="shareBtn">📤 LINE共有</button>\n            <button class="btn btn-outline" id="copyUrlBtn">📋 URLコピー</button>',
  '<button class="btn btn-green" id="shareBtn">📤 LINE共有</button>'
);

// 催促コピーボタン削除（詳細カード内）
html = html.replace(
  '<button class="btn btn-remind" id="remindBtn">📣 LINE催促</button>\n            <button class="btn btn-outline" id="remindCopyBtn" style="margin-top:6px;font-size:12px;padding:8px">📋 催促文コピー</button>',
  '<button class="btn btn-remind" id="remindBtn">📣 LINEで催促する</button>'
);

// 催促コピーボタン削除（メイン画面） 
html = html.replace(
  '<div style="display:flex;gap:6px"><button class="btn btn-remind" id="remindBtnAll" style="font-size:12px;padding:10px;flex:1">📣 LINE催促</button><button class="btn btn-outline" id="remindCopyAll" style="font-size:12px;padding:10px;flex:1">📋 催促文コピー</button></div>',
  '<button class="btn btn-remind" id="remindBtnAll" style="font-size:12px;padding:10px">📣 未払いの人にLINEで催促</button>'
);

// ============================================
// 2. JSのURLコピーリスナーを削除して長押し対応に置換
// ============================================

// copyUrlBtnリスナーを削除
html = html.replace(
  /\n    \/\/ URLコピーボタン\n    document\.getElementById\('copyUrlBtn'\)\.addEventListener[\s\S]*?\n    \}\);\n/,
  '\n'
);

// remindCopyBtnリスナーを削除
html = html.replace(
  /\n    \/\/ 催促文コピーボタン（詳細カード内）\n    document\.getElementById\('remindCopyBtn'\)\.addEventListener[\s\S]*?\n    \}\);\n/,
  '\n'
);

// remindCopyAllリスナーを削除
html = html.replace(
  /\n    \/\/ 催促文コピーボタン（メイン画面）\n    document\.getElementById\('remindCopyAll'\)\.addEventListener[\s\S]*?\n    \}\);\n/,
  '\n'
);

// ============================================
// 3. 長押しでコピー機能を追加（共通ヘルパー関数）
// ============================================
// "// ===== 更新・共有 =====" の前に長押しヘルパーを挿入
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
        // マウス操作にも対応
        btn.addEventListener('mousedown', onStart);
        btn.addEventListener('mouseup', onEnd);
        btn.addEventListener('mouseleave', function() { clearTimeout(timer); });
    }

`;

html = html.replace(
  '    // ===== 更新・共有 =====',
  longPressHelper + '    // ===== 更新・共有 ====='
);

// ============================================
// 4. shareBtnのclickリスナーの後に長押し登録を追加
// ============================================
// shareBtnリスナーの }); の後に追加
// "// ===== 未払い催促機能 =====" の前に挿入
html = html.replace(
  '\n\n    // ===== 未払い催促機能 =====',
  `

    // 長押しでURLコピー
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
// 5. ボタンに長押しヒントを追加（CSSツールチップ的に）
// ============================================
// share-btns のCSSの後にヒント用スタイルを追加
html = html.replace(
  '.share-btns .btn { flex: 1; font-size: 12px; padding: 10px }',
  '.share-btns .btn { flex: 1; font-size: 12px; padding: 10px }\n        .btn-green::after, .btn-remind::after { content: "長押しでコピー"; display: block; font-size: 9px; opacity: 0.6; margin-top: 2px }'
);

// ============================================
// 6. 区分変更ボタンを削除（JSのchangeTier関連コード）
// ============================================
// レンダリング部分の区分変更ボタン生成コードを削除
html = html.replace(
  /        \/\/ 区分変更ボタン: 区分が2つ以上ある場合、権限のある人に表示\r?\n        var tiersForChange = getTiers\(\);\r?\n        if \(tiersForChange\.length >= 2 && canDelete\) \{[\s\S]*?\(m\.name, m\.tier\);\r?\n            \}\)\(m\.name, m\.tier\);\r?\n            actionsDiv\.appendChild\(changeBtn\);\r?\n        \}/,
  '        // 区分変更ボタン: 削除済み'
);

fs.writeFileSync('public/index.html', html, 'utf8');

// 検証
const result = fs.readFileSync('public/index.html', 'utf8');
const checks = [
  ['copyUrlBtn削除', !result.includes('id="copyUrlBtn"')],
  ['remindCopyBtn削除', !result.includes('id="remindCopyBtn"')],
  ['remindCopyAll削除', !result.includes('id="remindCopyAll"')],
  ['長押しヘルパー関数', result.includes('function addLongPress')],
  ['shareBtn長押し登録', result.includes("addLongPress('shareBtn'")],
  ['remindBtn長押し登録', result.includes("addLongPress('remindBtn'")],
  ['長押しヒントCSS', result.includes('長押しでコピー')],
  ['区分変更ボタン削除', result.includes('区分変更ボタン: 削除済み')],
  ['イベント作成保持', result.includes("xhr.open('POST', API + '/api/create'")],
  ['参加登録保持', result.includes("getElementById('joinBtn')")],
];

console.log('=== 検証結果 ===');
checks.forEach(([name, ok]) => console.log(`${ok ? '✅' : '❌'} ${name}`));
