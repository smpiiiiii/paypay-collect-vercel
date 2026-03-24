// 壊れた重複コードを修正
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 壊れた行579-597を特定して削除し、正しいmemo取得を復元
// 壊れた部分: "var memo = (document.getElementById('cM    document.getElementById('shareBtn')..." から "});%" まで
// これを "var memo = (document.getElementById('createMemo') || {}).value || '';" に置換

// まず壊れた行の正確な内容を確認
const lines = html.split('\n');
console.log('行577-598の内容:');
for (let i = 576; i < 598; i++) {
  console.log(`${i+1}: [${lines[i]}]`);
}

// 行579から行597（});%の行）までを削除し、正しいmemoコードに置換
// 行579の内容を確認
const brokenStart = lines[578]; // 行579 (0-indexed: 578)
console.log('\n壊れた開始行:', JSON.stringify(brokenStart));

// 行579-597を正しいmemoコードに置換
const newMemoLine = "        var memo = (document.getElementById('createMemo') || {}).value || '';";

// 行579から597までを削除して1行に置換
let newLines = [];
for (let i = 0; i < lines.length; i++) {
  if (i === 578) {
    // 行579を正しいmemoコードに置換
    newLines.push(newMemoLine);
  } else if (i >= 579 && i <= 596) {
    // 行580-597を削除
    continue;
  } else {
    newLines.push(lines[i]);
  }
}

html = newLines.join('\n');
fs.writeFileSync('public/index.html', html, 'utf8');

// 修正確認
const fixedLines = html.split('\n');
console.log('\n=== 修正後 行577-605 ===');
for (let i = 576; i < 605 && i < fixedLines.length; i++) {
  console.log(`${i+1}: ${fixedLines[i].trimEnd()}`);
}
