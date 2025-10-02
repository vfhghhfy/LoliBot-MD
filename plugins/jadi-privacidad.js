import { db } from '../lib/postgres.js'

let handler = async (m, { conn, command, args, usedPrefix }) => {
const val = args[0];
if (!['1', '0'].includes(val)) return m.reply(`استخدم:\n${usedPrefix}${command} 1 (تفعيل)\n${usedPrefix}${command} 0 (تعطيل)`);

const id = conn.user?.id;
if (!id) return
const botId = id.replace(/:\d+/, '');
try {
if (/setprivacy|privacy/i.test(command)) {
const privacyVal = val === '1'; 
const res = await db.query(`INSERT INTO subbots (id, privacy)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET privacy = $2 RETURNING privacy`, [botId, privacyVal]);
return m.reply(privacyVal ? '✅ *تم تفعيل الخصوصية.*\n> رقمك لن يظهر في قائمة البوتات.' : '✅ *تم تعطيل الخصوصية.*\n> رقمك سيظهر في قائمة البوتات.');
}

if (/setprestar|prestar/i.test(command)) {
const prestarVal = val === '1'; 
const res = await db.query(`INSERT INTO subbots (id, prestar)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET prestar = $2 RETURNING prestar`, [botId, prestarVal]);
return m.reply(prestarVal ? '✅ *تم تفعيل إقراض البوت.*\n> يمكن للمستخدمين استخدام البوت لإضافته إلى المجموعات.' : '✅ *تم تعطيل إقراض البوت.*\n> لن يتمكن المستخدمون من إضافة البوت إلى المجموعات.');
}} catch (err) {
console.error(err);
}}

// إضافة الأوامر العربية
handler.help = ['setprivacy', 'setprestar', 'الخصوصية', 'الإقراض']
handler.tags = ['jadibot']
handler.command = /^(privacy|prestar|setprestar|setprivacy|خصوصية|إقراض|إعارة)$/i
handler.owner = true
handler.register = true

export default handler
