const handler = async (m, {conn, usedPrefix, text}) => {
if (isNaN(text) && !text.match(/@/g)) {
} else if (isNaN(text)) {
var number = text.split`@`[1];
} else if (!isNaN(text)) {
var number = text;
}

if (!text && !m.quoted) return conn.reply(m.chat, `*⚠️ لمن تريد إزالة الإدارة؟* ضع علامة على شخص، لست عرافاً :)`, m);
if (number.length > 13 || (number.length < 11 && number.length > 0)) return conn.reply(m.chat, `*هذا الرقم الذي أدخلته غير صحيح 🤓*، أدخل الرقم بشكل صحيح أو ضع علامة على المستخدم.`, m);
try {
if (text) {
var user = number + '@s.whatsapp.net';
} else if (m.quoted.sender) {
var user = m.quoted.sender;
} else if (m.mentionedJid) {
var user = number + '@s.whatsapp.net';
}} catch (e) {
} finally {
conn.groupParticipantsUpdate(m.chat, [user], 'demote');
conn.reply(m.chat, `*[ ✅ ] تم تنفيذ الأمر*`, m);
}};

// الأوامر العربية المضافة
handler.help = ['*593xxx*', '*@usuario*', '*responder chat*', '*رقم*', '*@مستخدم*', '*رد على رسالة*'].map((v) => 'demote ' + v);
handler.tags = ['group', 'المجموعة'];
handler.command = /^(demote|quitarpoder|quitaradmin|تنزيل|سحب)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.register = true 
handler.fail = null;
export default handler;
