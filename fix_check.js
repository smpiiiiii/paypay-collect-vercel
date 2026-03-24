// 紹介者表示の名前設定方法を確認・修正
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');

// addedBy周辺のコードを確認
console.log('=== addedBy 周辺コード ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('addedBy') && !lines[i].includes('JSON') && !lines[i].includes('xhr')) {
    // 前後5行を表示
    for (let j = Math.max(0, i-3); j <= Math.min(lines.length-1, i+5); j++) {
      console.log(`${j+1}: ${lines[j].trimEnd()}`);
    }
    console.log('---');
  }
}

// textContent で name を設定している箇所を確認
console.log('\n=== nameText 周辺 ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('nameText') || lines[i].includes('nameSpan') || lines[i].includes('.name')) {
    if (lines[i].includes('textContent') || lines[i].includes('innerHTML') || lines[i].includes('nameText')) {
      console.log(`${i+1}: ${lines[i].trimEnd()}`);
    }
  }
}
