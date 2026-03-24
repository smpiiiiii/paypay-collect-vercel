// LINE共有機能を追加するスクリプト
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// shareBtn: navigator.share → LINE共有URLに変更
html = html.replace(
  /if \(navigator\.share\) \{\s*navigator\.share\(\{ title: eventName, text: text \}\)\.catch\(function\(\) \{\}\);\s*\}/,
  'var lineUrl = "https://line.me/R/share?text=" + encodeURIComponent(text); window.open(lineUrl, "_blank");'
);

// remindBtn & remindBtnAll: navigator.share → LINE共有URLに変更（複数箇所）
html = html.replace(
  /if \(navigator\.share\) \{\s*navigator\.share\(\{ title: '支払いリマインダー', text: text \}\)\.catch\(function\(\) \{\}\);\s*\}/g,
  'var lineUrl = "https://line.me/R/share?text=" + encodeURIComponent(text); window.open(lineUrl, "_blank");'
);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('LINE共有機能に変更完了');
