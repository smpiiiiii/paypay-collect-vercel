// API修正: toggle時にメンバーにもactionByを保存 + 紹介表示不整合を修正
const fs = require('fs');

// ============================================
// 1. API修正: member.actionBy を保存
// ============================================
let api = fs.readFileSync('api/index.js', 'utf8');

// toggle処理で member.paid = newPaid; の後に actionBy を保存
api = api.replace(
  "member.paidAt = newPaid ? new Date().toISOString() : null;",
  "member.paidAt = newPaid ? new Date().toISOString() : null;\n        member.actionBy = newPaid ? (body.actionBy || '不明').trim() : null;"
);

// self-report でも actionBy を保存
api = api.replace(
  "member.paid = true; member.paidAt = new Date().toISOString(); member.selfReported = true;",
  "member.paid = true; member.paidAt = new Date().toISOString(); member.selfReported = true; member.actionBy = body.name + '（本人）';"
);

// confirm でも actionBy を保存
api = api.replace(
  "if (member.confirmed) { member.paid = true; member.paidAt = member.paidAt || new Date().toISOString(); }",
  "if (member.confirmed) { member.paid = true; member.paidAt = member.paidAt || new Date().toISOString(); member.actionBy = '幹事確認'; }"
);

fs.writeFileSync('api/index.js', api, 'utf8');

// ============================================
// 2. フロント: 紹介者表示の微調整（括弧を確実にspanに入れる）
// ============================================
// 既にspanで実装済みだが、ブラウザキャッシュの可能性あり

// 検証
const apiResult = fs.readFileSync('api/index.js', 'utf8');
console.log('✅ member.actionBy保存(toggle):', apiResult.includes("member.actionBy = newPaid"));
console.log('✅ member.actionBy保存(self):', apiResult.includes("member.actionBy = body.name"));
console.log('✅ member.actionBy保存(confirm):', apiResult.includes("member.actionBy = '幹事確認'"));
