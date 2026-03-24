const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// 1. 区分変更ボタン生成コード削除 (行1525-1540)
h = h.replace(
  /        \/\/ 区分変更ボタン: 区分が2つ以上ある場合、権限のある人に表示\r?\n[\s\S]*?actionsDiv\.appendChild\(changeBtn\);\r?\n        \}\r?\n/,
  ''
);

// 2. changeTier関数削除 (行1647-1671)
h = h.replace(
  /    \/\/ ===== 区分変更 =====\r?\n    function changeTier[\s\S]*?\}\r?\n\r?\n/,
  ''
);

// 3. ヘルプテキストの「区分変更」を削除
h = h.replace(
  '自分</b>と<b>自分が招待した人</b>は区分変更・削除ができます',
  '自分</b>と<b>自分が招待した人</b>は削除ができます'
);

fs.writeFileSync('public/index.html', h, 'utf8');

// チェック
const r = fs.readFileSync('public/index.html', 'utf8');
r.match(/<script>([\s\S]*?)<\/script>/g).forEach((s, i) => {
  try { new Function(s.replace(/<\/?script>/g, '')); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR ' + e.message); }
});

const remaining = (r.match(/changeTier|区分変更/g) || []);
console.log('changeTier/区分変更 残り:', remaining.length === 0 ? 'なし ✅' : remaining);
