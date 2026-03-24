// tierSpanの挿入を別の方法で
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// doneBadge の行を探して、その前にtierSpanを挿入
// if (h.done) { のパターンで検索（renderHistory内）
const marker = "if (h.done) {\r\n                var doneBadge";
if (html.includes(marker)) {
  html = html.replace(marker,
    `if (h.tiers && h.tiers.length > 0) {
                var tierSpan = document.createElement('span');
                tierSpan.style.cssText = 'display:block;font-size:9px;color:#666;margin-top:1px';
                tierSpan.textContent = h.tiers.map(function(t) { return t.label + ' \\u00A5' + (t.amount || 0).toLocaleString(); }).join(' / ');
                meta.appendChild(tierSpan);
            }
            if (h.done) {\r\n                var doneBadge`);
  console.log('✅ tierSpan挿入成功');
} else {
  // \nの場合
  const marker2 = "if (h.done) {\n                var doneBadge";
  if (html.includes(marker2)) {
    html = html.replace(marker2,
      `if (h.tiers && h.tiers.length > 0) {
                var tierSpan = document.createElement('span');
                tierSpan.style.cssText = 'display:block;font-size:9px;color:#666;margin-top:1px';
                tierSpan.textContent = h.tiers.map(function(t) { return t.label + ' \\u00A5' + (t.amount || 0).toLocaleString(); }).join(' / ');
                meta.appendChild(tierSpan);
            }
            if (h.done) {\n                var doneBadge`);
    console.log('✅ tierSpan挿入成功(LF版)');
  } else {
    console.log('❌ マーカーが見つかりません');
    // 行単位で探す
    const lines = html.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('h.done') && lines[i+1] && lines[i+1].includes('doneBadge')) {
        console.log(`${i+1}: ${JSON.stringify(lines[i])}`);
        console.log(`${i+2}: ${JSON.stringify(lines[i+1])}`);
      }
    }
  }
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('tierSpan含む:', html.includes('tierSpan'));
