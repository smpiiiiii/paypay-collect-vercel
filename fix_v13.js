const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// 現在のrecalcSplitの連動部分を、より確実な実装に置き換え
// スライダーのvalue設定後に明示的にvalueを再描画
h = h.replace(
  /function recalcSplit\(tierNames, changedIdx\) \{[\s\S]*?splitResultDiv\.textContent = resultParts[\s\S]*?\n    \}/,
  `function recalcSplit(tierNames, changedIdx) {
        var total = parseInt(splitTotalInput.value) || 0;
        var sliders = splitSlidersDiv.querySelectorAll('input[type=range]');
        var vals = splitSlidersDiv.querySelectorAll('.split-val');
        if (sliders.length < 2) return;
        if (total === 0) {
            for (var z = 0; z < vals.length; z++) vals[z].textContent = '\\u00A50/人';
            splitResultDiv.textContent = '合計金額を入力してください';
            return;
        }

        // maxを合計額に
        for (var u = 0; u < sliders.length; u++) sliders[u].max = total;

        // 連動: 動かしたスライダーの残りを他に分配
        if (changedIdx >= 0) {
            var changedVal = parseInt(sliders[changedIdx].value) || 0;
            if (changedVal > total) { changedVal = total; sliders[changedIdx].value = total; }
            var remaining = total - changedVal;
            var others = sliders.length - 1;
            var each = Math.floor(remaining / others);
            var extra = remaining - each * others;
            for (var o = 0; o < sliders.length; o++) {
                if (o !== changedIdx) {
                    var v = each + (extra > 0 ? 1 : 0);
                    if (extra > 0) extra--;
                    sliders[o].value = v;
                }
            }
        }

        // 表示更新
        var resultParts = [];
        var sum = 0;
        for (var m = 0; m < sliders.length; m++) {
            var amt = parseInt(sliders[m].value) || 0;
            sum += amt;
            vals[m].textContent = '\\u00A5' + amt.toLocaleString() + '/人';
            resultParts.push(tierNames[m].name + ': \\u00A5' + amt.toLocaleString() + '/人');
            var amtInput = tierNames[m].row.querySelector('.tier-amount');
            if (amtInput) amtInput.value = amt;
        }
        splitResultDiv.textContent = resultParts.join(' / ') + ' (合計: \\u00A5' + total.toLocaleString() + ')';
    }`
);

fs.writeFileSync('public/index.html', h, 'utf8');

const r = fs.readFileSync('public/index.html', 'utf8');
r.match(/<script>([\s\S]*?)<\/script>/g).forEach((s, i) => {
  try { new Function(s.replace(/<\/?script>/g, '')); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR ' + e.message); }
});
