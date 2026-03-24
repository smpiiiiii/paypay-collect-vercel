const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// adminToggleボタンを非表示に（幹事は自動ONなので不要）
h = h.replace(
  "document.getElementById('adminToggle').style.display = adminToken ? '' : 'none';",
  "document.getElementById('adminToggle').style.display = 'none';"
);

// 幹事モードバナーのテキスト変更
h = h.replace(
  '🔓 幹事モードON — タップで確認チェック、🗑で参加者削除',
  '🔓 タップで支払い確認、🗑で参加者削除'
);

// 作成ページの幹事説明テキストから幹事モードの言葉を消す
h = h.replace(
  '💡 <b>企画者＝幹事</b>です。作成した端末から<b>幹事モード</b>で支払い確認・メンバー管理ができます。',
  '💡 作成した端末から支払い確認・メンバー管理ができます。'
);

// 幹事モードOFF/ONのテキスト → 非表示なので無害だが一応消す
h = h.replace(/幹事モードOFF/g, '管理OFF');
h = h.replace(/🔐 幹事モード/g, '🔐 管理');
h = h.replace(/🔓 幹事モードOFF/g, '🔓 管理OFF');

// alert内の幹事モード
h = h.replace(
  '❗ 幹事権限がありません\\nイベントを作成した端末からのみ幹事モードを使えます。',
  '❗ 管理権限がありません\\nイベントを作成した端末からのみ操作できます。'
);

fs.writeFileSync('public/index.html', h, 'utf8');

// 構文チェック
const r = fs.readFileSync('public/index.html', 'utf8');
const scripts = r.match(/<script>([\s\S]*?)<\/script>/g);
let ok = true;
scripts.forEach((s, i) => {
  try { new Function(s.replace(/<\/?script>/g, '')); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR ' + e.message); ok = false; }
});

// 幹事モードの文字が残っていないかチェック
const remaining = (r.match(/幹事モード/g) || []).length;
console.log('\n「幹事モード」残存: ' + remaining + '箇所');
console.log(ok ? '✅ 構文OK' : '❌ 構文エラー');
