import { db } from '../lib/postgres.js';

let handler = async (m, { conn, args, usedPrefix, command, metadata }) => {
try {
let who;
if (m.isGroup) {
who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
} else {
who = m.chat;
}

if (!who) return m.reply(`*لمن تريد إزالة التحذير؟* ضع علامة على شخص باستخدام @ أو رد على رسالته، لست عرافاً! :)`)
const userResult = await db.query(`SELECT * FROM usuarios WHERE id = $1`, [who]);
if (!userResult.rows.length) return m.reply(`*لمن تريد إزالة التحذير؟* ضع علامة على شخص باستخدام @ أو رد على رسالته، لست عرافاً! :)`)
let warn = userResult.rows[0].warn || 0;

if (warn > 0) {
await db.query(`UPDATE usuarios
        SET warn = warn - 1
        WHERE id = $1`, [who]);
warn -= 1; 
await conn.reply(m.chat, `*⚠️ تم إزالة تحذير ⚠️*\n\nالمستخدم: @${who.split`@`[0]}\n*• التحذير:* -1\n*• الإجمالي:* ${warn}`, m)
} else {
await conn.reply(m.chat, `*⚠️ المستخدم @${who.split`@`[0]} ليس لديه أي تحذيرات.*`, m)
}} catch (err) {
}};

// الأوامر العربية المضافة
handler.help = ['delwarn @user', 'unwarn @user', 'ازالة_تحذير @مستخدم', 'حذف_تحذير @مستخدم'];
handler.tags = ['group', 'المجموعة'];
handler.command = /^(delwarn|unwarn|ازالة_تحذير|حذف_تحذير)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.register = true;

export default handler;
