const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// イベントページ用スライダーJS（eventDataから描画）を追加
// 作成ページ用の古いcheckSplitMode/updateSplitSliders/recalcSplitは無効化済み
// ============================================

// イベントページのrenderMembers関数の後に、スライダー描画関数を追加
const evSliderJS = `
    // ===== イベントページ割り勘スライダー =====
    function renderEvSplitSlider() {
        var container = document.getElementById('evSplitSliders');
        var totalInput = document.getElementById('evSplitTotal');
        var summaryDiv = document.getElementById('evSplitSummary');
        var applyBtn = document.getElementById('evSplitApplyBtn');
        if (!container || !totalInput || !eventData) return;

        var tiers = eventData.priceTiers || [];
        if (tiers.length < 2) return;

        container.innerHTML = '';

        // ラベル行
        var labelRow = document.createElement('div');
        labelRow.style.cssText = 'display:flex;justify-content:space-between;font-size:13px;color:#1a237e;margin-bottom:4px;font-weight:bold';
        labelRow.innerHTML = '<span>' + tiers[0].label + '</span><span>' + tiers[1].label + '</span>';
        container.appendChild(labelRow);

        // 1本スライダー
        var total = parseInt(totalInput.value) || 0;
        var slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = String(total || 100000);
        slider.value = String(total ? Math.round(total / 2) : 0);
        slider.step = '100';
        slider.style.cssText = 'width:100%;margin:6px 0;cursor:pointer;height:32px';
        container.appendChild(slider);

        // 金額表示行
        var amtRow = document.createElement('div');
        amtRow.style.cssText = 'display:flex;justify-content:space-between;font-size:16px;font-weight:900;color:#1a237e';
        amtRow.innerHTML = '<span id="evAmt0">-</span><span id="evAmt1">-</span>';
        container.appendChild(amtRow);

        function updateDisplay() {
            var t = parseInt(totalInput.value) || 0;
            slider.max = String(t);
            var a = parseInt(slider.value) || 0;
            if (a > t) { a = t; slider.value = t; }
            var b = t - a;
            document.getElementById('evAmt0').textContent = '\\u00A5' + a.toLocaleString() + '/人';
            document.getElementById('evAmt1').textContent = '\\u00A5' + b.toLocaleString() + '/人';
            if (summaryDiv) summaryDiv.textContent = tiers[0].label + ': \\u00A5' + a.toLocaleString() + ' / ' + tiers[1].label + ': \\u00A5' + b.toLocaleString();
            if (applyBtn && t > 0) {
                applyBtn.style.display = '';
                applyBtn.onclick = function() {
                    if (!confirm(tiers[0].label + ': \\u00A5' + a.toLocaleString() + '/人\\n' + tiers[1].label + ': \\u00A5' + b.toLocaleString() + '/人\\n\\nこの金額で確定しますか？')) return;
                    var newTiers = [];
                    for (var ti = 0; ti < tiers.length; ti++) {
                        var newAmt = ti === 0 ? a : (ti === 1 ? b : tiers[ti].amount);
                        newTiers.push({ label: tiers[ti].label, amount: newAmt, amountType: 'fixed' });
                    }
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', API + '/api/event/' + eventId + '/updateTiers', true);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.onload = function() {
                        if (xhr.status === 200) {
                            alert('\\u2705 金額を確定しました！');
                            location.reload();
                        } else {
                            alert('エラー: ' + xhr.responseText);
                        }
                    };
                    xhr.send(JSON.stringify({ adminToken: adminToken, priceTiers: newTiers }));
                };
            }
        }

        slider.addEventListener('input', updateDisplay);
        totalInput.addEventListener('input', function() {
            slider.max = String(parseInt(totalInput.value) || 0);
            var t = parseInt(totalInput.value) || 0;
            slider.value = String(Math.round(t / 2));
            updateDisplay();
        });
        updateDisplay();
    }
`;

// renderMembers関数の呼び出し直後にrenderEvSplitSlider呼び出しを追加
h = h.replace(
  '    // ===== 長押しでコピー機能 =====',
  evSliderJS + '\n    // ===== 長押しでコピー機能 ====='
);

// renderMembers呼び出し後にrenderEvSplitSliderも呼ぶ
h = h.replace(
  'renderMembers(eventData.members);',
  'renderMembers(eventData.members);\n                renderEvSplitSlider();'
);

fs.writeFileSync('public/index.html', h, 'utf8');

const r = fs.readFileSync('public/index.html', 'utf8');
r.match(/<script>([\s\S]*?)<\/script>/g).forEach((s, i) => {
  try { new Function(s.replace(/<\/?script>/g, '')); console.log('Script ' + i + ': OK'); }
  catch(e) { console.log('Script ' + i + ': ERR ' + e.message); }
});
console.log('renderEvSplitSlider:', r.includes('renderEvSplitSlider'));
console.log('evAmt0:', r.includes('evAmt0'));
