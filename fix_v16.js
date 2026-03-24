const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// イベントページのsplit JSもevSplit*に変更
// splitApplyBtnの参照を修正
h = h.replace(/getElementById\('splitApplyBtn'\)/g, "getElementById('evSplitApplyBtn')");

// イベントページ側のsplit JS（renderSplitSliders等があれば）
// evSplitTotal, evSplitSliders, evSplitSummary への参照を修正
h = h.replace("getElementById('splitTotal')\n", "getElementById('evSplitTotal')\n");
h = h.replace("getElementById('splitSliders')\n", "getElementById('evSplitSliders')\n");
h = h.replace("getElementById('splitSummary')", "getElementById('evSplitSummary')");

// ============================================
// 集金完了ボタン: 全員を確認済みにするAPIコール追加
// ============================================
h = h.replace(
  "alert('\\uD83C\\uDF89 集金完了！\\n\\n参加者: ' + ms.length + '人\\n合計: \\u00A5' + total.toLocaleString() + '\\n\\nお疲れ様でした！');\n        toggleHistoryDone(eventId);\n        if (confirm('トップ画面に戻りますか？')) { location.href = '/'; }",
  `// 全員を確認済みにする
        if (adminToken && eventData) {
            var allMs = eventData.members || [];
            var pending = 0;
            for (var ci = 0; ci < allMs.length; ci++) {
                if (!allMs[ci].confirmed) {
                    pending++;
                    (function(mName) {
                        var cxhr = new XMLHttpRequest();
                        cxhr.open('POST', API + '/api/event/' + eventId + '/confirm', true);
                        cxhr.setRequestHeader('Content-Type', 'application/json');
                        cxhr.send(JSON.stringify({ adminToken: adminToken, memberName: mName }));
                    })(allMs[ci].name);
                }
            }
        }
        alert('\\uD83C\\uDF89 集金完了！\\n\\n参加者: ' + ms.length + '人\\n合計: \\u00A5' + total.toLocaleString() + '\\n\\nお疲れ様でした！');
        toggleHistoryDone(eventId);
        if (confirm('トップ画面に戻りますか？')) { location.href = '/'; }`
);

fs.writeFileSync('public/index.html', h, 'utf8');

// 構文チェック
const r = fs.readFileSync('public/index.html', 'utf8');
r.match(/<script>([\s\S]*?)<\/script>/g).forEach((s, i) => {
  try { new Function(s.replace(/<\/?script>/g, '')); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR ' + e.message); }
});

// ID衝突チェック
const ids = r.match(/id="([^"]+)"/g) || [];
const idCounts = {};
ids.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });
let dupes = Object.entries(idCounts).filter(([k,v]) => v > 1 && k.includes('split'));
console.log(dupes.length === 0 ? '\n✅ splitのID衝突なし' : '\n❌ 衝突: ' + JSON.stringify(dupes));
