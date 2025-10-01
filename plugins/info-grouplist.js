import { db } from '../lib/postgres.js';

const handler = async (m, { conn }) => {
const botId = (conn.user?.id || '').split(':')[0].replace('@s.whatsapp.net', '');
let txt = '';
try {
const res = await db.query(`SELECT id FROM chats
      WHERE is_group = true AND joined = true AND bot_id = $1`, [botId]);
const grupos = res.rows;
if (grupos.length === 0) return m.reply('❌ هذا البوت غير مضاف إلى أي مجموعة.');

for (let i = 0; i < grupos.length; i++) {
const jid = grupos[i].id;
const metadata = await conn.groupMetadata(jid).catch(() => null);
if (!metadata) continue;
const botJid = conn.user?.id?.replace(/:\d+/, '');
const bot = metadata.participants.find(u => u.id === botJid) || {};
const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin';
const isParticipant = metadata.participants.some(u => u.id === botJid);
const participantStatus = isParticipant ? '✅ *موجود*' : '❌ *غير موجود*';

let link = '❌ لست مشرف';
if (isBotAdmin) {
const code = await conn.groupInviteCode(jid).catch(() => null);
if (code) link = `https://chat.whatsapp.com/${code}`;
else link = '⚠️ خطأ في إنشاء الرابط';
}

txt += `${i + 1}. ${metadata.subject || 'بدون اسم'} | ${participantStatus}\n- *المعرف:* ${jid}\n- *مشرف:* ${isBotAdmin ? 'نعم' : 'لا'}\n- *الأعضاء:* ${metadata.participants.length}\n- *الرابط:* ${link}\n\n━━━━━━━━━━━━━━━\n\n`;
}
m.reply(`_*\`المجموعات المضاف فيها:\`*_\n> *• الإجمالي:* ${grupos.length}\n\n${txt}`.trim());
} catch (err) {
console.error(err);
}};
handler.help = ['مجموعات', 'groups', 'grouplist'];
handler.tags = ['main'];
handler.command = /^(groups|grouplist|مجموعات|قروب|جروب|قروبات)$/i;
handler.register = true;
export default handler;
