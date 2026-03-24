// API修正: join時にadminTokenがある場合、自動的にpaid=trueにする
const fs = require('fs');
let api = fs.readFileSync('api/index.js', 'utf8');

// join時のメンバー追加部分を確認して、adminToken付きなら paid=true にする
// 現在: event.members.push({ name, tier, amount, paid: false, ...
// → adminTokenが有効なら paid: true にする

api = api.replace(
  "event.members.push({\r\n        name, tier,\r\n        amount, paid: false, selfReported: false, confirmed: false,",
  "const isOrganizer = body.adminToken && body.adminToken === event.adminToken;\r\n      event.members.push({\r\n        name, tier,\r\n        amount, paid: isOrganizer, selfReported: false, confirmed: isOrganizer,"
);

// paidAtも設定
api = api.replace(
  "addedBy: addedBy || name, joinedAt: new Date().toISOString(), paidAt: null",
  "addedBy: addedBy || name, joinedAt: new Date().toISOString(), paidAt: isOrganizer ? new Date().toISOString() : null, actionBy: isOrganizer ? '幹事（自動）' : null"
);

fs.writeFileSync('api/index.js', api, 'utf8');

console.log('✅ isOrganizer追加:', api.includes('isOrganizer'));
console.log('✅ paid: isOrganizer:', api.includes('paid: isOrganizer'));
console.log('✅ actionBy幹事:', api.includes("actionBy: isOrganizer ? '幹事（自動）'"));
