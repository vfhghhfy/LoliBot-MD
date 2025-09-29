import { db } from '../lib/postgres.js';

const maxwarn = 3
let handler = async (m, { conn, participants, metadata }) => {
try {
const result = await db.query(`SELECT id, warn
      FROM usuarios
      WHERE warn > 0`);
const warnedUsers = result.rows.filter(user => participants.some(p => p.id === user.id)).map(user => ({ id: user.id, warn: user.warn }));
warnedUsers.sort((a, b) => b.warn - a.warn);
let teks = `*📋 قائمة التحذيرات 📋*\n\n`;
teks += `المجموعة: ${metadata.subject || 'بدون اسم'}\n`;
teks += `إجمالي المستخدمين ذوي التحذيرات: ${warnedUsers.length}\n\n`;

if (warnedUsers.length === 0) {
teks += `*لا توجد مستخدمين ذوي تحذيرات في هذه المجموعة! 😊*`;
} else {
teks += `*المستخدمون المحذرون:*\n`;
for (let user of warnedUsers) {
teks += `➥ @${user.id.split('@')[0]} - التحذيرات: ${user.warn}/${maxwarn}\n`;
}}
await conn.reply(m.chat, teks, m)
} catch (err) {
console.error(err);
}};

// الأوامر العربية المضافة
handler.help = ['listwarn', 'قائمة_التحذيرات', 'التحذيرات'];
handler.tags = ['group', 'المجموعة'];
handler.command = /^(listwarn|قائمة_التحذيرات|التحذيرات)$/i;
handler.register = true;

export default handler;
