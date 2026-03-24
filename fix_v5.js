// 最近の集金カードに詳細情報を追加
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. addToHistory: イベントデータからメンバー情報も保存
// ============================================
// addToHistory(id, name, tiers) → addToHistory(id, name, tiers, stats)
html = html.replace(
  "function addToHistory(id, name, tiers) {",
  "function addToHistory(id, name, tiers, stats) {"
);
html = html.replace(
  "history.unshift({ id: id, name: name, date: new Date().toISOString(), done: done, tiers: tiers || (existing ? existing.tiers : null) });",
  "history.unshift({ id: id, name: name, date: new Date().toISOString(), done: done, tiers: tiers || (existing ? existing.tiers : null), stats: stats || (existing ? existing.stats : null) });"
);

// loadEvent内のaddToHistory呼び出しにstatsを追加
html = html.replace(
  "if (eventData && eventData.name) addToHistory(eventId, eventData.name, eventData.priceTiers || null);",
  `if (eventData && eventData.name) {
                    var ms = eventData.members || [];
                    var st = { total: ms.length, paid: 0, totalAmt: 0, paidAmt: 0, tierCounts: {} };
                    for (var si = 0; si < ms.length; si++) {
                        var sm = ms[si];
                        st.totalAmt += (sm.amount || 0);
                        if (sm.paid) { st.paid++; st.paidAmt += (sm.amount || 0); }
                        var tk = sm.tier || '一般';
                        if (!st.tierCounts[tk]) st.tierCounts[tk] = { count: 0, paid: 0 };
                        st.tierCounts[tk].count++;
                        if (sm.paid) st.tierCounts[tk].paid++;
                    }
                    addToHistory(eventId, eventData.name, eventData.priceTiers || null, st);
                }`
);

// createBtn内のaddToHistory（作成時はstatsなし）
html = html.replace(
  "addToHistory(data.id, name, tiers);",
  "addToHistory(data.id, name, tiers, null);"
);

// ============================================
// 2. renderHistory: カード内に詳細情報を表示
// ============================================
// 既存のtierSpan（区分表示）をよりリッチに変更
html = html.replace(
  `            if (h.tiers && h.tiers.length > 0) {
                var tierSpan = document.createElement('span');
                tierSpan.style.cssText = 'display:block;font-size:9px;color:#666;margin-top:1px';
                tierSpan.textContent = h.tiers.map(function(t) { return t.label + ' \\u00A5' + (t.amount || 0).toLocaleString(); }).join(' / ');
                meta.appendChild(tierSpan);
            }`,
  `            // 詳細情報表示
            if (h.stats && h.stats.total > 0) {
                // 進捗: 2/5人済 ¥10,000
                var progressSpan = document.createElement('span');
                progressSpan.style.cssText = 'display:block;font-size:10px;color:#333;margin-top:2px;font-weight:600';
                var pct = Math.round(h.stats.paid / h.stats.total * 100);
                progressSpan.textContent = '\\u2705 ' + h.stats.paid + '/' + h.stats.total + '人済 (\\u00A5' + h.stats.paidAmt.toLocaleString() + '/' + h.stats.totalAmt.toLocaleString() + ')';
                if (pct === 100) progressSpan.style.color = '#2e7d32';
                meta.appendChild(progressSpan);
                // 区分ごと
                if (h.tiers && h.tiers.length > 1) {
                    var tierDiv = document.createElement('span');
                    tierDiv.style.cssText = 'display:block;font-size:9px;color:#888;margin-top:1px';
                    tierDiv.textContent = h.tiers.map(function(t) {
                        var tc = h.stats.tierCounts && h.stats.tierCounts[t.label];
                        var cnt = tc ? tc.count + '人' : '';
                        return t.label + ' \\u00A5' + (t.amount || 0).toLocaleString() + (cnt ? '(' + cnt + ')' : '');
                    }).join(' / ');
                    meta.appendChild(tierDiv);
                }
            } else if (h.tiers && h.tiers.length > 0) {
                var tierSpan = document.createElement('span');
                tierSpan.style.cssText = 'display:block;font-size:9px;color:#666;margin-top:1px';
                tierSpan.textContent = h.tiers.map(function(t) { return t.label + ' \\u00A5' + (t.amount || 0).toLocaleString(); }).join(' / ');
                meta.appendChild(tierSpan);
            }`
);

fs.writeFileSync('public/index.html', html, 'utf8');

// 構文チェック
const result = fs.readFileSync('public/index.html', 'utf8');
const scripts = result.match(/<script>([\s\S]*?)<\/script>/g);
let ok = true;
scripts.forEach((s, i) => {
  const code = s.replace(/<\/?script>/g, '');
  try { new Function(code); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR: ' + e.message); ok = false; }
});

const checks = [
  ['stats引数追加', result.includes('function addToHistory(id, name, tiers, stats)')],
  ['stats保存', result.includes('stats: stats ||')],
  ['stats計算', result.includes('st.tierCounts')],
  ['進捗表示', result.includes('progressSpan')],
  ['区分人数表示', result.includes('tierCounts[t.label]')],
  ['構文OK', ok],
];
console.log('\n=== チェック ===');
checks.forEach(([n, v]) => console.log(`${v ? '✅' : '❌'} ${n}`));
