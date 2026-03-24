// PayPay集金チェッカー — Vercel サーバーレスAPI
// Upstash Redis でデータ永続化
const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

// Upstash Redis クライアント（環境変数から自動設定）
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// イベントデータの読み書き
async function getEvent(id) {
  const data = await redis.get(`event:${id}`);
  return data || null;
}
async function saveEvent(id, event) {
  await redis.set(`event:${id}`, JSON.stringify(event));
}

// リクエストボディ取得
async function parseBody(req) {
  if (req.body) return req.body;
  return {};
}

/**
 * 旧形式のイベントデータを新形式にマイグレーションする
 */
function migrateEvent(event) {
  if (!Array.isArray(event.priceTiers) || event.priceTiers.length === 0) {
    event.priceTiers = [{ label: '一般', amount: event.amount || 0, paypayLink: '' }];
  }
  for (let i = 0; i < event.priceTiers.length; i++) {
    if (event.priceTiers[i].paypayLink === undefined) event.priceTiers[i].paypayLink = '';
  }
  if (!event.adminToken) event.adminToken = crypto.randomBytes(16).toString('hex');
  if (Array.isArray(event.members)) {
    for (let i = 0; i < event.members.length; i++) {
      const m = event.members[i];
      if (m.tier === undefined) m.tier = event.priceTiers[0]?.label || '一般';
      if (m.amount === undefined) m.amount = event.priceTiers[0]?.amount || 0;
      if (m.selfReported === undefined) m.selfReported = false;
      if (m.confirmed === undefined) m.confirmed = false;
    }
  } else {
    event.members = [];
  }
  return event;
}

module.exports = async (req, res) => {
  // CORS対応
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, `https://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // API: イベント作成
    if (pathname === '/api/create' && req.method === 'POST') {
      const body = await parseBody(req);
      const id = crypto.randomBytes(4).toString('hex');
      const adminToken = crypto.randomBytes(16).toString('hex');
      const tiers = Array.isArray(body.priceTiers) && body.priceTiers.length > 0
        ? body.priceTiers.filter(t => t.label).map(t => ({ label: t.label, amount: t.amount || 0, paypayLink: t.paypayLink || '' }))
        : [{ label: '一般', amount: body.amount || 0, paypayLink: '' }];
      const event = {
        id, name: body.name || '集金', adminToken, priceTiers: tiers, members: [],
        memo: (body.memo || '').trim(),
        theme: body.theme || 'red',
        created: new Date().toISOString()
      };
      await saveEvent(id, event);
      return res.status(200).json({ id, adminToken });
    }

    // API: イベント取得
    if (pathname.match(/^\/api\/event\//) && req.method === 'GET') {
      const id = pathname.split('/')[3];
      let event = await getEvent(id);
      if (!event) return res.status(404).json({ error: 'Not found' });
      if (typeof event === 'string') event = JSON.parse(event);
      event = migrateEvent(event);
      await saveEvent(id, event);
      const { adminToken, ...safeData } = event;
      return res.status(200).json(safeData);
    }

    // API: 参加登録
    if (pathname.match(/^\/api\/join\//) && req.method === 'POST') {
      const id = pathname.split('/')[3];
      const body = await parseBody(req);
      let event = await getEvent(id);
      if (!event) return res.status(404).json({ error: 'Not found' });
      if (typeof event === 'string') event = JSON.parse(event);
      event = migrateEvent(event);
      const name = (body.name || '').trim();
      const tier = body.tier || '';
      if (!name) return res.status(400).json({ error: 'Name required' });
      if (event.members.find(m => m.name === name)) return res.status(200).json({ status: 'already_joined' });
      const tierInfo = event.priceTiers.find(t => t.label === tier);
      const amount = tierInfo ? tierInfo.amount : (event.priceTiers[0]?.amount || 0);
      const addedBy = (body.addedBy || '').trim();
      event.members.push({
        name, tier: tier || event.priceTiers[0]?.label || '一般',
        amount, paid: false, selfReported: false, confirmed: false,
        addedBy: addedBy || name, joinedAt: new Date().toISOString(), paidAt: null
      });
      await saveEvent(id, event);
      return res.status(200).json({ status: 'ok' });
    }

    // API: 支払い状態切り替え（誰でも操作可能、履歴記録あり）
    if (pathname.match(/^\/api\/toggle\//) && req.method === 'POST') {
      const id = pathname.split('/')[3];
      const body = await parseBody(req);
      let event = await getEvent(id);
      if (!event) return res.status(404).json({ error: 'Not found' });
      if (typeof event === 'string') event = JSON.parse(event);
      event = migrateEvent(event);
      const member = event.members.find(m => m.name === body.name);
      if (member) {
        // paid を明示的に指定可能（指定なしならトグル）
        const newPaid = body.paid !== undefined ? !!body.paid : !member.paid;
        const oldPaid = member.paid;
        member.paid = newPaid;
        member.paidAt = newPaid ? new Date().toISOString() : null;
        // 未払いに戻した場合、自己申告と幹事確認もリセット
        if (!newPaid) {
          member.selfReported = false;
          member.confirmed = false;
        }
        // 操作履歴を記録
        if (!Array.isArray(event.actionLog)) event.actionLog = [];
        event.actionLog.push({
          action: newPaid ? 'paid' : 'unpaid',
          targetName: body.name,
          actionBy: (body.actionBy || '不明').trim(),
          timestamp: new Date().toISOString(),
          note: oldPaid === newPaid ? '変更なし' : ''
        });
      }
      await saveEvent(id, event);
      return res.status(200).json({ status: 'ok' });
    }

    // API: 自己申告
    if (pathname.match(/^\/api\/self-report\//) && req.method === 'POST') {
      const id = pathname.split('/')[3];
      const body = await parseBody(req);
      let event = await getEvent(id);
      if (!event) return res.status(404).json({ error: 'Not found' });
      if (typeof event === 'string') event = JSON.parse(event);
      const member = event.members.find(m => m.name === body.name);
      if (member && !member.paid) {
        member.paid = true; member.paidAt = new Date().toISOString(); member.selfReported = true;
      }
      await saveEvent(id, event);
      return res.status(200).json({ status: 'ok' });
    }

    // API: 幹事確認
    if (pathname.match(/^\/api\/confirm\//) && req.method === 'POST') {
      const id = pathname.split('/')[3];
      const body = await parseBody(req);
      let event = await getEvent(id);
      if (!event) return res.status(404).json({ error: 'Not found' });
      if (typeof event === 'string') event = JSON.parse(event);
      if (!body.adminToken || !event.adminToken || body.adminToken !== event.adminToken) {
        return res.status(403).json({ status: 'forbidden', message: '幹事権限がありません' });
      }
      const member = event.members.find(m => m.name === body.name);
      if (member) {
        member.confirmed = !member.confirmed;
        if (member.confirmed) { member.paid = true; member.paidAt = member.paidAt || new Date().toISOString(); }
      }
      await saveEvent(id, event);
      return res.status(200).json({ status: 'ok' });
    }

    // API: 参加者削除（幹事、本人、招待者が削除可能）
    if (pathname.match(/^\/api\/remove\//) && req.method === 'POST') {
      const id = pathname.split('/')[3];
      const body = await parseBody(req);
      let event = await getEvent(id);
      if (!event) return res.status(404).json({ error: 'Not found' });
      if (typeof event === 'string') event = JSON.parse(event);
      const memberName = (body.name || '').trim();
      if (!memberName) return res.status(400).json({ status: 'error', message: '名前が必要です' });
      const idx = event.members.findIndex(m => m.name === memberName);
      if (idx === -1) return res.status(404).json({ status: 'not_found', message: 'メンバーが見つかりません' });
      const member = event.members[idx];
      const requesterName = (body.requesterName || '').trim();
      const isAdminReq = body.adminToken && event.adminToken && body.adminToken === event.adminToken;
      const isSelf = requesterName && requesterName === memberName;
      const isInviter = requesterName && member.addedBy === requesterName;
      if (!isAdminReq && !isSelf && !isInviter) {
        return res.status(403).json({ status: 'forbidden', message: '削除権限がありません' });
      }
      event.members.splice(idx, 1);
      await saveEvent(id, event);
      return res.status(200).json({ status: 'ok', removed: memberName });
    }

    // API: メンバー区分変更（幹事、本人、招待者が変更可能）
    if (pathname.match(/^\/api\/change-tier\//) && req.method === 'POST') {
      const id = pathname.split('/')[3];
      const body = await parseBody(req);
      let event = await getEvent(id);
      if (!event) return res.status(404).json({ error: 'Not found' });
      if (typeof event === 'string') event = JSON.parse(event);
      event = migrateEvent(event);
      const memberName = (body.name || '').trim();
      const newTier = (body.newTier || '').trim();
      if (!memberName || !newTier) return res.status(400).json({ status: 'error', message: '名前と区分が必要です' });
      const member = event.members.find(m => m.name === memberName);
      if (!member) return res.status(404).json({ status: 'not_found', message: 'メンバーが見つかりません' });
      const requesterName = (body.requesterName || '').trim();
      const isAdminReq = body.adminToken && event.adminToken && body.adminToken === event.adminToken;
      const isSelf = requesterName && requesterName === memberName;
      const isInviter = requesterName && member.addedBy === requesterName;
      if (!isAdminReq && !isSelf && !isInviter) {
        return res.status(403).json({ status: 'forbidden', message: '変更権限がありません' });
      }
      const tierInfo = event.priceTiers.find(t => t.label === newTier);
      if (!tierInfo) return res.status(400).json({ status: 'error', message: '無効な区分です' });
      member.tier = newTier;
      member.amount = tierInfo.amount;
      await saveEvent(id, event);
      return res.status(200).json({ status: 'ok', name: memberName, tier: newTier, amount: tierInfo.amount });
    }

    // API: 料金変更
    if (pathname.match(/^\/api\/update-tiers\//) && req.method === 'POST') {
      const id = pathname.split('/')[3];
      const body = await parseBody(req);
      let event = await getEvent(id);
      if (!event) return res.status(404).json({ error: 'Not found' });
      if (typeof event === 'string') event = JSON.parse(event);
      if (!body.adminToken || !event.adminToken || body.adminToken !== event.adminToken) {
        return res.status(403).json({ status: 'forbidden', message: '幹事権限がありません' });
      }
      const newTiers = Array.isArray(body.priceTiers) ? body.priceTiers.filter(t => t.label).map(t => ({ label: t.label, amount: t.amount || 0, paypayLink: t.paypayLink || '' })) : [];
      if (newTiers.length === 0) return res.status(400).json({ status: 'error', message: '有効な料金区分が必要です' });
      event.priceTiers = newTiers;
      for (let i = 0; i < event.members.length; i++) {
        const m = event.members[i];
        const tierInfo = newTiers.find(t => t.label === m.tier);
        if (tierInfo) m.amount = tierInfo.amount;
      }
      await saveEvent(id, event);
      return res.status(200).json({ status: 'ok' });
    }

    // API: 幹事トークン検証
    if (pathname.match(/^\/api\/verify-admin\//) && req.method === 'GET') {
      const id = pathname.split('/')[3];
      const token = url.searchParams.get('token');
      let event = await getEvent(id);
      if (!event) return res.status(404).json({ error: 'Not found' });
      if (typeof event === 'string') event = JSON.parse(event);
      const valid = token && event.adminToken && token === event.adminToken;
      return res.status(200).json({ valid });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
