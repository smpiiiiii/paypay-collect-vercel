// 紹介者表示をinnerHTML方式に修正（改行コード対応版）
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// textContent → innerHTML に変更
html = html.replace(
  "nameEl.textContent = nameText;",
  "nameEl.innerHTML = nameHtml;"
);

// nameText → nameHtml に変数名を合わせる
// 1. 初期化
html = html.replace(
  "var nameText = (m.name || '') + (m.name === myName ? ' 👈' : '');",
  "var safeName = (m.name || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');\r\n        var nameHtml = safeName + (m.name === myName ? ' 👈' : '');"
);

// 2. addedBy分岐（spanタグ版に置換）
html = html.replace(
  /nameText \+= '<span style="font-size:10px;color:#999;display:inline">' \+ '（' \+ m\.addedBy \+ 'の紹介）' \+ '<\/span>';/,
  "var safeRef = m.addedBy.replace(/</g,'&lt;').replace(/>/g,'&gt;');\r\n            nameHtml += '<span style=\"font-size:10px;color:#999;margin-left:2px\">（' + safeRef + 'の紹介）</span>';"
);

// 3. 幹事追加部分
html = html.replace(
  "nameText += '（幹事が追加）';",
  "nameHtml += '<span style=\"font-size:10px;color:#999;margin-left:2px\">（幹事が追加）</span>';"
);

fs.writeFileSync('public/index.html', html, 'utf8');

// 確認
const lines = html.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('nameHtml') || lines[i].includes('safeName') || lines[i].includes('safeRef')) {
    console.log(`${i+1}: ${lines[i].trimEnd()}`);
  }
}
console.log('修正完了');
