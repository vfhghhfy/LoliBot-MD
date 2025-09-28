import { webp2png } from '../lib/webp2mp4.js';

const handler = async (m, { conn, usedPrefix, command }) => {
    const notStickerMessage = `
╭───「 🖼️ *تحويل الملصق إلى صورة* 🖼️ 」───•
│
│ ❌ *لم يتم الرد على ملصق*
│
│ 📌 *الاستخدام الصحيح:*
│ ▸ قم بالرد على الملصق المراد تحويله
│ ▸ ثم استخدم الأمر:
│ ▸ *${usedPrefix + command}*
│
╰───「 🎀 ${info.botName} 🎀 」───•`.trim();

    if (!m.quoted) throw notStickerMessage;
    
    const q = m.quoted;
    const mime = q?.mimetype || '';
    
    if (!mime.includes('webp')) throw notStickerMessage;
    
    // رد تفاعلي جميل
    await m.react('🔄');
    
    await conn.sendMessage(m.chat, { 
        text: `
╭───「 🖼️ *جاري التحويل* 🖼️ 」───•
│
│ 🎨 *جاري تحويل الملصق إلى صورة...*
│ ⏳ *يرجى الانتظار قليلاً*
│
│ 📦 *المحتوى:* ملصق → صورة
│ 🎯 *النوع:* WebP → PNG
│
╰───「 🌸 ${info.botName} 🌸 」───•`.trim()
    }, { quoted: m });
    
    try {
        const media = await q.download();
        const out = await webp2png(media).catch(() => null) || Buffer.alloc(0);
        
        if (out.length === 0) {
            await m.react('❌');
            throw new Error('فشل في تحويل الملصق');
        }
        
        await conn.sendMessage(m.chat, {
            image: out,
            caption: `
╭───「 ✅ *تم التحويل بنجاح* ✅ 」───•
│
│ 🖼️ *تم تحويل الملصق إلى صورة*
│ 📊 *الحجم:* ${(out.length / 1024).toFixed(2)} KB
│ 🎨 *الصيغة:* PNG
│
│ 💡 *معلومة:*
│ ▸ يمكنك حفظ الصورة الآن
│ ▸ أو استخدامها كما تريد
│
╰───「 🎀 ${info.botName} 🎀 」───•`.trim(),
            mentions: [m.sender]
        }, { quoted: m });
        
        await m.react('✅');
        
    } catch (error) {
        await m.react('❌');
        await conn.sendMessage(m.chat, { 
            text: `
╭───「 ❌ *خطأ في التحويل* ❌ 」───•
│
│ ⚠️ *حدث خطأ أثناء التحويل*
│ 📝 *السبب:* ${error.message}
│
│ 🔄 *حاول مرة أخرى:*
│ ▸ تأكد أنك قمت بالرد على ملصق
│ ▸ حاول بملصق آخر
│
╰───「 🌸 ${info.botName} 🌸 」───•`.trim()
        }, { quoted: m });
    }
};

handler.help = ['toimg <reply>'];
handler.tags = ['convertidor', 'tools'];
handler.command = ['toimg', 'jpg', 'img', 'لصورة', 'تحويل', 'صورة'];
handler.register = true;

export default handler;
