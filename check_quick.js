const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g);
const code = scripts[1].replace(/<\/?script>/g, '');
const lines = code.split('\n');

// 行285-330を詳細表示
let curly = 0, paren = 0;
for (let i = 0; i < 284; i++) {
  for (const c of lines[i]) { if (c === '{') curly++; if (c === '}') curly--; if (c === '(') paren++; if (c === ')') paren--; }
}
for (let i = 284; i < 335 && i < lines.length; i++) {
  let dc = 0, dp = 0;
  for (const c of lines[i]) { if (c === '{') { curly++; dc++; } if (c === '}') { curly--; dc--; } if (c === '(') { paren++; dp++; } if (c === ')') { paren--; dp--; } }
  if (lines[i].trim()) console.log(`${i+1}: [c=${curly},p=${paren}] ${lines[i].trimEnd()}`);
}
