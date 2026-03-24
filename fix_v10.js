const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. 幹事説明テキスト + 幹事モードON表示を削除
// ============================================
// イベントページの adminHelpText を非表示
h = h.replace(
  "document.getElementById('adminHelpText').style.display = adminToken ? '' : 'none';",
  "document.getElementById('adminHelpText').style.display = 'none';"
);

// 幹事モード自動ON時のテキスト変更を削除（ボタン自体はそのまま）
h = h.replace(
  `            // 幹事は自動的に幹事モードON
            if (adminToken) {
                isAdmin = true;
                document.getElementById('adminToggle').textContent = '\\uD83D\\uDD13 幹事モード ON';
                document.getElementById('adminToggle').classList.add('active');
            }`,
  `            // 幹事は自動的に幹事モードON（表示はそのまま）
            if (adminToken) {
                isAdmin = true;
            }`
);

// ============================================
// 2. 割り勘スライダー: 合計額ベースに変更 + 連動
// ============================================
// 既存のupdateSplitSliders と recalcSplit を置換
h = h.replace(
  /function updateSplitSliders\(\) \{[\s\S]*?function recalcSplit[\s\S]*?\n    \}\n/,
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
            splitResultDiv.textContent = '合計金額を入力すると自動計算します';
            return;
        }
        var total = parseInt(splitTotalInput.value) || 0;
        var perTier = total > 0 ? Math.round(total / tierNames.length) : 0;
        for (var j = 0; j < tierNames.length; j++) {
            var sr = document.createElement('div');
            sr.className = 'split-row';
            var maxVal = total > 0 ? total : 100000;
            sr.innerHTML = '<label>' + tierNames[j].name + '</label><input type="range" min="0" max="' + maxVal + '" value="' + perTier + '" step="100" data-idx="' + j + '"><span class="split-val">\\u00A5' + perTier.toLocaleString() + '/人</span>';
            splitSlidersDiv.appendChild(sr);
        }
        var sliders = splitSlidersDiv.querySelectorAll('input[type=range]');
        for (var s = 0; s < sliders.length; s++) {
            (function(idx) { sliders[idx].addEventListener('input', function() { recalcSplit(tierNames, idx); }); })(s);
        }
        splitTotalInput.oninput = function() { updateSplitSliders(); };
        recalcSplit(tierNames, -1);
    }

    function recalcSplit(tierNames, changedIdx) {
        var total = parseInt(splitTotalInput.value) || 0;
        var sliders = splitSlidersDiv.querySelectorAll('input[type=range]');
        var vals = splitSlidersDiv.querySelectorAll('.split-val');
        if (sliders.length < 2 || total === 0) return;

        // スライダーのmaxを合計額に更新
        for (var u = 0; u < sliders.length; u++) sliders[u].max = total;

        // 連動: 変更したスライダーの残りを他に配分
        if (changedIdx >= 0) {
            var changedVal = parseInt(sliders[changedIdx].value);
            var remaining = total - changedVal;
            var otherCount = sliders.length - 1;
            var otherEach = Math.round(remaining / otherCount);
            for (var o = 0; o < sliders.length; o++) {
                if (o !== changedIdx) {
                    sliders[o].value = Math.max(0, otherEach);
                }
            }
        }

        // 各区分の金額を表示・反映
        var resultParts = [];
        for (var m = 0; m < sliders.length; m++) {
            var perPerson = parseInt(sliders[m].value) || 0;
            vals[m].textContent = '\\u00A5' + perPerson.toLocaleString() + '/人';
            resultParts.push(tierNames[m].name + ': \\u00A5' + perPerson.toLocaleString() + '/人');
            var amtInput = tierNames[m].row.querySelector('.tier-amount');
            if (amtInput) amtInput.value = perPerson;
        }
        splitResultDiv.textContent = resultParts.join(' / ') + ' (合計: \\u00A5' + total.toLocaleString() + ')';
    }

`
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
console.log(ok ? '\n✅ ALL OK' : '\n❌ FAIL');
