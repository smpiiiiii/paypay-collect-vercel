// addToHistoryにtiers保存とmeta表示の修正
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. addToHistoryにtiers引数追加
html = html.replace(
  "function addToHistory(id, name) {",
  "function addToHistory(id, name, tiers) {"
);

// 2. history.unshift にtiers追加
html = html.replace(
  "history.unshift({ id: id, name: name, date: new Date().toISOString(), done: done });",
  "history.unshift({ id: id, name: name, date: new Date().toISOString(), done: done, tiers: tiers || (existing ? existing.tiers : null) });"
);

// 3. 作成時のaddToHistory呼び出しにtiers追加
html = html.replace(
  "addToHistory(data.id, name);",
  "addToHistory(data.id, name, tiers);"
);

// 4. イベント読込時もtiers保存
html = html.replace(
  "if (eventData && eventData.name) addToHistory(eventId, eventData.name);",
  "if (eventData && eventData.name) addToHistory(eventId, eventData.name, eventData.priceTiers || null);"
);

// 5. meta表示に区分情報追加
html = html.replace(
  `            if (h.done) {
                var doneBadge = document.createElement('span');
                doneBadge.style.cssText = 'background:#e8f5e9;color:#2e7d32;padding:1px 6px;border-radius:6px;font-weight:700;margin-left:6px';`,
  `            if (h.tiers && h.tiers.length > 0) {
                var tierSpan = document.createElement('span');
                tierSpan.style.cssText = 'display:block;font-size:9px;color:#666;margin-top:1px';
                tierSpan.textContent = h.tiers.map(function(t) { return t.label + ' \\u00A5' + (t.amount || 0).toLocaleString(); }).join(' / ');
                meta.appendChild(tierSpan);
            }
            if (h.done) {
                var doneBadge = document.createElement('span');
                doneBadge.style.cssText = 'background:#e8f5e9;color:#2e7d32;padding:1px 6px;border-radius:6px;font-weight:700;margin-left:6px';`
);

fs.writeFileSync('public/index.html', html, 'utf8');

// 検証
const result = fs.readFileSync('public/index.html', 'utf8');
console.log('✅ tiers引数:', result.includes('function addToHistory(id, name, tiers)'));
console.log('✅ tiers保存:', result.includes('tiers: tiers || (existing'));
console.log('✅ tiers渡し(作成):', result.includes('addToHistory(data.id, name, tiers)'));
console.log('✅ tiers渡し(読込):', result.includes('addToHistory(eventId, eventData.name, eventData.priceTiers'));
console.log('✅ 区分情報表示:', result.includes('tierSpan'));
console.log('✅ applyTemplate:', result.includes('function applyTemplate'));
console.log('✅ テンプレボタン:', result.includes("tplBtn"));
