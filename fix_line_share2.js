// else ブロックを修正するスクリプト
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 修正: LINE共有URLの後に残っている "else { ... }" ブロックを削除
// パターン: window.open(lineUrl, "_blank"); else {
//              ... (クリップボードコピーのフォールバック)
//          }
// → window.open(lineUrl, "_blank"); のみにする

// 各箇所のelse {...} ブロックを削除
html = html.replace(
  /window\.open\(lineUrl, "_blank"\); else \{[^}]*\}/g,
  'window.open(lineUrl, "_blank");'
);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('else修正完了');

// 確認
const lines = html.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('line.me/R/share')) {
    console.log(`行${i+1}: ${lines[i].trim()}`);
  }
}
