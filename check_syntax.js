// renderHistory関数の括弧バランスを確認
const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const matches = html.match(/<script>([\s\S]*?)<\/script>/g);
const script = matches[1].replace(/<\/?script>/g, '');
const lines = script.split('\n');

// renderHistory関数(行100〜170くらい)を表示
let inRender = false;
let curly = 0;
// まず開始位置を見つける
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function renderHistory()')) {
    inRender = true;
    // それまでのcurlyを計算
    curly = 0;
    for (let j = 0; j <= i; j++) {
      for (const c of lines[j]) { if (c === '{') curly++; if (c === '}') curly--; }
    }
    console.log('renderHistory開始: 行' + (i+1) + ' curly=' + curly);
  }
  if (inRender) {
    let delta = 0;
    for (const c of lines[i]) { if (c === '{') delta++; if (c === '}') delta--; }
    if (lines[i].trim()) {
      console.log(`${i+1}: [c=${curly}] ${lines[i].trimEnd()}`);
    }
    curly += delta;
    // 関数が閉じたら終了
    if (curly <= 1 && i > 100) {
      console.log('=== renderHistory関数終了 行' + (i+1) + ' ===');
      break;
    }
  }
}
