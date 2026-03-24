// doneBtnのJS部分とHTML appendを削除、テンプレボタンのクラス名も修正
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');

// 行467-475 (doneBtn生成) を削除
// 行544 (card.appendChild(doneBtn)) を削除
// 行532 (tplBtn.className = 'h-done-btn') をbtn-smに変更
let newLines = [];
for (let i = 0; i < lines.length; i++) {
  const num = i + 1;
  // doneBtn生成コード(467-475付近)をスキップ
  if (lines[i].includes("var doneBtn = document.createElement('button')") ||
      lines[i].includes("doneBtn.className = 'h-done-btn'") ||
      lines[i].includes("doneBtn.textContent = h.done") ||
      lines[i].includes("doneBtn.title = h.done") ||
      lines[i].includes("doneBtn.addEventListener('click'") ||
      lines[i].includes("toggleHistoryDone(hid)") ||
      lines[i].includes("card.appendChild(doneBtn)")) {
    // ただし toggleHistoryDone の定義自体は残す
    if (lines[i].includes('function toggleHistoryDone')) {
      newLines.push(lines[i]);
    }
    continue;
  }
  // doneBtnのIIFE行もスキップ
  if (lines[i].trim() === '})(h.id);' && i > 0 && lines[i-1] && lines[i-1].includes('toggleHistoryDone')) {
    continue;
  }
  // tplBtn のクラスを修正
  if (lines[i].includes("tplBtn.className = 'h-done-btn'")) {
    newLines.push(lines[i].replace("tplBtn.className = 'h-done-btn'", "tplBtn.className = 'h-del-btn'"));
  } else {
    newLines.push(lines[i]);
  }
}

html = newLines.join('\n');
fs.writeFileSync('public/index.html', html, 'utf8');

// 検証
const result = fs.readFileSync('public/index.html', 'utf8');
console.log('✅ doneBtn削除:', !result.includes("doneBtn.className"));
console.log('✅ appendChild(doneBtn)削除:', !result.includes("appendChild(doneBtn)"));
console.log('✅ tplBtnクラス修正:', result.includes("tplBtn.className = 'h-del-btn'"));
console.log('✅ toggleHistoryDone関数保持:', result.includes('toggleHistoryDone'));
