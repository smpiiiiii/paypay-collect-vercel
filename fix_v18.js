const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// 作成ページ: addTierBtnの前にsplitCalcUI HTML挿入
h = h.replace(
  '<span class="add-tier" id="addTierBtn">＋ 区分を追加</span>',
  `<div id="splitCalcUI" style="display:none;background:#1a2332;border:1px solid #2a3f5f;border-radius:12px;padding:14px;margin:10px 0">
                    <div style="font-size:13px;font-weight:bold;color:#64b5f6;margin-bottom:10px">\uD83D\uDCB1 割り勘計算</div>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:12px;color:#ccc">
                        <label style="min-width:40px">合計</label>
                        <input type="number" id="splitTotal" placeholder="合計金額" inputmode="numeric" style="flex:1;padding:8px;border-radius:8px;border:1px solid #333;background:#111;color:#fff;font-size:14px">
                        <span style="font-size:11px;color:#888">円</span>
                    </div>
                    <div id="splitSliders"></div>
                    <div id="splitResult" style="font-size:11px;color:#888;margin-top:4px"></div>
                </div>
                <span class="add-tier" id="addTierBtn">＋ 区分を追加</span>`
);

// JS: splitResultDiv参照追加
if (!h.includes("getElementById('splitResult')")) {
  h = h.replace(
    "var splitSlidersDiv = document.getElementById('splitSliders');",
    "var splitSlidersDiv = document.getElementById('splitSliders');\n    var splitResultDiv = document.getElementById('splitResult');"
  );
}

fs.writeFileSync('public/index.html', h, 'utf8');

// チェック
const r = fs.readFileSync('public/index.html', 'utf8');
r.match(/<script>([\s\S]*?)<\/script>/g).forEach((s, i) => {
  try { new Function(s.replace(/<\/?script>/g, '')); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR ' + e.message); }
});
console.log('splitCalcUI:', r.includes('id="splitCalcUI"'));
console.log('splitTotal:', r.includes('id="splitTotal"'));
console.log('splitSliders:', r.includes('id="splitSliders"'));
console.log('splitResult:', r.includes('id="splitResult"'));
