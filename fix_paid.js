// 済バッジ長押しで支払い情報を表示する機能を追加
const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// ============================================
// 1. バッジに長押しで情報表示機能を追加
// ============================================
// 行1178-1192: badge生成部分の後に長押しイベントを追加
// badge生成コードの後（actionsDiv.appendChild(badge)の後）に長押し処理を挿入

const badgeAppendLine = "        actionsDiv.appendChild(badge);";

// バッジ生成後に長押し情報を追加
const longPressBadgeCode = `        actionsDiv.appendChild(badge);

        // 済バッジ長押しで支払い情報を表示
        if (m.paid) {
            (function(member, badgeEl) {
                var timer = null;
                function showInfo() {
                    var info = [];
                    if (member.paidAt) {
                        info.push('💰 支払日時: ' + new Date(member.paidAt).toLocaleString('ja-JP'));
                    }
                    if (member.selfReported) {
                        info.push('📝 本人が自己申告');
                    }
                    if (member.actionBy) {
                        info.push('👤 操作者: ' + member.actionBy);
                    }
                    if (member.confirmed) {
                        info.push('✅ 幹事が確認済み');
                    }
                    if (info.length === 0) info.push('支払い済み');
                    alert(member.name + ' の支払い情報\\n\\n' + info.join('\\n'));
                }
                function onStart(e) {
                    timer = setTimeout(function() { timer = 'done'; showInfo(); }, 600);
                }
                function onEnd(e) {
                    if (timer === 'done') { e.preventDefault(); e.stopPropagation(); }
                    else clearTimeout(timer);
                    timer = null;
                }
                badgeEl.style.cursor = 'pointer';
                badgeEl.addEventListener('touchstart', onStart, { passive: true });
                badgeEl.addEventListener('touchend', onEnd);
                badgeEl.addEventListener('touchcancel', function() { clearTimeout(timer); timer = null; });
                badgeEl.addEventListener('mousedown', onStart);
                badgeEl.addEventListener('mouseup', onEnd);
                badgeEl.addEventListener('mouseleave', function() { clearTimeout(timer); timer = null; });
            })(m, badge);
        }`;

html = html.replace(badgeAppendLine, longPressBadgeCode);

// ============================================
// 2. APIがactionByを返しているか確認するため、APIコードも確認
// ============================================

fs.writeFileSync('public/index.html', html, 'utf8');

// 検証
const result = fs.readFileSync('public/index.html', 'utf8');
console.log('✅ 済バッジ長押し機能:', result.includes('支払い情報'));
console.log('✅ actionBy表示:', result.includes('member.actionBy'));
console.log('✅ paidAt表示:', result.includes('member.paidAt'));
console.log('✅ イベント作成保持:', result.includes("xhr.open('POST', API + '/api/create'"));
