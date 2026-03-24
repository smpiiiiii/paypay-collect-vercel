// 金額表示の未定対応 + 割り勘スライダー連動UI
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. イベントページの区分選択で未定表示
// ============================================
// 行1073: 参加フォームのtier select
html = html.replace(
  "opt.textContent = (tiers[k].label || '一般') + '（¥' + (tiers[k].amount || 0).toLocaleString() + '）';",
  "var tierAmtLabel = (tiers[k].amountType === 'tbd') ? '未定' : (tiers[k].amountType === 'split') ? '割り勘' : '¥' + (tiers[k].amount || 0).toLocaleString();\n            opt.textContent = (tiers[k].label || '一般') + '（' + tierAmtLabel + '）';"
);

// 行767: イベント名下のtierInfo表示
html = html.replace(
  "tierInfo = tiers.map(function(t) { return t.label + ': ¥' + (t.amount || 0).toLocaleString(); }).join(' / ');",
  "tierInfo = tiers.map(function(t) { var al = (t.amountType === 'tbd') ? '未定' : (t.amountType === 'split') ? '割り勘' : '¥' + (t.amount || 0).toLocaleString(); return t.label + ': ' + al; }).join(' / ');"
);

// 行769: 単一tierの場合
html = html.replace(
  "tierInfo = '¥' + (tiers[0].amount || 0).toLocaleString() + '/人';",
  "tierInfo = (tiers[0].amountType === 'tbd') ? '金額未定' : (tiers[0].amountType === 'split') ? '割り勘' : '¥' + (tiers[0].amount || 0).toLocaleString() + '/人';"
);

// 行1263: メンバーカードのtierBadge
html = html.replace(
  "tierBadge.textContent = (m.tier || '一般') + ' ¥' + (m.amount || 0).toLocaleString();",
  "var mAmtLabel = (m.amount === 0 && eventData) ? (function() { var ti = (eventData.priceTiers || []).find(function(t) { return t.label === m.tier; }); return ti && ti.amountType === 'tbd' ? '未定' : ti && ti.amountType === 'split' ? '割り勘' : '¥0'; })() : '¥' + (m.amount || 0).toLocaleString();\n        tierBadge.textContent = (m.tier || '一般') + ' ' + mAmtLabel;"
);

// 行1475: changeTier時のalert
html = html.replace(
  "msg += (i + 1) + '. ' + options[i].label + '（¥' + (options[i].amount || 0).toLocaleString() + '）\\n';",
  "var ctAmtLabel = (options[i].amountType === 'tbd') ? '未定' : (options[i].amountType === 'split') ? '割り勘' : '¥' + (options[i].amount || 0).toLocaleString();\n            msg += (i + 1) + '. ' + options[i].label + '（' + ctAmtLabel + '）\\n';"
);

// ============================================
// 2. 割り勘モード: 合計金額入力UI + 連動スライダー
// ============================================
// addTierRow内のamountType changeイベントを強化
// 割り勘選択時にスライダーUIを表示

// 割り勘制御UIをtier-row CSSの後に追加
html = html.replace(
  ".tier-row { display: flex; gap: 4px; margin-bottom: 8px; align-items: center; flex-wrap: wrap }",
  `.tier-row { display: flex; gap: 4px; margin-bottom: 8px; align-items: center; flex-wrap: wrap }
        #splitCalcUI { background: #1a2332; border: 1px solid #2a3f5f; border-radius: 12px; padding: 14px; margin: 10px 0; display: none }
        #splitCalcUI .split-header { font-size: 13px; font-weight: bold; color: #64b5f6; margin-bottom: 10px }
        #splitCalcUI .split-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 12px; color: #ccc }
        #splitCalcUI .split-row label { min-width: 50px }
        #splitCalcUI .split-row input[type=range] { flex: 1 }
        #splitCalcUI .split-row .split-val { min-width: 70px; text-align: right; font-weight: bold; color: #fff }`
);

// 割り勘UIのHTML（tierRows直後に追加）
html = html.replace(
  '<button type="button" class="add-tier-btn" id="addTierBtn">＋ 区分を追加</button>',
  `<div id="splitCalcUI">
                <div class="split-header">💱 割り勘計算</div>
                <div class="split-row">
                    <label>合計</label>
                    <input type="number" id="splitTotal" placeholder="合計金額" inputmode="numeric" style="flex:1;padding:8px;border-radius:8px;border:1px solid #333;background:#111;color:#fff;font-size:14px">
                    <span style="font-size:11px;color:#888">円</span>
                </div>
                <div id="splitSliders"></div>
                <div id="splitResult" style="font-size:11px;color:#888;margin-top:4px"></div>
            </div>
            <button type="button" class="add-tier-btn" id="addTierBtn">＋ 区分を追加</button>`
);

// 割り勘制御JS（createBtn listenerの前に追加）
const splitJS = `
    // ===== 割り勘連動スライダー =====
    var splitCalcUI = document.getElementById('splitCalcUI');
    var splitTotalInput = document.getElementById('splitTotal');
    var splitSlidersDiv = document.getElementById('splitSliders');
    var splitResultDiv = document.getElementById('splitResult');

    function checkSplitMode() {
        var types = tierContainer.querySelectorAll('.tier-amount-type');
        var hasSplit = false;
        for (var i = 0; i < types.length; i++) { if (types[i].value === 'split') hasSplit = true; }
        splitCalcUI.style.display = hasSplit ? 'block' : 'none';
        if (hasSplit) updateSplitSliders();
    }

    function updateSplitSliders() {
        var rows = tierContainer.querySelectorAll('.tier-row');
        splitSlidersDiv.innerHTML = '';
        var tierNames = [];
        for (var i = 0; i < rows.length; i++) {
            var nameInput = rows[i].querySelector('.tier-name');
            var typeSelect = rows[i].querySelector('.tier-amount-type');
            if (typeSelect && typeSelect.value === 'split') {
                tierNames.push({ name: nameInput.value || '区分' + (i+1), row: rows[i], index: i });
            }
        }
        if (tierNames.length < 2) {
            splitResultDiv.textContent = '※ 割り勘の区分が2つ以上必要です';
            return;
        }
        for (var j = 0; j < tierNames.length; j++) {
            var sr = document.createElement('div');
            sr.className = 'split-row';
            sr.innerHTML = '<label>' + tierNames[j].name + '</label><input type="range" min="0" max="100" value="' + Math.round(100/tierNames.length) + '" data-idx="' + j + '"><span class="split-val">¥0/人</span>';
            splitSlidersDiv.appendChild(sr);
        }
        // スライダー連動
        var sliders = splitSlidersDiv.querySelectorAll('input[type=range]');
        for (var s = 0; s < sliders.length; s++) {
            (function(idx) {
                sliders[idx].addEventListener('input', function() { recalcSplit(tierNames, idx); });
            })(s);
        }
        splitTotalInput.oninput = function() { recalcSplit(tierNames, -1); };
        recalcSplit(tierNames, -1);
    }

    function recalcSplit(tierNames, changedIdx) {
        var total = parseInt(splitTotalInput.value) || 0;
        var sliders = splitSlidersDiv.querySelectorAll('input[type=range]');
        var vals = splitSlidersDiv.querySelectorAll('.split-val');
        if (sliders.length < 2) return;

        // 連動: 変更したスライダー以外を調整
        if (changedIdx >= 0 && sliders.length === 2) {
            var otherIdx = changedIdx === 0 ? 1 : 0;
            sliders[otherIdx].value = 100 - parseInt(sliders[changedIdx].value);
        } else if (changedIdx >= 0 && sliders.length > 2) {
            var sum = 0;
            for (var i = 0; i < sliders.length; i++) sum += parseInt(sliders[i].value);
            var diff = sum - 100;
            if (diff !== 0) {
                for (var j = 0; j < sliders.length; j++) {
                    if (j !== changedIdx) {
                        var newVal = Math.max(0, parseInt(sliders[j].value) - Math.round(diff / (sliders.length - 1)));
                        sliders[j].value = newVal;
                    }
                }
            }
        }

        // 各区分の1人あたり金額を計算
        var numPerTier = [];
        for (var k = 0; k < tierNames.length; k++) {
            var countInput = tierNames[k].row.querySelector('.tier-count');
            numPerTier.push(parseInt(countInput ? countInput.value : 0) || 1);
        }

        var totalParts = 0;
        for (var p = 0; p < sliders.length; p++) totalParts += parseInt(sliders[p].value);
        if (totalParts === 0) totalParts = 1;

        var resultParts = [];
        for (var m = 0; m < sliders.length; m++) {
            var ratio = parseInt(sliders[m].value) / totalParts;
            var tierTotal = Math.round(total * ratio);
            var perPerson = numPerTier[m] > 0 ? Math.round(tierTotal / numPerTier[m]) : tierTotal;
            vals[m].textContent = '¥' + perPerson.toLocaleString() + '/人';
            resultParts.push(tierNames[m].name + ': ¥' + perPerson.toLocaleString() + '/人');
            // 金額入力に反映
            var amtInput = tierNames[m].row.querySelector('.tier-amount');
            if (amtInput) amtInput.value = perPerson;
        }
        splitResultDiv.textContent = resultParts.join(' / ') + ' (合計: ¥' + total.toLocaleString() + ')';
    }

`;
html = html.replace("    // ===== イベント作成 =====", splitJS + "    // ===== イベント作成 =====");

// addTierRowのamountType changeイベントにcheckSplitMode呼び出し追加
html = html.replace(
  "amountType.addEventListener('change', function() {\n            if (amountType.value === 'fixed') {\n                amountInput.style.display = ''; amountInput.required = true; amountInput.placeholder = '金額';\n            } else {\n                amountInput.style.display = 'none'; amountInput.required = false; amountInput.value = '0';\n            }\n        });",
  "amountType.addEventListener('change', function() {\n            if (amountType.value === 'fixed') {\n                amountInput.style.display = ''; amountInput.required = true; amountInput.placeholder = '金額';\n            } else {\n                amountInput.style.display = 'none'; amountInput.required = false; amountInput.value = '0';\n            }\n            if (typeof checkSplitMode === 'function') checkSplitMode();\n        });"
);

// ============================================
// 3. API側: amountTypeを保持するように修正はサーバー不要（priceTiersの中に含まれるため）
// ============================================

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
  ['構文OK', ok],
  ['未定表示-参加フォーム', result.includes('tierAmtLabel')],
  ['未定表示-tierInfo', result.includes("'未定'")],
  ['割り勘UI HTML', result.includes('splitCalcUI')],
  ['スライダーJS', result.includes('recalcSplit')],
  ['checkSplitMode連携', result.includes("checkSplitMode()")],
  ['メンバーカード未定', result.includes('mAmtLabel')],
];
console.log('\n=== チェック ===');
checks.forEach(([n, v]) => console.log(`${v ? '✅' : '❌'} ${n}`));
