const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// 既存のupdateSplitSliders + recalcSplitを完全に置き換え
// 1スライダー方式: 左が区分1、右が区分2
h = h.replace(
  /function updateSplitSliders\(\) \{[\s\S]*?function recalcSplit[\s\S]*?\n    \}/,
  `function updateSplitSliders() {
        var rows = tierContainer.querySelectorAll('.tier-row');
        splitSlidersDiv.innerHTML = '';
        var tierNames = [];
        for (var i = 0; i < rows.length; i++) {
            var nameInput = rows[i].querySelector('.tier-name');
            var typeSelect = rows[i].querySelector('.tier-amount-type');
            if (typeSelect && typeSelect.value === 'tbd') {
                tierNames.push({ name: nameInput.value || '区分' + (i+1), row: rows[i], index: i });
            }
        }
        if (tierNames.length < 2) {
            splitResultDiv.textContent = '割り勘の区分を2つ以上にしてください';
            return;
        }
        var total = parseInt(splitTotalInput.value) || 0;

        // ラベル行
        var labelRow = document.createElement('div');
        labelRow.style.cssText = 'display:flex;justify-content:space-between;font-size:12px;color:#aaa;margin-bottom:2px';
        labelRow.innerHTML = '<span>' + tierNames[0].name + '</span><span>' + tierNames[1].name + '</span>';
        splitSlidersDiv.appendChild(labelRow);

        // 1本のスライダー（ 0 = 全部tierA、total = 全部tierA → 反転: 値 = tierAの金額 ）
        var slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = String(total || 100000);
        slider.value = String(total ? Math.round(total / tierNames.length) : 0);
        slider.step = '100';
        slider.style.cssText = 'width:100%;margin:6px 0;cursor:pointer;height:28px';
        slider.id = 'splitMainSlider';
        splitSlidersDiv.appendChild(slider);

        // 金額表示行
        var amtRow = document.createElement('div');
        amtRow.style.cssText = 'display:flex;justify-content:space-between;font-size:14px;font-weight:bold;color:#fff';
        amtRow.innerHTML = '<span id="splitAmt0">-</span><span id="splitAmt1">-</span>';
        splitSlidersDiv.appendChild(amtRow);

        function updateDisplay() {
            var t = parseInt(splitTotalInput.value) || 0;
            slider.max = String(t);
            var a = parseInt(slider.value) || 0;
            if (a > t) { a = t; slider.value = t; }
            var b = t - a;
            document.getElementById('splitAmt0').textContent = '\\u00A5' + a.toLocaleString() + '/人';
            document.getElementById('splitAmt1').textContent = '\\u00A5' + b.toLocaleString() + '/人';
            // tier行に反映
            var amt0 = tierNames[0].row.querySelector('.tier-amount');
            var amt1 = tierNames[1].row.querySelector('.tier-amount');
            if (amt0) amt0.value = a;
            if (amt1) amt1.value = b;
            splitResultDiv.textContent = tierNames[0].name + ': \\u00A5' + a.toLocaleString() + ' / ' + tierNames[1].name + ': \\u00A5' + b.toLocaleString() + ' (合計: \\u00A5' + t.toLocaleString() + ')';
        }

        slider.addEventListener('input', updateDisplay);
        splitTotalInput.addEventListener('input', function() {
            slider.max = String(parseInt(splitTotalInput.value) || 0);
            var t = parseInt(splitTotalInput.value) || 0;
            slider.value = String(Math.round(t / tierNames.length));
            updateDisplay();
        });
        updateDisplay();
    }

    // recalcSplit不要（互換用に空関数）
    function recalcSplit() {}`
);

fs.writeFileSync('public/index.html', h, 'utf8');

const r = fs.readFileSync('public/index.html', 'utf8');
r.match(/<script>([\s\S]*?)<\/script>/g).forEach((s, i) => {
  try { new Function(s.replace(/<\/?script>/g, '')); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR ' + e.message); }
});
