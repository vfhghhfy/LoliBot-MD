import {
  makeWASocket,
  useMultiFileAuthState,
  // 🔴 تم تصحيح الخطأ هنا (تم حذف حرف 'z' الإضافي)
  fetchLatestBaileysVersion, 
  makeCacheableSignalKeyStore,
  DisconnectReason
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import qrcode from 'qrcode';
import chalk from "chalk";
import NodeCache from 'node-cache';
import { handler, callUpdate, participantsUpdate, groupsUpdate } from '../handler.js';

// تهيئة المصفوفة العالمية للبوتات الفرعية
if (globalThis.conns instanceof Array) console.log()
else globalThis.conns = []

// دالة تنظيف المعرف
const cleanJid = (jid = "") => jid.replace(/:\d+/, "").split("@")[0];
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });
let reintentos = {}; 

/**
 * بدء تشغيل البوت الفرعي
 */
export async function startSubBot(m, conn, caption = '', isCode = false, phone = '', chatId = '', commandFlags = {}) {
const id = phone || (m?.sender || '').split('@')[0];
const sessionFolder = `./jadibot/${id}`;
const senderId = m?.sender;
const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
const { version } = await fetchLatestBaileysVersion();

// إخفاء معلومات السجل
console.info = () => {} 

// إنشاء اتصال البوت الفرعي
const sock = makeWASocket({
  logger: pino({ level: 'silent' }),
  printQRInTerminal: false,
  browser: ['Windows', 'Chrome'],
  auth: state,
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  syncFullHistory: false,
  getMessage: async () => '',
  msgRetryCounterCache,
  userDevicesCache,
  cachedGroupMetadata: async (jid) => groupCache.get(jid),
  version,
  keepAliveIntervalMs: 60_000,
  maxIdleTimeMs: 120_000,
});

// تحديث بيانات الاعتماد
sock.ev.on('creds.update', saveCreds);

// إعداد أحداث المجموعات
setupGroupEvents(sock);
sock.isInit = false
let isInit = true

// معالجة تحديثات الاتصال
sock.ev.on('connection.update', async ({ connection, lastDisconnect, isNewLogin, qr }) => {
if (isNewLogin) sock.isInit = false
  
if (connection === 'open') {
sock.isInit = true
sock.userId = cleanJid(sock.user?.id?.split("@")[0])
const ownerName = sock.authState.creds.me?.name || "-";
sock.uptime = Date.now();
reintentos[sock.userId] = 0;

// تجنب التكرار في المصفوفة العالمية
if (globalThis.conns.find(c => c.userId === sock.userId)) return;
globalThis.conns.push(sock); 

// إرسال رسالة نجاح الاتصال
if (isCode && m?.chat && senderId.endsWith("@s.whatsapp.net")) {
conn.sendMessage(m.chat, { 
  text: `*تم الاتصال بنجاح مع واتساب ✅*\n\n*💻 البوت:* +${sock.userId}\n*👤 المالك:* ${ownerName}\n\n*ملاحظة: مع ميزة إعادة التشغيل التلقائي (بيتا)*، إذا تم إعادة تشغيل البوت الرئيسي أو إيقافه، سيتم إعادة تشغيل البوتات الفرعية تلقائياً، مما يضمن بقائها نشطة دون انقطاع.\n\n> *انضم إلى قناتنا للاطلاع على جميع التحديثات والأخبار حول البوت*\n${info.nna2}` 
}, { quoted: m });
delete commandFlags[senderId];
}
console.log(chalk.bold.cyanBright(`\n✅ تم توصيل البوت الفرعي: ${sock.userId} `))
}

// معالجة إغلاق الاتصال
if (connection === 'close') {
const botId = sock.userId || id;
const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.reason || 0;
const intentos = reintentos[botId] || 0;
reintentos[botId] = intentos + 1;

// معالجة الأخطاء المصادقة
if ([401, 403].includes(reason)) {
if (intentos < 5) {
console.log(`${chalk.red(`[❌ البوت الفرعي ${botId}] تم إغلاق الاتصال (الرمز ${reason}) محاولة ${intentos}/5`)} → إعادة المحاولة...`);
setTimeout(() => {
startSubBot(m, conn, caption, isCode, phone, chatId, {});
}, 3000);
} else {
console.log(chalk.red(`[💥 البوت الفرعي ${botId}] فشل بعد 5 محاولات. حذف الجلسة.`));
try {
fs.rmSync(sessionFolder, { recursive: true, force: true });
} catch (e) {
console.error(`[⚠️] تعذر حذف المجلد ${sessionFolder}:`, e);
}
delete reintentos[botId];
}
return;
}

// معالجة انقطاعات الاتصال المؤقتة
if ([DisconnectReason.connectionClosed, DisconnectReason.connectionLost, DisconnectReason.timedOut, DisconnectReason.connectionReplaced].includes(reason)) {
setTimeout(() => {
startSubBot(m, conn, caption, isCode, phone, chatId, {});
}, 3000);
return;
}

// إعادة المحاولة العامة
setTimeout(() => {
startSubBot(m, conn, caption, isCode, phone, chatId, {});
}, 3000);
}

// معالجة رمز QR
if (qr && !isCode && m && conn && commandFlags[senderId]) {
try {
const qrBuffer = await qrcode.toBuffer(qr, { scale: 8 });
const msg = await conn.sendMessage(m.chat, { image: qrBuffer, caption: caption }, { quoted: m });
delete commandFlags[senderId];
setTimeout(() => conn.sendMessage(m.chat, { delete: msg.key }).catch(() => {}), 60000);
} catch (err) {
console.error("[خطأ في QR]", err);
}}

// معالجة رمز الاقتران
if (qr && isCode && phone && conn && chatId && commandFlags[senderId]) {
try {
let codeGen = await sock.requestPairingCode(phone);
codeGen = codeGen.match(/.{1,4}/g)?.join("-") || codeGen;
const msg = await conn.sendMessage(chatId, { image: { url: 'https://files.catbox.moe/re5wkq.jpg' }, caption: caption }, { quoted: m });
const msgCode = await conn.sendMessage(chatId, { text: codeGen }, { quoted: m });
delete commandFlags[senderId];
setTimeout(async () => {
try {
await conn.sendMessage(chatId, { delete: msg.key });
await conn.sendMessage(chatId, { delete: msgCode.key });
} catch {}
}, 60000);
} catch (err) {
console.error("[خطأ في الرمز]", err);
}}
});

// معالجة الأخطاء غير المتوقعة
process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

// معالجة الرسائل الواردة
sock.ev.on("messages.upsert", async ({ messages, type }) => {
if (type !== "notify") return;
for (const msg of messages) {
if (!msg.message) continue;
const start = Math.floor(sock.uptime / 1000);
if (msg.messageTimestamp < start || ((Date.now() / 1000) - msg.messageTimestamp) > 60) continue;
  
// تصفية رسائل معينة
if(msg.key.id.startsWith('NJX-') || msg.key.id.startsWith('Lyru-') || msg.key.id.startsWith('EvoGlobalBot-') || msg.key.id.startsWith('BAE5') && msg.key.id.length === 16 || msg.key.id.startsWith('3EB0') && msg.key.id.length === 12 || msg.key.id.startsWith('3EB0') || msg.key.id.startsWith('3E83') || msg.key.id.startsWith('3E38') && (msg.key.id.length === 20 || msg.key.id.length === 22) || msg.key.id.startsWith('B24E') || msg.key.id.startsWith('8SCO') && msg.key.id.length === 20 || msg.key.id.startsWith('FizzxyTheGreat-')) return
  
try {
await handler(sock, msg);
} catch (err) {
console.error(err);
}}
});
  
// معالجة المكالمات
sock.ev.on("call", async (calls) => {
try {
for (const call of calls) {
await callUpdate(sock, call);
}} catch (err) {
console.error(chalk.red("❌ خطأ في معالجة call.update:"), err);
}
});  
}

/**
 * إعداد أحداث المجموعات للبوت الفرعي
 */
function setupGroupEvents(sock) {
sock.ev.on("group-participants.update", async (update) => {
console.log(update)
try {
await participantsUpdate(sock, update);
} catch (err) {
console.error("[ ❌ ] خطأ في البوت الفرعي في معالجة group-participants.update:", err);
}});

sock.ev.on("groups.update", async (updates) => {
console.log(updates)
try {
for (const update of updates) {
await groupsUpdate(sock, update);
}} catch (err) {
console.error("[ ❌ ] خطأ في البوت الفرعي في معالجة groups.update:", err);
}});
}
