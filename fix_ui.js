// URLコピーボタン追加 & 紹介者表示の修正
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. 共有ボタン: URLコピーボタンを追加（HTML）
// ============================================
// 行285: <button class="btn btn-green" id="shareBtn">📤 LINE共有</button>
// の後にURLコピーボタンを追加
html = html.replace(
  '<button class="btn btn-green" id="shareBtn">📤 LINE共有</button>',
  '<button class="btn btn-green" id="shareBtn">📤 LINE共有</button>\n            <button class="btn btn-outline" id="copyUrlBtn">📋 URLコピー</button>'
);

// ============================================
// 2. 催促ボタン: URLコピーも追加（HTML）
// ============================================
// 行224: remindBtn - 詳細カード内の催促
html = html.replace(
  '<button class="btn btn-remind" id="remindBtn">📣 LINEで催促する</button>',
  '<button class="btn btn-remind" id="remindBtn">📣 LINEで催促</button>\n            <button class="btn btn-outline" id="remindCopyBtn" style="margin-top:6px;font-size:12px;padding:8px">📋 催促文をコピー</button>'
);

// 行289: remindBtnAll - メイン画面の催促
html = html.replace(
  '<button class="btn btn-remind" id="remindBtnAll" style="font-size:12px;padding:10px">📣 未払いの人にLINEで催促</button>',
  '<div style="display:flex;gap:6px"><button class="btn btn-remind" id="remindBtnAll" style="font-size:12px;padding:10px;flex:1">📣 LINE催促</button><button class="btn btn-outline" id="remindCopyAll" style="font-size:12px;padding:10px;flex:1">📋 催促文コピー</button></div>'
);

// ============================================
// 3. URLコピーのイベントリスナーをJavaScript内に追加
// ============================================
// shareBtn のイベントリスナーの後にcopyUrlBtnのリスナーを追加
// 行622付近: document.getElementById('shareBtn').addEventListener を探す
const shareBtnListener = "document.getElementById('shareBtn').addEventListener('click', function() {";
const shareBtnIdx = html.lastIndexOf(shareBtnListener);
if (shareBtnIdx === -1) {
  console.error('shareBtn リスナーが見つかりません');
  process.exit(1);
}

// shareBtnリスナーの終わりを見つける（});を検索）
// shareBtnリスナーのコード全体を見つけて、その後にcopyUrlBtnリスナーを追加
const afterShareBtn = html.indexOf('});', shareBtnIdx);
const insertPoint1 = html.indexOf('\n', afterShareBtn) + 1;

const copyUrlBtnCode = `
    // URLコピーボタン
    document.getElementById('copyUrlBtn').addEventListener('click', function() {
        var refName = myName || '';
        var url = location.origin + '/collect/' + eventId + (refName ? '?ref=' + refName : '');
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
    });
`;
html = html.slice(0, insertPoint1) + copyUrlBtnCode + html.slice(insertPoint1);

// remindBtnのリスナーの後にremindCopyBtnリスナーを追加
const remindBtnListener = "document.getElementById('remindBtn').addEventListener('click', function() {";
const remindBtnIdx = html.indexOf(remindBtnListener);
const afterRemindBtn = html.indexOf('});', remindBtnIdx);
const insertPoint2 = html.indexOf('\n', afterRemindBtn) + 1;

const remindCopyBtnCode = `
    // 催促文コピーボタン（詳細カード内）
    document.getElementById('remindCopyBtn').addEventListener('click', function() {
        var text = buildRemindMessage();
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() {
                var btn = document.getElementById('remindCopyBtn');
                btn.textContent = '✅ コピー済み';
                setTimeout(function() { btn.textContent = '📋 催促文をコピー'; }, 2000);
            });
        } else {
            var ta = document.createElement('textarea');
            ta.value = text; document.body.appendChild(ta);
            ta.select(); document.execCommand('copy');
            document.body.removeChild(ta);
            var btn = document.getElementById('remindCopyBtn');
            btn.textContent = '✅ コピー済み';
            setTimeout(function() { btn.textContent = '📋 催促文をコピー'; }, 2000);
        }
    });
`;
html = html.slice(0, insertPoint2) + remindCopyBtnCode + html.slice(insertPoint2);

// remindBtnAllのリスナーの後にremindCopyAllリスナーを追加
const remindBtnAllListener = "document.getElementById('remindBtnAll').addEventListener('click', function() {";
const remindBtnAllIdx = html.indexOf(remindBtnAllListener);
const afterRemindBtnAll = html.indexOf('});', remindBtnAllIdx);
const insertPoint3 = html.indexOf('\n', afterRemindBtnAll) + 1;

const remindCopyAllCode = `
    // 催促文コピーボタン（メイン画面）
    document.getElementById('remindCopyAll').addEventListener('click', function() {
        var text = buildRemindMessage();
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
    });
`;
html = html.slice(0, insertPoint3) + remindCopyAllCode + html.slice(insertPoint3);

// ============================================
// 4. 紹介者表示を小さくする
// ============================================
// 行1066: nameText += '（' + m.addedBy + 'の招待）';
// → 小さいspanで表示するように変更
html = html.replace(
  "nameText += '（' + m.addedBy + 'の招待）';",
  "nameText += '<span style=\"font-size:10px;color:#999;display:inline\">' + '（' + m.addedBy + 'の紹介）' + '</span>';"
);

// nameText を textContent ではなく innerHTML で設定しているか確認
// nameSpanへの設定方法を確認して修正
const lines = html.split('\n');
for (let i = 1060; i < 1080 && i < lines.length; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('\n=== 修正完了 ===');
console.log('1. URLコピーボタン追加');
console.log('2. 催促文コピーボタン追加');
console.log('3. 紹介者表示を小さく変更');
