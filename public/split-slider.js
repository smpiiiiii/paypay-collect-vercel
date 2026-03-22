// 割り勘スライダー機能
// メインアプリの変数（eventData, getTiers, clearChildren, adminToken, eventId, API）を参照
(function() {
    // スタイルを動的に追加
    var style = document.createElement('style');
    style.textContent = [
        '.split-total-input { display: flex; gap: 8px; align-items: center; margin-bottom: 12px }',
        '.split-total-input input { flex: 1; font-size: 18px; font-weight: 900; text-align: right; padding: 10px 14px }',
        '.split-total-input span { font-size: 14px; color: #666; flex-shrink: 0 }',
        '.split-tier { background: #fff; border-radius: 10px; padding: 12px; margin-bottom: 8px; border: 1px solid #e0e0e0 }',
        '.split-tier-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 13px; font-weight: 700 }',
        '.split-tier-header .tier-label-text { color: #333 }',
        '.split-tier-header .tier-people { color: #888; font-weight: 400 }',
        '.split-tier-amount { font-size: 22px; font-weight: 900; color: #1565c0; text-align: center; margin: 4px 0 }',
        '.split-tier-subtotal { font-size: 11px; color: #888; text-align: center; margin-bottom: 6px }',
        '.split-slider { width: 100%; -webkit-appearance: none; appearance: none; height: 8px; border-radius: 4px; background: linear-gradient(90deg, #c5cfe8, #1565c0); outline: none; cursor: pointer }',
        '.split-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 28px; height: 28px; border-radius: 50%; background: #fff; border: 3px solid #1565c0; box-shadow: 0 2px 6px rgba(0,0,0,.2); cursor: pointer }',
        '.split-slider::-moz-range-thumb { width: 28px; height: 28px; border-radius: 50%; background: #fff; border: 3px solid #1565c0; box-shadow: 0 2px 6px rgba(0,0,0,.2); cursor: pointer }',
        '.split-summary { border-radius: 10px; padding: 10px; font-size: 12px; line-height: 1.6 }',
        '.split-summary .match { font-weight: 900; font-size: 14px; text-align: center; margin-top: 4px }',
        '.split-summary .mismatch { font-weight: 700; text-align: center; margin-top: 4px }',
        '.split-apply-btn { margin-top: 8px }'
    ].join('\n');
    document.head.appendChild(style);

    // 状態管理
    var splitTotal = 0;
    var splitTiers = [];

    // メインアプリからの呼び出し用
    window.initSplitSliders = function(eventData, getTiers) {
        var container = document.getElementById('splitSliders');
        if (!container || !eventData) return;
        container.innerHTML = '';

        var tiers = getTiers();
        var members = eventData.members || [];
        if (tiers.length === 0 || members.length === 0) {
            container.innerHTML = '<div style="text-align:center;font-size:12px;color:#999;padding:8px">参加者がいません</div>';
            return;
        }

        // 区分ごとの人数を計算
        splitTiers = tiers.map(function(t) {
            var count = members.filter(function(m) { return m.tier === t.label; }).length;
            return { label: t.label, count: count, amount: t.amount || 0 };
        }).filter(function(t) { return t.count > 0; });

        // 合計金額が未入力なら現在の合計を初期値に
        var totalInput = document.getElementById('splitTotal');
        if (!splitTotal && totalInput) {
            var currentTotal = 0;
            splitTiers.forEach(function(t) { currentTotal += t.amount * t.count; });
            if (currentTotal > 0) {
                splitTotal = currentTotal;
                totalInput.value = currentTotal;
            }
        }

        renderSliders();
    };

    function renderSliders() {
        var container = document.getElementById('splitSliders');
        if (!container) return;
        container.innerHTML = '';

        var totalPeople = 0;
        splitTiers.forEach(function(t) { totalPeople += t.count; });
        if (splitTotal <= 0 || totalPeople === 0) return;

        var maxPerPerson = splitTotal;

        splitTiers.forEach(function(tier, idx) {
            var div = document.createElement('div');
            div.className = 'split-tier';

            // ヘッダー
            var header = document.createElement('div');
            header.className = 'split-tier-header';
            var labelSpan = document.createElement('span');
            labelSpan.className = 'tier-label-text';
            labelSpan.textContent = tier.label;
            var peopleSpan = document.createElement('span');
            peopleSpan.className = 'tier-people';
            peopleSpan.textContent = tier.count + '人';
            header.appendChild(labelSpan);
            header.appendChild(peopleSpan);

            // 金額表示
            var amountDiv = document.createElement('div');
            amountDiv.className = 'split-tier-amount';
            amountDiv.id = 'splitAmt_' + idx;
            amountDiv.textContent = '¥' + (tier.amount || 0).toLocaleString() + '/人';

            // 小計
            var subtotalDiv = document.createElement('div');
            subtotalDiv.className = 'split-tier-subtotal';
            subtotalDiv.id = 'splitSub_' + idx;
            subtotalDiv.textContent = '小計: ¥' + ((tier.amount || 0) * tier.count).toLocaleString();

            // スライダー
            var slider = document.createElement('input');
            slider.type = 'range';
            slider.className = 'split-slider';
            slider.min = '0';
            slider.max = String(maxPerPerson);
            slider.step = '100';
            slider.value = String(tier.amount || 0);
            slider.id = 'splitSlider_' + idx;
            (function(i) {
                slider.addEventListener('input', function() {
                    var val = parseInt(this.value) || 0;
                    val = Math.round(val / 100) * 100;
                    splitTiers[i].amount = val;
                    updateDisplay();
                });
            })(idx);

            div.appendChild(header);
            div.appendChild(amountDiv);
            div.appendChild(subtotalDiv);
            div.appendChild(slider);
            container.appendChild(div);
        });

        updateDisplay();
    }

    function updateDisplay() {
        var allocated = 0;

        splitTiers.forEach(function(tier, idx) {
            var amtEl = document.getElementById('splitAmt_' + idx);
            var subEl = document.getElementById('splitSub_' + idx);
            var subtotal = tier.amount * tier.count;
            allocated += subtotal;
            if (amtEl) amtEl.textContent = '¥' + tier.amount.toLocaleString() + '/人';
            if (subEl) subEl.textContent = '小計: ¥' + subtotal.toLocaleString();
        });

        // サマリー
        var summaryEl = document.getElementById('splitSummary');
        if (summaryEl) {
            summaryEl.innerHTML = '';
            var diff = splitTotal - allocated;
            var summaryDiv = document.createElement('div');
            summaryDiv.className = 'split-summary';

            var lines = splitTiers.map(function(t) {
                return t.label + ' ' + t.count + '人 × ¥' + t.amount.toLocaleString() + ' = ¥' + (t.amount * t.count).toLocaleString();
            });

            var detailDiv = document.createElement('div');
            detailDiv.textContent = lines.join(' / ');
            summaryDiv.appendChild(detailDiv);

            var matchDiv = document.createElement('div');
            if (diff === 0) {
                matchDiv.className = 'match';
                matchDiv.textContent = '✅ 合計 ¥' + splitTotal.toLocaleString() + ' ぴったり！';
                summaryDiv.style.background = 'linear-gradient(135deg, #e8f5e9, #c8e6c9)';
                summaryDiv.style.border = '1px solid #a5d6a7';
                summaryDiv.style.color = '#2e7d32';
            } else {
                matchDiv.className = 'mismatch';
                var sign = diff > 0 ? '+' : '';
                matchDiv.textContent = '⚠️ 差額: ' + sign + '¥' + diff.toLocaleString() + '（配分: ¥' + allocated.toLocaleString() + ' / 合計: ¥' + splitTotal.toLocaleString() + '）';
                summaryDiv.style.background = 'linear-gradient(135deg, #fff3e0, #ffe8cc)';
                summaryDiv.style.border = '1px solid #ffcc80';
                summaryDiv.style.color = '#e65100';
            }
            summaryDiv.appendChild(matchDiv);
            summaryEl.appendChild(summaryDiv);
        }

        // 確定ボタンの表示
        var applyBtn = document.getElementById('splitApplyBtn');
        if (applyBtn) {
            var hasToken = false;
            try { hasToken = !!localStorage.getItem('collect_admin_' + location.pathname.split('/')[2]); } catch(e) {}
            applyBtn.style.display = hasToken ? '' : 'none';
        }
    }

    // 合計金額入力
    var totalInput = document.getElementById('splitTotal');
    if (totalInput) {
        totalInput.addEventListener('input', function() {
            splitTotal = parseInt(this.value) || 0;
            if (splitTotal > 0 && splitTiers.length > 0) {
                // 均等配分（100円単位）
                var totalPeople = 0;
                splitTiers.forEach(function(t) { totalPeople += t.count; });
                var perPerson = Math.floor(splitTotal / totalPeople / 100) * 100;
                splitTiers.forEach(function(t) { t.amount = perPerson; });
                // 端数調整
                var alloc = 0;
                splitTiers.forEach(function(t) { alloc += t.amount * t.count; });
                var rem = splitTotal - alloc;
                if (rem > 0 && splitTiers.length > 0) {
                    var last = splitTiers[splitTiers.length - 1];
                    last.amount += Math.ceil(rem / last.count / 100) * 100;
                }
                // スライダー値を更新
                splitTiers.forEach(function(t, idx) {
                    var s = document.getElementById('splitSlider_' + idx);
                    if (s) { s.max = String(splitTotal); s.value = String(t.amount); }
                });
                updateDisplay();
            } else {
                renderSliders();
            }
        });
    }

    // 確定ボタン
    var applyBtn = document.getElementById('splitApplyBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            var eventId = location.pathname.split('/')[2];
            var adminToken = '';
            try { adminToken = localStorage.getItem('collect_admin_' + eventId) || ''; } catch(e) {}
            if (!adminToken) { alert('❗ 幹事権限が必要です'); return; }

            var newTiers = splitTiers.map(function(t) {
                return { label: t.label, amount: t.amount, paypayLink: '' };
            });
            var xhr = new XMLHttpRequest();
            xhr.open('POST', location.origin + '/api/update-tiers/' + eventId, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    alert('✅ 金額を更新しました！');
                    location.reload();
                } else if (xhr.status === 403) {
                    alert('❗ 幹事権限がありません');
                }
            };
            xhr.onerror = function() { alert('通信エラー'); };
            xhr.send(JSON.stringify({ priceTiers: newTiers, adminToken: adminToken }));
        });
    }
})();
