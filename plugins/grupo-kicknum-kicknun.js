const handler = async (m, { conn, args, groupMetadata, participants, usedPrefix, command, isBotAdmin }) => {
if (!args[0]) return m.reply(`*⚠️ أدخل رمز الدولة، مثال:* ${usedPrefix + command} +20`);
if (isNaN(args[0])) return m.reply(`*⚠️ يجب أن يكون الرمز رقمًا صالحًا، مثال:* ${usedPrefix + command} +20`);

const prefijo = args[0].replace(/[+]/g, '');
const encontrados = participants.map(u => u.id).filter(v => v !== conn.user.jid && v.startsWith(prefijo));
const numeros = encontrados.map(v => '⭔ @' + v.replace(/@.+/, ''));
if (!encontrados.length) return m.reply(`*📵 لا توجد أرقام بالرمز +${prefijo} في هذه المجموعة.*`);

switch (command) {
case 'listanum': case 'listnum': case 'قائمة_الارقام':
return conn.reply(m.chat, `*📋 الأرقام الموجودة بالرمز +${prefijo}:*\n\n${numeros.join('\n')}`, m, { mentions: encontrados });

case 'kicknum': case 'طرد_الارقام':
if (!isBotAdmin) return m.reply('*⚠️ البوت ليس مشرفاً، لا يمكنني طرد المستخدمين.*');
await conn.reply(m.chat, `*⚠️ بدء طرد الأرقام بالرمز +${prefijo}...*\n> _سيتم الطرد كل 10 ثوانٍ_`, m);
const ownerGroup = m.chat.split`-`[0] + '@s.whatsapp.net';
for (const user of encontrados) {
const error = `@${user.split('@')[0]} تم طرده بالفعل أو غادر المجموعة.`;
const protegido = [ownerGroup, conn.user.jid, global.owner + '@s.whatsapp.net'];

if (!protegido.includes(user)) {
try {
const r = await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
if (r[0]?.status === '404') await m.reply(error, m.chat, { mentions: [user] });
} catch (e) {
await m.reply(`⚠️ تعذر طرد @${user.split('@')[0]}`, m.chat, { mentions: [user] });
}
await delay(10000);
}}
return m.reply('*✅ اكتملت عملية الطرد.*');
}};

// الأوامر العربية المضافة
handler.help = ['kicknum', 'listnum', 'طرد_الارقام', 'قائمة_الارقام'];
handler.tags = ['group', 'المجموعة'];
handler.command = /^(kicknum|listanum|listnum|طرد_الارقام|قائمة_الارقام)$/i;
handler.group = handler.botAdmin = handler.admin = true;
export default handler;

const delay = ms => new Promise(res => setTimeout(res, ms));
