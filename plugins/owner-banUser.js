import { db } from "../lib/postgres.js";

const handler = async (m, { conn, text, command }) => {
let targetJid = null;

// 🟢 استخراج المستخدم المستهدف (من المنشن أو الرقم)
if (m.isGroup && m.mentionedJid?.[0]) {
  targetJid = m.mentionedJid[0];
}

if (!targetJid && text?.match(/\d{5,}/)) {
  const number = text.match(/\d{5,}/)?.[0];
  targetJid = number + "@s.whatsapp.net";
}

// 🟥 إذا ما تم تحديد أي مستخدم
if (!targetJid) return m.reply("🤓 منشن المستخدم أو أرسل رقمه يا ذكي !");
const cleanJid = targetJid.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

try {
  const res = await db.query("SELECT id FROM usuarios WHERE id = $1", [cleanJid]);
  if (!res.rowCount) return m.reply("❌ هذا المستخدم غير موجود في قاعدة البيانات.");

  // 🛑 أمر الحظر
  if (command === "banuser" || command === "حظر") {
    let ban = 'https://qu.ax/SJJt.mp3'
    let razon = text?.replace(/^(@\d{5,}|[+]?[\d\s\-()]+)\s*/g, "").trim() || null;
    await db.query("UPDATE usuarios SET banned = true, razon_ban = $2 WHERE id = $1", [cleanJid, razon]);

    try { 
      await conn.sendMessage(m.chat, { 
        audio: { url: ban }, 
        contextInfo: { 
          externalAdReply: { 
            title: `⚠️ المستخدم تم حظره 🚫`, 
            body: info.wm, 
            previewType: "PHOTO", 
            thumbnailUrl: null, 
            thumbnail: m.pp, 
            sourceUrl: info.md, 
            showAdAttribution: true
          }
        }, 
        ptt: true, 
        mimetype: 'audio/mpeg', 
        fileName: `error.mp3` 
      }, { quoted: m })
    } catch (e) {
      m.reply(`🚫 المستخدم @${cleanJid.split("@")[0]} تم *حظره* من استخدام البوت.${razon ? `\n\n📌 *السبب:* ${razon}` : ""}`, { mentions: [cleanJid]});
    }
  }

  // ✅ أمر فك الحظر
  if (command === "unbanuser" || command === "فكحظر") {
    await db.query("UPDATE usuarios SET banned = false, avisos_ban = 0, razon_ban = NULL WHERE id = $1", [cleanJid]);
    return m.reply(`✅ المستخدم @${cleanJid.split("@")[0]} تم *فك الحظر* عنه ويمكنه استخدام البوت من جديد.`, { mentions: [cleanJid] });
  }

} catch (err) {
  console.error(err);
  return m.reply("❌ حدث خطأ أثناء تنفيذ الأمر.");
}};
  
// 📝 المساعدة
handler.help = [
  'banuser @tag|رقم', 
  'unbanuser @tag|رقم',
  'حظر @منشن|رقم', 
  'فكحظر @منشن|رقم'
];

handler.tags = ['owner'];
handler.command = /^(banuser|unbanuser|حظر|فكحظر)$/i;
handler.owner = true;

export default handler;
