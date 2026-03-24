// 区分変更ボタンのレンダリングコード(行1209-1224)を削除
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');

// 行1209(区分変更コメント)から1224(appendChild)まで削除
let newLines = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
  const lineNum = i + 1;
  // 区分変更ボタンのコメント行から開始
  if (lines[i].includes('tiersForChange = getTiers()')) {
    // この行の1行前（コメント行）も削除
    if (newLines.length > 0 && newLines[newLines.length - 1].includes('区分変更')) {
      newLines.pop();
    }
    skip = true;
  }
  if (skip && lines[i].includes('actionsDiv.appendChild(changeBtn)')) {
    // この行の }  を含む次の行まで削除
    skip = 'closing';
    continue;
  }
  if (skip === 'closing') {
    if (lines[i].trim() === '}') {
      skip = false;
      continue;
    }
  }
  if (!skip) {
    newLines.push(lines[i]);
  }
}

html = newLines.join('\n');
fs.writeFileSync('public/index.html', html, 'utf8');

// changeTier関数自体も削除
html = fs.readFileSync('public/index.html', 'utf8');
console.log('changeBtn残り:', html.includes('changeBtn'));
console.log('tiersForChange残り:', html.includes('tiersForChange'));
console.log('changeTier関数残り:', html.includes('function changeTier'));
