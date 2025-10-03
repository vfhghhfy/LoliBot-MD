import { db } from '../lib/postgres.js';

const maxwarn = 3; // أقصى عدد تحذيرات

let handler = async (m, { conn, text, args, usedPrefix, command, metadata }) => {
try {
let who;
if (m.isGroup) {
who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
} else {
who = m.chat;
}

// لو ما تم تحديد الشخص
if (!who) return m.reply(`⚠️ *من تريد أن أوجه له تحذير؟* \n➤ قم بوسم الشخص بـ @tag أو اقتبس رسالته.`);

// التحقق من وجود المستخدم في قاعدة البيانات
const userResult = await db.query(`SELECT * FROM usuarios WHERE id = $1`, [who]);
if (!userResult.rows.length) return m.reply(`❌ *المستخدم غير موجود في قاعدة بياناتي!*`);

// اسم المسؤول الذي أعطى التحذير
const name = (await conn.getName(m.sender)) || m.sender.split('@')[0];
let warn = userResult.rows[0].warn || 0;

// إذا لم يتجاوز الحد الأقصى للتحذيرات
if (warn < maxwarn) {
await db.query(`UPDATE usuarios
        SET warn = warn + 1
        WHERE id = $1`, [who]);
warn += 1;

let reason = text.trim() || 'غير محددة';
await conn.reply(m.chat, 
`⚠️ *تحذيــــر!* ⚠️

👤 @${who.split`@`[0]} 
تم تحذيرك بواسطة المشرف: *${name}*

📌 التحذيرات: ${warn}/${maxwarn}
📄 السبب: ${reason}`, m, { mentions: [who] })

// إذا تجاوز التحذيرات المسموح بها
} else if (warn >= maxwarn) {
await db.query(`UPDATE usuarios
        SET warn = 0
        WHERE id = $1`, [who]);

await conn.reply(m.chat, 
`⛔ *الطرد التلقائي!* ⛔

المستخدم @${who.split`@`[0]} تجاوز الحد الأقصى *${maxwarn}* من التحذيرات، 
وسيتم إزالته من المجموعة...`, m, { mentions: [who] })

await delay(3000);
await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
}
} catch (err) {
console.error(err);
}};
  
// المساعدة والأوامر
handler.help = ['warn @user [reason]', 'تحذير @شخص [سبب]'];
handler.tags = ['group'];
handler.command = /^(warn|تحذير)$/i; // يدعم الأمر بالإنجليزية والعربية
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.register = true;

export default handler;

// دالة تأخير
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
