// テンプレートボタンの追加と適用機能の実装
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. renderHistory内の各カードに「テンプレ」ボタンを追加
// ============================================
// actionsDiv.appendChild(delBtn); の後にテンプレボタンを追加
html = html.replace(
  "actionsDiv.appendChild(delBtn);",
  `actionsDiv.appendChild(delBtn);
            // テンプレートとして使用ボタン
            if (h.tiers && h.tiers.length > 0) {
                var tplBtn = document.createElement('button');
                tplBtn.className = 'h-done-btn';
                tplBtn.style.cssText = 'background:#e3f2fd;border-color:#90caf9;font-size:11px;width:auto;padding:0 8px;border-radius:8px';
                tplBtn.textContent = '📋';
                tplBtn.title = 'この設定で新規作成';
                (function(hist) {
                    tplBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        applyTemplate(hist);
                    });
                })(h);
                actionsDiv.appendChild(tplBtn);
            }`
);

// ============================================
// 2. applyTemplate関数を追加
// ============================================
// renderHistory関数の前に追加
html = html.replace(
  "    function renderHistory() {",
  `    // テンプレート適用機能
    function applyTemplate(hist) {
        // イベント名をセット
        var nameInput = document.getElementById('createName');
        if (nameInput) nameInput.value = hist.name;
        // 既存の区分行をクリア
        var container = document.getElementById('tierRows');
        while (container.firstChild) container.removeChild(container.firstChild);
        // テンプレートの区分を適用
        if (hist.tiers && hist.tiers.length > 0) {
            for (var i = 0; i < hist.tiers.length; i++) {
                var t = hist.tiers[i];
                addTierRow(t.label || '', t.amount || '', t.paypayLink || '');
            }
        } else {
            addTierRow('男子', '', ''); addTierRow('女子', '', '');
        }
        // 作成フォームにスクロール
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // フィードバック
        nameInput.style.transition = 'background 0.3s';
        nameInput.style.background = '#e8f5e9';
        setTimeout(function() { nameInput.style.background = ''; }, 1500);
    }

    function renderHistory() {`
);

// ============================================
// 3. 区分情報がmetaに表示されるように
// ============================================
// meta.textContent の後に区分情報を追加
html = html.replace(
  `            if (h.done) {
                var doneBadge = document.createElement('span');`,
  `            if (h.tiers && h.tiers.length > 0) {
                var tierText = h.tiers.map(function(t) { return t.label + ' ¥' + (t.amount || 0).toLocaleString(); }).join(' / ');
                var tierSpan = document.createElement('span');
                tierSpan.style.cssText = 'display:block;font-size:9px;color:#666;margin-top:1px';
                tierSpan.textContent = tierText;
                meta.appendChild(tierSpan);
            }
            if (h.done) {
                var doneBadge = document.createElement('span');`
);

fs.writeFileSync('public/index.html', html, 'utf8');

// 検証
const result = fs.readFileSync('public/index.html', 'utf8');
const checks = [
  ['applyTemplate関数', result.includes('function applyTemplate')],
  ['テンプレボタン', result.includes("tplBtn.textContent = '📋'")],
  ['tiers保存(addToHistory)', result.includes('tiers: tiers || existing')],
  ['区分情報表示', result.includes('tierText')],
  ['イベント作成保持', result.includes("xhr.open('POST', API + '/api/create'")],
];
console.log('=== 検証結果 ===');
checks.forEach(([name, ok]) => console.log(`${ok ? '✅' : '❌'} ${name}`));
