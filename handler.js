import "./config.js";
import { watchFile, unwatchFile } from 'fs';
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath, pathToFileURL } from "url";
import crypto from "crypto";
import { db, getSubbotConfig } from "./lib/postgres.js";
import { logCommand, logError, logMessage, LogLevel } from "./lib/logger.js";
import { smsg } from "./lib/simple.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginsFolder = path.join(__dirname, "plugins");

const processedMessages = new Set();
const lastDbUpdate = new Map();
const groupMetaCache = new Map(); 

// ✅ رقم المطور الرئيسي - تم فك التشفير
const fixedOwners = [
  '521477444444@s.whatsapp.net',  // تم فك التشفير من NTUxNDc3NDQ0NDQ0NA==
  '5492266613038@s.whatsapp.net', // تم فك التشفير من NTQ5MjI2NjYxMzAzOA==
  '35060220747880@lid',
  '967778668253@s.whatsapp.net' // رقمك الشخصي كمطوّر
];

export async function participantsUpdate(conn, { id, participants, action, author }) {
try {
if (!id || !Array.isArray(participants) || !action) return;
if (!conn?.user?.id) return;
const botId = conn.user.id;
const botConfig = await getSubbotConfig(botId)
const modo = botConfig.mode || "public"
const botJid = conn.user?.id?.replace(/:\d+@/, "@")

// ✅ التحقق من المالكين والمطورين
const isCreator = fixedOwners.includes(author) || 
  global.owner.map(([v]) => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(author);

if (modo === "private" && !isCreator && author !== botJid) return

const metadata = await conn.groupMetadata(id);
groupMetaCache.set(id, metadata);
const groupName = metadata.subject || "المجموعة"
const botJidClean = (conn.user?.id || "").replace(/:\d+/, "")
const botLidClean = (conn.user?.lid || "").replace(/:\d+/, "")

const isBotAdmin = metadata.participants.some(p => {
  const cleanId = p.id?.replace(/:\d+/, "");
  return (
    (cleanId === botJidClean || cleanId === botLidClean) &&
    (p.admin === "admin" || p.admin === "superadmin")
  );
});

const settings = (await db.query("SELECT * FROM group_settings WHERE group_id = $1", [id])).rows[0] || {
welcome: true,
detect: true,
antifake: false
}

const arabicCountryCodes = ['+91', '+92', '+222', '+93', '+265', '+213', '+225', '+240', '+241', '+61', '+249', '+62', '+966', '+229', '+244', '+40', '+49', '+20', '+963', '+967', '+234', '+256', '+243', '+210', '+249', ,'+212', '+971', '+974', '+968', '+965', '+962', '+961', '+964', '+970'];
const pp = "./media/Menu1.jpg"

for (const participant of participants) {
if (!participant || typeof participant !== 'string' || !participant.includes('@')) continue;
const userTag = typeof participant === 'string' && participant.includes('@') ? `@${participant.split("@")[0]}` : "@مستخدم"
const authorTag = typeof author === 'string' && author.includes('@') ? `@${author.split("@")[0]}` : "شخص ما"

if (action === "add" && settings.antifake) {
const phoneNumber = participant.split("@")[0]
const isFake = arabicCountryCodes.some(code => phoneNumber.startsWith(code.slice(1)))

if (isFake && isBotAdmin) {
await conn.sendMessage(id, { text: `⚠️ ${userTag} تمت إزالته تلقائياً بسبب *رقم غير مسموح*`, mentions: [participant] })
await conn.groupParticipantsUpdate(id, [participant], "remove")    
continue
} else if (isFake && !isBotAdmin) {
//await conn.sendMessage(id, { text: `⚠️ ${userTag} لديه رقم محظور، لكن ليس لدي صلاحية المشرف لإزالته.`, mentions: [participant] })
continue 
}}

let image
try {
image = await conn.profilePictureUrl(participant, "image")
} catch {
image = pp
}           
        
switch (action) {
case "add":
if (settings.welcome) {
const groupDesc = metadata.desc || "*مَجْمُوْعَةٌ رَائِعَةٌ 😸*\n *بِدُونِ قَوَاعِد 😉*"
const raw = settings.swelcome || `مرحباً!! @user كيف حالك؟ 😃\n\n『أهلاً بك في *@group*』\n\nسعيد بلقياك صديقي 🤗\n\n_تذكر قراءة قواعد المجموعة لتجنب أي مشاكل 🧐_\n\n*فقط استمتع في هذه المجموعة واستمتع بوقتك 🥳*`
const msg = raw
.replace(/@user/gi, userTag)
.replace(/@group|@subject/gi, groupName)
.replace(/@desc/gi, groupDesc)

if (settings.photowelcome) {
await conn.sendMessage(id, { image: { url: image },caption: msg,
contextInfo: {
mentionedJid: [participant],
isForwarded: true,
forwardingScore: 999999,
forwardedNewsletterMessageInfo: {
newsletterJid: ["120363305025805187@newsletter", "120363301598733462@newsletter"].getRandom(),
newsletterName: "LoliBot ✨️"
}}}, { quoted: null })
} else {
await conn.sendMessage(id, { text: msg,
contextInfo: {
forwardedNewsletterMessageInfo: {
newsletterJid: ["120363305025805187@newsletter", "120363301598733462@newsletter"].getRandom(),
newsletterName: "LoliBot ✨️"
},
forwardingScore: 9999999,
isForwarded: true,
mentionedJid: [participant],
externalAdReply: {
mediaUrl: [info.nna, info.nna2, info.md].getRandom(), 
mediaType: 2,
showAdAttribution: false,
renderLargerThumbnail: false,
thumbnailUrl: image,
title: "🌟 أهلاً وسهلاً 🌟",
body: "مرحباً بك في المجموعة 🤗",
containsAutoReply: true,
sourceUrl: "https://skyultraplus.com"
}}}, { quoted: null })
}}
break

case "remove":
try {
await db.query(`DELETE FROM messages
    WHERE user_id = $1 AND group_id = $2`, [participant, id]);
const botJid = (conn.user?.id || "").replace(/:\d+/, "");
if (participant.replace(/:\d+/, "") === botJid) {
await db.query(`UPDATE chats SET joined = false
      WHERE id = $1 AND bot_id = $2`, [id, botJid]);
console.log(`[DEBUG] تم إزالة البوت من المجموعة ${id}. تم تعيين 'joined = false'.`);
}} catch (err) {
console.error("❌ خطأ في 'remove':", err);
}
          
if (settings.welcome && conn?.user?.jid !== globalThis?.conn?.user?.jid) {
const groupDesc = metadata.desc || "بدون وصف"
const raw = settings.sbye || `حسناً، لقد غادر @user 👋\n\nبارك الله فيه 😎`
const msg = raw
.replace(/@user/gi, userTag)
.replace(/@group/gi, groupName)
.replace(/@desc/gi, groupDesc)

if (settings.photobye) {
await conn.sendMessage(id, { image: { url: image },caption: msg, 
contextInfo: { 
mentionedJid: [participant],
isForwarded: true,
forwardingScore: 999999,
forwardedNewsletterMessageInfo: {
newsletterJid: ["120363305025805187@newsletter", "120363301598733462@newsletter"].getRandom(),
newsletterName: "LoliBot ✨️"
}}}, { quoted: null })
} else {
await conn.sendMessage(id, { text: msg,
contextInfo: {
forwardedNewsletterMessageInfo: {
newsletterJid: ["120363305025805187@newsletter", "120363301598733462@newsletter"].getRandom(),
newsletterName: "LoliBot ✨️"
},
forwardingScore: 9999999,
isForwarded: true,
mentionedJid: [participant],
externalAdReply: {
showAdAttribution: true,
renderLargerThumbnail: true,
thumbnailUrl: image,
title: "👋 مع السلامة",
body: "غادر شخص",
containsAutoReply: true,
mediaType: 1,
sourceUrl: "https://skyultraplus.com"
}}}, { quoted: null })
}}
break

case "promote": case "daradmin": case "darpoder":
if (settings.detect) {
const raw = settings.sPromote || `@user الآن أصبح مشرفاً في هذه المجموعة\n\n😼🫵تمت العملية بواسطة: @author`
const msg = raw
  .replace(/@user/gi, userTag)
  .replace(/@group/gi, groupName)
  .replace(/@desc/gi, metadata.desc || "")
  .replace(/@author/gi, authorTag)
await conn.sendMessage(id, { text: msg,  
contextInfo:{  
forwardedNewsletterMessageInfo: { 
newsletterJid: ["120363305025805187@newsletter", "120363301598733462@newsletter"].getRandom(),
newsletterName: "LoliBot ✨️" },
forwardingScore: 9999999,  
isForwarded: true,   
mentionedJid: [participant, author],
externalAdReply: {  
mediaUrl: [info.nna, info.nna2, info.md].getRandom(), 
mediaType: 2,
showAdAttribution: false,  
renderLargerThumbnail: false,  
title: "مشرف جديد 🥳",
body: "أنت الآن مشرف تصرف بمسؤولية 😉",
containsAutoReply: true,  
thumbnailUrl: image,
sourceUrl: "skyultraplus.com"
}}}, { quoted: null })         
}
break

case "demote": case "quitaradmin": case "quitarpoder":
if (settings.detect) {
const raw = settings.sDemote || `@user لم يعد مشرفاً في هذه المجموعة\n\n😼🫵تمت العملية بواسطة: @author`
const msg = raw
  .replace(/@user/gi, userTag)
  .replace(/@group/gi, groupName)
  .replace(/@desc/gi, metadata.desc || "")
  .replace(/@author/gi, authorTag)
await conn.sendMessage(id, { text: msg,  
contextInfo:{  
forwardedNewsletterMessageInfo: { 
newsletterJid: ["120363305025805187@newsletter", "120363301598733462@newsletter"].getRandom(),
newsletterName: "LoliBot ✨️" },
forwardingScore: 9999999,  
isForwarded: true,   
mentionedJid: [participant, author],
externalAdReply: {  
mediaUrl: [info.nna, info.nna2, info.md].getRandom(), 
mediaType: 2,
showAdAttribution: false,  
renderLargerThumbnail: false,  
title: "📛 مشرف أقل",
body: "هاها لم تعد مشرفاً 😹",
containsAutoReply: true,  
mediaType: 1,   
thumbnailUrl: image,
sourceUrl: "skyultraplus.com"
}}}, { quoted: null })            
}
break
}}
} catch (err) {
console.error(chalk.red(`❌ خطأ في participantsUpdate - الإجراء: ${action} | المجموعة: ${id}`), err);
}
}

export async function groupsUpdate(conn, { id, subject, desc, picture }) {
try {
const botId = conn.user?.id;
const botConfig = await getSubbotConfig(botId)
const modo = botConfig.mode || "public";
const botJid = conn.user?.id?.replace(/:\d+@/, "@");

// ✅ التحقق من المالكين والمطورين
const isCreator = fixedOwners.includes(botJid) || 
  global.owner.map(([v]) => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(botJid);
    
const settings = (await db.query("SELECT * FROM group_settings WHERE group_id = $1", [id])).rows[0] || {
welcome: true,
detec: true,
antifake: false
};
    
if (modo === "private" && !isCreator) return;
const metadata = await conn.groupMetadata(id);
groupMetaCache.set(id, metadata);
const groupName = subject || metadata.subject || "المجموعة";
const isBotAdmin = metadata.participants.some(p => p.id.includes(botJid) && p.admin);

let message = "";
if (subject) {
message = `تم تغيير اسم المجموعة إلى *${groupName}*.`;
} else if (desc) {
message = `تم تحديث وصف المجموعة *${groupName}*, الوصف الجديد:\n\n${metadata.desc || "بدون وصف"}`;
} else if (picture) {
message = `تم تحديث صورة المجموعة *${groupName}*.`;
}

if (message && settings.detect) {
await conn.sendMessage(id, { text: message,
contextInfo: {
isForwarded: true,
forwardingScore: 1,
forwardedNewsletterMessageInfo: {
newsletterJid: ["120363305025805187@newsletter", "120363301598733462@newsletter"].getRandom(),
newsletterName: "LoliBot ✨️",
serverMessageId: 1
}}
});
}} catch (err) {
console.error(chalk.red("❌ خطأ في groupsUpdate:"), err);
}
}

export async function callUpdate(conn, call) {
try {
const callerId = call.from;
const userTag = `@${callerId.split("@")[0]}`;
const botConfig = await getSubbotConfig(conn.user?.id);
if (!botConfig.anti_call) return;
await conn.sendMessage(callerId, { text: `🚫 ممنوع إجراء المكالمات، سيتم حظرك...`,
contextInfo: {
isForwarded: true,
forwardingScore: 1,
forwardedNewsletterMessageInfo: {
newsletterJid: ["120363305025805187@newsletter", "120363301598733462@newsletter"].getRandom(),
newsletterName: "LoliBot ✨️",
serverMessageId: 1
}}
});
await conn.updateBlockStatus(callerId, "block");
} catch (err) {
console.error(chalk.red("❌ خطأ في callUpdate:"), err);
}
}

export async function handler(conn, m) {
function cleanJid(jid = "") {
  return jid.replace(/:\d+/, "");
}

const chatId = m.key?.remoteJid || "";
const botId = conn.user?.id;
const subbotConf = await getSubbotConfig(botId)
info.wm = subbotConf.name ?? info.wm;
info.img2 = subbotConf.logo_url ?? info.img2;

try {
await db.query(`INSERT INTO chats (id, is_group, timestamp, bot_id, joined)
  VALUES ($1, $2, $3, $4, true)
  ON CONFLICT (id) DO UPDATE SET timestamp = $3, bot_id = $4, joined = true`, [chatId, chatId.endsWith('@g.us'), Date.now(), (conn.user?.id || '').split(':')[0].replace('@s.whatsapp.net', '')]);
} catch (err) {
console.error(err);
}

const botConfig = await getSubbotConfig(botId)
const isMainBot = conn === globalThis.conn;
const botType = isMainBot ? "رسمي" : "فرعي";
if (botConfig.tipo !== botType) {
await db.query(`UPDATE subbots SET tipo = $1 WHERE id = $2`, [botType, botId.replace(/:\d+/, "")]);
}
const prefijo = Array.isArray(botConfig.prefix) ? botConfig.prefix : [botConfig.prefix];
const modo = botConfig.mode || "public";
m.isGroup = chatId.endsWith("@g.us");

if (m.key?.participantAlt && m.key.participantAlt.endsWith("@s.whatsapp.net")) {
m.sender = m.key.participantAlt;   
m.lid = m.key.participant;
} else {
m.sender = m.key?.participant || chatId;
}

if (m.key?.fromMe) {
m.sender = conn.user?.id || m.sender;
}

if (typeof m.sender === "string") {
m.sender = m.sender.replace(/:\d+/, "");
}

m.reply = async (text) => {
const contextInfo = {
mentionedJid: await conn.parseMention(text),
isForwarded: true,
forwardingScore: 1,
forwardedNewsletterMessageInfo: {
newsletterJid: "120363305025805187@newsletter",
newsletterName: "LoliBot ✨️"
}};
return await conn.sendMessage(chatId, { text, contextInfo }, { quoted: m });
};

await smsg(conn, m); 

const hash = crypto.createHash("md5").update(m.key.id + (m.key.remoteJid || "")).digest("hex");
if (processedMessages.has(hash)) return;
processedMessages.add(hash);
setTimeout(() => processedMessages.delete(hash), 60_000);

//عداد الرسائل
if (m.isGroup && m.sender !== conn.user?.id.replace(/:\d+@/, "@")) {
const key = `${m.sender}|${chatId}`;
const now = Date.now();
const last = lastDbUpdate.get(key) || 0;
if (now - last > 9000) { //9 ثواني
lastDbUpdate.set(key, now);
db.query(`INSERT INTO messages (user_id, group_id, message_count)
      VALUES ($1, $2, 1)
      ON CONFLICT (user_id, group_id)
      DO UPDATE SET message_count = messages.message_count + 1`, [m.sender, chatId]).catch(console.error);
}}

//مكافحة الأرقام المزورة
if (m.isGroup && m.sender && m.sender.endsWith("@s.whatsapp.net")) {
try {
const settings = (await db.query("SELECT antifake FROM group_settings WHERE group_id = $1", [chatId])).rows[0];
if (settings?.antifake) {
const phoneNumber = m.sender.split("@")[0];
const arabicCountryCodes = ['+91', '+92', '+222', '+93', '+265', '+213', '+225', '+226', '+240', '+241', '+61', '+249', '+62', '+966', '+229', '+244', '+40', '+49', '+20', '+963', '+967', '+234', '+256', '+243', '+210', '+249', ,'+212', '+971', '+974', '+968', '+965', '+962', '+961', '+964', '+263', '+970'];
const botJid = conn.user?.id?.replace(/:\d+/, "");
const isFake = arabicCountryCodes.some(code => phoneNumber.startsWith(code.slice(1)));

if (isFake && m.isAdmin !== true) {
const metadata = await conn.groupMetadata(chatId);
const isBotAdmin = metadata.participants.some(p => {
const id = p.id?.replace(/:\d+/, "");
return (id === botJid || id === (conn.user?.lid || "").replace(/:\d+/, "")) && (p.admin === "admin" || p.admin === "superadmin");
});

if (isBotAdmin) {
await conn.sendMessage(chatId, { text: `⚠️ @${phoneNumber} في هذه المجموعة غير مسموح بدخول الأرقام ذات الرموز المحظورة، سيتم طرده...`, mentions: [m.sender]});
await conn.groupParticipantsUpdate(chatId, [m.sender], "remove");
return;
}}}
} catch (err) {
console.error(err);
}}

const messageContent = m.message?.ephemeralMessage?.message || m.message?.viewOnceMessage?.message || m.message;
let text = "";

if (messageContent?.conversation) text = messageContent.conversation;
else if (messageContent?.extendedTextMessage?.text) text = messageContent.extendedTextMessage.text;
else if (messageContent?.imageMessage?.caption) text = messageContent.imageMessage.caption;
else if (messageContent?.videoMessage?.caption) text = messageContent.videoMessage.caption;
else if (messageContent?.buttonsResponseMessage?.selectedButtonId) text = messageContent.buttonsResponseMessage.selectedButtonId;
else if (messageContent?.listResponseMessage?.singleSelectReply?.selectedRowId) text = messageContent.listResponseMessage.singleSelectReply.selectedRowId;
else if (messageContent?.messageContextInfo?.quotedMessage) {
const quoted = messageContent.messageContextInfo.quotedMessage;
text = quoted?.conversation || quoted?.extendedTextMessage?.text || "";
} else if (m.message?.conversation) {
text = m.message.conversation;
}

m.originalText = text; 
text = text.trim(); 
//if (!text) return;
m.text = text;

const usedPrefix = prefijo.find(p => text.startsWith(p)) || "";
const withoutPrefix = text.slice(usedPrefix.length).trim();
const [commandName, ...argsArr] = withoutPrefix.split(/[\n\s]+/); 
const command = (commandName || "").toLowerCase();
const args = argsArr;
  
text = args.join(" ").trim();
m.text = withoutPrefix.slice(commandName.length).trimStart(); 

const botJid = conn.user?.id?.replace(/:\d+/, "");
const senderJid = m.sender?.replace(/:\d+/, "");

// ✅ التحقق من المالكين والمطورين
const isCreator = fixedOwners.includes(m.sender) || 
  global.owner.map(([v]) => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

const config = await getSubbotConfig(botId);

// ✅ الآن isOwner يعتمد على رقمك + المالكين من config.js فقط
let isOwner = isCreator || senderJid === botJid || (config.owners || []).includes(senderJid);

let metadata = { participants: [] };
if (m.isGroup) {
if (groupMetaCache.has(chatId)) {
metadata = groupMetaCache.get(chatId);
} else {
try {
metadata = await conn.groupMetadata(chatId);
groupMetaCache.set(chatId, metadata);
setTimeout(() => groupMetaCache.delete(chatId), 300_000);
} catch {
metadata = { participants: [] };
}}}

const participants = metadata.participants || [];

const adminIds = participants.filter(p => p.admin === "admin" || p.admin === "superadmin").flatMap(p => {
const clean = p.id?.replace(/:\d+/, "") || "";
return clean.endsWith("@lid")
? [clean, clean.replace("@lid", "@s.whatsapp.net")]
: [clean, clean.replace("@s.whatsapp.net", "@lid")];
});

const senderJids = [];
if (m.user?.id) senderJids.push(m.user.id.replace(/:\d+/, ""));
if (m.user?.lid) senderJids.push(m.user.lid.replace(/:\d+/, ""));
if (m.sender) senderJids.push(m.sender.replace(/:\d+/, ""));
if (m.lid) senderJids.push(m.lid.replace(/:\d+/, ""));

const uniqueSenderJids = [...new Set(senderJids.filter(Boolean))];
m.isAdmin = adminIds.some(adminJid => uniqueSenderJids.includes(adminJid));

if (m.isGroup && !isCreator && senderJid !== botJid) {
try {
const res = await db.query('SELECT banned, primary_bot FROM group_settings WHERE group_id = $1', [chatId]);
    
if (res.rows[0]?.banned) return; // مجموعة محظورة

const primaryBot = res.rows[0]?.primary_bot;
if (primaryBot && !m?.isAdmin) {
const metadata = await conn.groupMetadata(chatId);
const botExists = metadata.participants.some(p => p.id === primaryBot);

if (!botExists) {
await db.query('UPDATE group_settings SET primary_bot = NULL WHERE group_id = $1', [chatId]);
} else {
const currentBotJid = conn.user?.id?.replace(/:\d+/, "") + "@s.whatsapp.net";
const expected = primaryBot.replace(/:\d+/, "");
if (!currentBotJid.includes(expected)) return; 
}}
} catch (err) {
console.error(err);
}}

try {
const rawJid = m.key?.participantAlt || m.key?.participant || m.key?.remoteJid || null;
const isValido = typeof rawJid === 'string' && /^\d+@(s\.whatsapp\.net|lid)$/.test(rawJid);
const num = isValido ? rawJid.split('@')[0] : null;
const userName = m.pushName || 'بدون اسم';

if (m.key?.participantAlt && m.key.participantAlt.endsWith('@s.whatsapp.net')) {
m.sender = m.key.participantAlt;
m.lid = m.key.participant;
} else {
m.sender = m.key?.participant || m.key?.remoteJid;
}

await db.query(`INSERT INTO usuarios (id, nombre, num, registered)
     VALUES ($1, $2, $3, false)
     ON CONFLICT (id) DO NOTHING`, [m.sender, userName, num]);

if (isValido && m.sender.endsWith('@s.whatsapp.net')) {
await db.query(`UPDATE usuarios SET nombre = $1${num ? ', num = COALESCE(num, $2)' : ''} WHERE id = $3`, num ? [userName, num, m.sender] : [userName, m.sender]);
}

if (m.key && m.key.senderLid) {
try {
await db.query('UPDATE usuarios SET lid = NULL WHERE lid = $1 AND id <> $2', [m.key.senderLid, m.sender]);
await db.query('UPDATE usuarios SET lid = $1 WHERE id = $2', [m.key.senderLid, m.sender]);
m.lid = m.key.senderLid;
} catch (e) {
console.error("❌ خطأ في تحديث lid في handler:", e);
}}
} catch (err) {
console.error(err);
}

try {
await db.query(`INSERT INTO chats (id)
      VALUES ($1)
      ON CONFLICT (id) DO NOTHING`, [chatId]);
} catch (err) {
console.error(err);
}

const plugins = Object.values(global.plugins || {});

for (const plugin of plugins) {
if (typeof plugin.before === 'function') {
try {
const result = await plugin.before(m, { conn, isOwner });
if (result === false) return;
} catch (e) {
console.error(chalk.red(e));
}}
}

if (modo === "private" && senderJid !== botJid && !isCreator) return;

const matchedPlugin = plugins.find(p => {
const raw = m.originalText
return typeof p.customPrefix === 'function'
? p.customPrefix(raw)
: p.customPrefix instanceof RegExp
? p.customPrefix.test(raw) : false
})

if (!usedPrefix) {
if (!matchedPlugin || !matchedPlugin.customPrefix) return;
}
//if (!usedPrefix && !command) return;

for (const plugin of plugins) {
let match = false;

if (plugin.command instanceof RegExp) {
match = plugin.command.test(command)
} else if (typeof plugin.command === 'string') {
match = plugin.command.toLowerCase() === command
} else if (Array.isArray(plugin.command)) {
match = plugin.command.map(c => c.toLowerCase()).includes(command)
}

if (!match && plugin.customPrefix) {
const input = m.originalText
if (typeof plugin.customPrefix === 'function') {
match = plugin.customPrefix(input)
} else if (plugin.customPrefix instanceof RegExp) {
match = plugin.customPrefix.test(input)
}}

if (!match) continue

const isGroup = m.isGroup;
const isPrivate = !m.isGroup;
let isOwner = isCreator || senderJid === botJid || (config.owners || []).includes(senderJid);
const isROwner = fixedOwners.includes(m.sender);
const senderClean = m.sender.split("@")[0];
const botClean = (conn.user?.id || "").split("@")[0];

if (senderJid === botJid) {
isOwner = true;
}

if (!isOwner && !isROwner) {
isOwner = isCreator;
}

let isAdmin = m.isAdmin;
let isBotAdmin = false;
let modoAdminActivo = false;

try {
const result = await db.query('SELECT modoadmin FROM group_settings WHERE group_id = $1', [chatId]);
modoAdminActivo = result.rows[0]?.modoadmin || false;
} catch (err) {
console.error(err);
}

//if ((plugin.admin || plugin.Botadmin) && !isGroup) return m.reply("⚠️ هل هذه مجموعة؟ هذا الأمر يعمل فقط في المجموعات");

if (plugin.tags?.includes('nsfw') && m.isGroup) {
const { rows } = await db.query('SELECT modohorny, nsfw_horario FROM group_settings WHERE group_id = $1', [chatId])
const { modohorny = false, nsfw_horario } = rows[0] || {}

const nowBA = (await import('moment-timezone')).default().tz('America/Argentina/Buenos_Aires')
const hhmm = nowBA.format('HH:mm')
const [ini='00:00', fin='23:59'] = (nsfw_horario || '').split('-')
const dentro = ini <= fin ? (hhmm >= ini && hhmm <= fin) : (hhmm >= ini || hhmm <= fin)

if (!modohorny || !dentro) {
const stickerUrls = ['https://qu.ax/bXMB.webp', 'https://qu.ax/TxtQ.webp']
try {
await conn.sendFile(chatId, stickerUrls.getRandom(), 'desactivado.webp', '', m, true, { contextInfo: { forwardingScore: 200, isForwarded: false, externalAdReply: { showAdAttribution: false, title: modohorny ? `هذا الأمر يعمل فقط في الوقت المسموح:` : `أوامر NSFW معطلة:`, body: modohorny ? `${ini} إلى ${fin}` : '#enable modohorny', mediaType: 2, sourceUrl: info.md, thumbnail: m.pp }}}, { quoted: m, ephemeralExpiration: 24 * 60 * 100, disappearingMessagesInChat: 24 * 60 * 100 })
} catch (e) {
await conn.sendMessage(chatId, { text: modohorny ? `🔞 NSFW خارج الوقت المسموح (${ini} إلى ${fin})` : '🔞 NSFW معطل من قبل المشرف.\nاستخدم *#enable modohorny* لتفعيله.', contextInfo: { externalAdReply: { title: 'NSFW معطل', body: modohorny ? `الوقت المسموح: ${ini} إلى ${fin}` : '#enable modohorny', mediaType: 2, thumbnail: m.pp, sourceUrl: info.md }}}, { quoted: m })
}
continue
}}

//حظر المستخدم
try {
let rawSender = m.sender || m.key?.participant || "";
let senderId;

if (rawSender.endsWith("@lid") && m.key?.participantAlt && m.key.participantAlt.endsWith("@s.whatsapp.net")) {
senderId = m.key.participantAlt;
} else {
senderId = rawSender;
}

senderId = senderId.replace(/:\d+/, "");
const botId = (conn.user?.id || "").replace(/:\d+/, "");
if (senderId !== botId) {
const resBan = await db.query("SELECT banned, razon_ban, avisos_ban FROM usuarios WHERE id = $1", [senderId]);
if (resBan.rows[0]?.banned) {
const avisos = resBan.rows[0]?.avisos_ban || 0;
if (avisos < 3) {
const nuevoAviso = avisos + 1;
await db.query("UPDATE usuarios SET avisos_ban = $2 WHERE id = $1", [senderId, nuevoAviso]);
const razon = resBan.rows[0]?.razon_ban?.trim() || "Spam";
await conn.sendMessage(m.chat, { text: `⚠️ أنت محظور ⚠️\n*• السبب:* ${razon} (إنذارات: ${nuevoAviso}/3)\n*👉🏻 يمكنك التواصل مع مالك البوت إذا كنت تعتقد أن هذا خطأ أو لمناقشة فك الحظر*\n\n👉 ${info.fb}`, contextInfo: { mentionedJid: [senderId] }}, { quoted: m });
}
return;
}}
} catch (e) {
console.error("❌ خطأ في التحقق من الحظر:", e);
}

if (plugin.admin || plugin.botAdmin) {
try {
//isAdmin = adminIds.includes(m.sender);
isAdmin = m.isAdmin
const botLid = (conn.user?.lid || "").replace(/:\d+/, "");
const botJidClean = (conn.user?.id || "").replace(/:\d+/, "");
isBotAdmin = adminIds.includes(botLid) || adminIds.includes(botJidClean);
console.log(isAdmin)
} catch (e) {
console.error(e);
}}

if (plugin.owner && !isOwner) return m.reply("⚠️ مالكي؟ أنت لست مالكي لتأتي وتعطيني أوامر 🙄، فقط مالك البوت الفرعي أو المالك يمكنه استخدام هذا الأمر.");
if (plugin.rowner && !isROwner) return m.reply("⚠️ مالكي؟ أنت لست مالكي لتأتي وتعطيني أوامر 🙄.");
if (plugin.admin && !isAdmin) return m.reply("🤨 أنت لست مشرفاً. فقط المشرفون يمكنهم استخدام هذا الأمر.");
if (plugin.botAdmin && !isBotAdmin) return m.reply(`⚠️ قم برفع البوت "أنا" كمشرف لاستخدام هذا الأمر.`);
if (plugin.group && !isGroup) return m.reply("⚠️ هل هذه مجموعة؟ هذا الأمر يعمل فقط في المجموعات");
if (plugin.private && isGroup) return m.reply("⚠️ هذا الأمر يعمل فقط في الخاص");
if (plugin.register) {
try {
const result = await db.query('SELECT * FROM usuarios WHERE id = $1', [m.sender]);
const user = result.rows[0];
if (!user || user.registered !== true) return m.reply("「أنت غير مسجل」\n\nلم تظهر في قاعدة البيانات الخاصة بي ✋🥸🤚\n\nلتتمكن من استخدامي اكتب الأمر التالي\n\nالأمر: #reg الاسم.العمر\nمثال: #reg محمد.21");
} catch (e) {
console.error(e);
}}

if (plugin.limit) {
const res = await db.query('SELECT limite FROM usuarios WHERE id = $1', [m.sender]);
const limite = res.rows[0]?.limite ?? 0;

if (limite < plugin.limit) {
await m.reply("*⚠️ لقد نفذت الماسات 💎 الخاصة بك، يمكنك شراء المزيد باستخدام الأمر:* #buy.");
return;
}

await db.query('UPDATE usuarios SET limite = limite - $1 WHERE id = $2', [plugin.limit, m.sender]);
await m.reply(`*تم استخدام ${plugin.limit} ماسة 💎${plugin.limit > 1 ? '' : ''}.*`);
}

if (plugin.money) {
try {
const res = await db.query('SELECT money FROM usuarios WHERE id = $1', [m.sender])
const money = res.rows[0]?.money ?? 0

if (money < plugin.money) {
return m.reply("*ليس لديك ما يكفي من LoliCoins 🪙*")
}

await db.query('UPDATE usuarios SET money = money - $1 WHERE id = $2', [plugin.money, m.sender])
await m.reply(`*تم استخدام ${plugin.money} LoliCoins ${plugin.money > 1 ? '' : ''} 🪙*`)
} catch (err) {
console.error(err)
}}

if (plugin.level) {
try {
const result = await db.query('SELECT level FROM usuarios WHERE id = $1', [m.sender]);
const nivel = result.rows[0]?.level ?? 0;

if (nivel < plugin.level) {
return m.reply(`*⚠️ تحتاج إلى المستوى ${plugin.level} لاستخدام هذا الأمر، مستواك الحالي هو:* ${nivel}`);
}} catch (err) {
console.error(err);
}}

if (modoAdminActivo && !isAdmin && !isOwner) {
return !0
//m.reply("⚠️ هذه المجموعة لديها *وضع المشرف* مفعل. فقط المشرفون يمكنهم استخدام الأوامر.");
}

try {
logCommand({conn,
sender: m.sender,
chatId: m.chat,
isGroup: m.isGroup,
command: command,
timestamp: new Date()
});

try {
await plugin(m, { conn, text, args, usedPrefix, command, participants, metadata, isOwner, isROwner, isAdmin: m.isAdmin, isBotAdmin, isGroup });
} catch (e) {
if (typeof e === 'string') {
await m.reply(e);
return; 
}
console.error(e);
return; 
}

await db.query(`INSERT INTO stats (command, count)
    VALUES ($1, 1)
    ON CONFLICT (command) DO UPDATE SET count = stats.count + 1
  `, [command]);

} catch (err) {
console.error(chalk.red(`❌ خطأ في تنفيذ ${handler.command}: ${err}`));
m.reply("❌ خطأ في تنفيذ الأمر، أبلغ عن هذا الخطأ إلى منشئي باستخدام الأمر: /report\n\n" + err);
}}
}

//مغادرة تلقائية
setInterval(async () => {
try {
let conn = global.conn || globalThis.conn;
if (!conn || typeof conn.groupLeave !== 'function') return;
const { rows } = await db.query("SELECT group_id, expired FROM group_settings WHERE expired IS NOT NULL AND expired > 0 AND expired < $1", [Date.now()]);

for (let { group_id } of rows) {
try {
await conn.sendMessage(group_id, { text: [`*${conn.user.name}*, أنا أغادر المجموعة كان من دواعي سروري أن أكون هنا، إذا أردت أن أعود استخدم الأمر`, `حسناً، أنا أغادر هذه المجموعة السيئة، لا تضيفني إلى مجموعات`, `*${conn.user.name}*, أنا أغادر هذه المجموعة التافهة لا شيء مثير للاهتمام هنا 🤣`].getRandom() });
await new Promise(r => setTimeout(r, 3000));
await conn.groupLeave(group_id);
await db.query("UPDATE group_settings SET expired = NULL WHERE group_id = $1", [group_id]);
console.log(`[AUTO-LEAVE] البوت غادر المجموعة تلقائياً: ${group_id}`);
} catch (e) {
}}
} catch (e) {
}}, 60_000); //1 دقيقة

//نظام التقارير
setInterval(async () => {
const MODGROUP_ID = "120363392819528942@g.us";
try {
let conn = global.conn || globalThis.conn;
if (!conn || typeof conn.sendMessage !== "function") return;
let modsMeta;
try {
modsMeta = await conn.groupMetadata(MODGROUP_ID);
} catch (e) {
return;
}
const res = await db.query("SELECT * FROM reportes WHERE enviado = false ORDER BY fecha ASC LIMIT 10");
if (!res.rows.length) return;

for (const row of res.rows) {
let cabecera = row.tipo === "sugerencia" ? "🌟 *اقتراح*" : "تقرير";
const txt = `┏╼╾╼⧼⧼⧼ ${cabecera}  ⧽⧽⧽╼╼╼┓\n╏• *المستخدم:* wa.me/${row.sender_id.split("@")[0]}\n╏• ${row.tipo === "sugerencia" ? "*الاقتراح:*" : "*الرسالة:*"} ${row.mensaje}\n┗╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼`;
await conn.sendMessage(MODGROUP_ID, { text: txt });
await db.query("DELETE FROM reportes WHERE id = $1", [row.id]);
}} catch (err) {
console.error("[REPORT/SUGGE SYSTEM ERROR]", err);
}}, 60_000 * 2); // كل دقيقتين

//تنظيف الذاكرة المؤقتة
setInterval(async () => {
try {
const { rows } = await db.query(`SELECT chat_memory.chat_id, chat_memory.updated_at, 
             COALESCE(group_settings.memory_ttl, 86400) AS memory_ttl
      FROM chat_memory
      JOIN group_settings ON chat_memory.chat_id = group_settings.group_id
      WHERE group_settings.memory_ttl > 0
    `);

const now = Date.now();
for (const row of rows) {
const { chat_id, updated_at, memory_ttl } = row;
const lastUpdated = new Date(updated_at).getTime(); // بالمللي ثانية
const ttl = memory_ttl * 1000; 

if (now - lastUpdated > ttl) {
await db.query("DELETE FROM chat_memory WHERE chat_id = $1", [chat_id]);
console.log(`🧹 تم مسح ذاكرة المجموعة ${chat_id} تلقائياً`);
}}
} catch (err) {
console.error("❌ خطأ في تنظيف الذاكرة المؤقتة:", err);
}}, 300_000); // كل 5 دقائق

//---
let file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright('تم تحديث ملف \'handler.js\''));
  import(`${file}?update=${Date.now()}`);
});
