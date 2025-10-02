// الكود من تطوير: https://github.com/elrebelde21 

/*يعمل ولكن ليس كما أريد سأقوم بإصلاحه لاحقاً :v
import { webp2png } from '../lib/webp2mp4.js';
import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import axios from 'axios';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OWNER1 = "5214774444444@s.whatsapp.net";
const ACTIVE_CONVERSATIONS = {};
const MAX_VIDEO_SIZE_MB = 60; // حد 60 ميجابايت للفيديوهات

let handler = async (m, { conn, text, args, command, usedPrefix }) => {
let media = false;
let q = m.quoted ? m.quoted : m;
let mime = (q.msg || q).mimetype || '';
let url = '';

if (/image|video|audio/.test(mime)) {
media = await q.download();

if (/video/.test(mime)) {
let videoPath = join(__dirname, `./temp_video_${new Date().getTime()}.mp4`);
fs.writeFileSync(videoPath, media);

let videoStats = fs.statSync(videoPath);
let videoSizeMB = videoStats.size / (1024 * 1024);
if (videoSizeMB > MAX_VIDEO_SIZE_MB) {
fs.unlinkSync(videoPath);
return m.reply(`*⚠️ الفيديو يتجاوز الحجم المسموح (الحد الأقصى 60 ميجابايت). يرجى تقليمه، ضغطه أو إرسال فيديو أخف.*`);
}
url = videoPath;
} else {
url = await uploadImage(media);
}} else if (/webp/.test(mime)) {
media = await q.download();
url = await webp2png(media);
}

let activeConversation = Object.entries(ACTIVE_CONVERSATIONS).find(([id, convo]) => convo.active && convo.userId === m.sender && convo.chatId === m.chat);

if (activeConversation) {
let [reportId] = activeConversation;
let message = `📩 *رسالة من المستخدم @${m.sender.split("@")[0]} (ID: ${reportId}):*\n${text || ''}`;

if (url) {
if (/image/.test(mime)) {
await conn.sendMessage(OWNER1, { image: { url }, caption: message, contextInfo: { mentionedJid: [m.sender] } }, { quoted: m });
} else if (/video/.test(mime)) {
await conn.sendMessage(OWNER1, { video: { url }, caption: message, contextInfo: { mentionedJid: [m.sender] } }, { quoted: m });
} else if (/audio/.test(mime)) {
await conn.sendMessage(OWNER1, { audio: { url }, mimetype: mime, caption: message, contextInfo: { mentionedJid: [m.sender] } }, { quoted: m });
}} else if (m.msg && m.msg.sticker) {
await conn.sendMessage(OWNER1, { sticker: media, contextInfo: { mentionedJid: [m.sender] } }, { quoted: m });
} else {
await conn.sendMessage(OWNER1, { text: message, mentions: [m.sender] }, { quoted: m });
}
return;
}

if (command === 'report' || command === 'reporte') {
if (!text && !m.quoted) return m.reply(`⚠️ اكتب الخطأ/الأمر المعطل\n\n*مثال:* ${usedPrefix + command} الملصقات لا تعمل`);
if (text.length < 8) throw `${fg} ✨ *الحد الأدنى 10 أحرف لعمل التقرير...*`
if (text.length > 1000) throw `${fg} ⚠️ *الحد الأقصى 1000 حرف لعمل التقرير.*`

let reportId = Math.floor(Math.random() * 901);

ACTIVE_CONVERSATIONS[reportId] = {
userId: m.sender,
userName: m.pushName || 'مستخدم مجهول',
active: true,
chatId: m.chat,
url: url,
mime: mime,
};

let reportText = text || (m.quoted && m.quoted.text) || 'لا توجد رسالة';
let teks = `┏╼╾╼⧼⧼⧼ ＲＥＰＯＲＴＥ ⧽⧽⧽╼╼╼┓
╏• *الرقم:* Wa.me/${m.sender.split("@")[0]}
╏• *الرسالة:* ${reportText}
┗╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼\n\nرد على الرسالة باستخدام:\n*"responder ${reportId} [الرسالة]"* للتفاعل.\nاستخدم *.fin ${reportId}* لإنهاء المحادثة.`

await conn.sendMessage(OWNER1, { text: teks, mentions: [m.sender] }, { quoted: m });
await delay(1000)
await conn.reply(m.chat, `*⚡تم إرسال التقرير إلى منشئي، سيكون هناك رد قريباً، إذا كان خاطئاً سيتم تجاهل التقرير*`);
return;
}};

handler.before = async (m, { conn }) => {
let activeConversation = Object.entries(ACTIVE_CONVERSATIONS).find(([id, convo]) => convo.active && convo.userId === m.sender && convo.chatId === m.chat);

if (activeConversation) {
let [reportId] = activeConversation;
let message2 = `*📩 رد جديد من المستخدم @${m.sender.split("@")[0]} (ID: ${reportId}):*\n${m.text || ''}`;

if (m.mtype === 'stickerMessage') {
let sticker = await m.download();
if (sticker) {
await conn.sendMessage(OWNER1, { sticker }, { quoted: m });
} else {   
}} else if (m.mtype === 'imageMessage' || m.mtype === 'videoMessage' || m.mtype === 'audioMessage') {
let media = await m.download();
let url = await uploadImage(media);
if (url) {                      
await conn.sendMessage(OWNER1, { [m.mtype === 'videoMessage' ? 'video' : m.mtype === 'audioMessage' ? 'audio' : 'image']: { url }, caption: message2, contextInfo: { mentionedJid: [m.sender] }}, { quoted: m });
} else {
console.error('خطأ');
}} else {
await conn.sendMessage(OWNER1, { text: message2, mentions: [m.sender] }, { quoted: m });
}}

let matchResponder = m.text.match(/^responder (\S+) (.+)/i);
if (matchResponder) {
let [_, reportId, ownerMessage] = matchResponder;

if (!ACTIVE_CONVERSATIONS[reportId] || !ACTIVE_CONVERSATIONS[reportId].active) return
let { userId } = ACTIVE_CONVERSATIONS[reportId];
if (m.quoted) {
let quoted = m.quoted;
let mime = (quoted.msg || quoted).mimetype || '';
if (/image|video|audio|sticker/.test(mime)) {
let media = await quoted.download();
let url = await uploadImage(media);
if (/image/.test(mime)) {
await conn.sendMessage(userId, { image: { url }, caption: ownerMessage });
} else if (/video/.test(mime)) {
await conn.sendMessage(userId, { video: { url }, caption: ownerMessage });
} else if (/audio/.test(mime)) {
await conn.sendMessage(userId, { audio: { url }, mimetype: mime, caption: ownerMessage });
} else if (/sticker/.test(mime)) {
await conn.sendMessage(userId, { sticker: media });
}} else {
await conn.sendMessage(userId, { text: ownerMessage });
}} else {
await conn.sendMessage(userId, { text: `*• رد من المالك:*\n${ownerMessage}` });
}
return;
}

if (m.quoted && m.quoted.text) {
let quotedTextMatch = m.quoted.text.match(/ID: (\d+)/);
if (quotedTextMatch) {
let reportId = quotedTextMatch[1];
if (ACTIVE_CONVERSATIONS[reportId] && ACTIVE_CONVERSATIONS[reportId].active) {
let { userId } = ACTIVE_CONVERSATIONS[reportId];
let ownerMessage = m.text || 'لا توجد رسالة';

if (/image|video|audio|sticker/.test(m.mtype)) {
let media = await m.download();
let url = await uploadImage(media);
if (/image/.test(m.mtype)) {
await conn.sendMessage(userId, { image: { url }, caption: ownerMessage });
} else if (/video/.test(m.mtype)) {
await conn.sendMessage(userId, { video: { url }, caption: ownerMessage });
} else if (/audio/.test(m.mtype)) {
await conn.sendMessage(userId, { audio: { url }, mimetype: m.mimetype });
} else if (/sticker/.test(m.mtype)) {
await conn.sendMessage(userId, { sticker: media });
}} else {
await conn.sendMessage(userId, { text: `*• رد من المالك:*\n${ownerMessage}` });
}
return;
}}}

let matchFin = m.text.match(/^\.fin (\S+)/i);
if (matchFin) {
let [_, reportId] = matchFin;

if (!ACTIVE_CONVERSATIONS[reportId]) return await conn.reply(m.chat, `⚠️ لم يتم العثور على محادثة نشطة بهذا المعرف.`, m);        
let { userId } = ACTIVE_CONVERSATIONS[reportId];
ACTIVE_CONVERSATIONS[reportId].active = false;
await conn.reply(userId, `🔒 *تم إغلاق المحادثة من قبل المالك.*`);
await delay(1000)
await conn.reply(m.chat, `✔️ المحادثة ${reportId} مغلقة.`);
return;
}};
handler.help = ['reporte', 'request'].map(v => v + ' <نص>')
handler.tags = ['main']
handler.exp = 3500
handler.command = /^(report|request|reporte|bugs|bug|report-owner|reportes|reportar)$/i 
handler.register = true 
handler.private = true
export default handler
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

*/

import { db } from "../lib/postgres.js";

const handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return m.reply(`⚠️ اكتب ${command === "suggestion" ? "الاقتراحات" : "الخطأ/الأمر المعطل"}\n\n*مثال:* ${usedPrefix + command} ${command === "suggestion" ? "أضف أمر ..." : "الملصقات لا تعمل"}`)
if (text.length < 8) return m.reply(`✨ *الحد الأدنى 10 أحرف لعمل التقرير...*`)
if (text.length > 1000) return m.reply(`⚠️ *الحد الأقصى 1000 حرف لعمل التقرير.*`)
const nombre = m.pushName || "بدون اسم";
const tipo = /sugge|suggestion/i.test(command) ? "اقتراح" : "تقرير";

await db.query(`INSERT INTO reportes (sender_id, sender_name, mensaje, tipo) VALUES ($1, $2, $3, $4)`, [m.sender, nombre, text, tipo]);
return m.reply(tipo === "اقتراح" ? "✅ شكراً لك! تم إرسال اقتراحك إلى فريق الإشراف وسيتم أخذه بعين الاعتبار." : "✅ تم إرسال تقريرك إلى فريق الإشراف وسيتم مراجعته قريباً.");
};

// إضافة الأوامر العربية
handler.help = ["report <نص>", "sugge <اقتراح>", "بلاغ", "اقتراح"];
handler.tags = ["main"];
handler.command = /^(report|request|suggestion|sugge|reporte|bugs?|report-owner|reportes|reportar|بلاغ|تقرير|اقتراح|إقتراح|مشكلة)$/i;
handler.register = true;

export default handler;
