// 最終修正スクリプト: 壊れた構文を修正
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ");)" を ");" に修正
html = html.replace(/window\.open\(lineUrl, "_blank"\);\);/g, 'window.open(lineUrl, "_blank");');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('構文修正完了');

// 最終確認: LINE共有URL周辺の行を表示
const lines = html.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('line.me/R/share') || lines[i].includes('lineUrl')) {
    console.log(`行${i+1}: ${lines[i].trim()}`);
  }
}
