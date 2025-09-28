import {toAudio} from '../lib/converter.js';

const handler = async (m, {conn, usedPrefix, command}) => {
    const q = m.quoted ? m.quoted : m;
    const mime = (q || q.msg).mimetype || q.mediaType || '';
    
    if (!/video|audio/.test(mime)) {
        throw `
╭───「 🎵 *تحويل إلى MP3* 🎵 」───•
│
│ ❌ *لم يتم الرد على فيديو أو صوت*
│
│ 📌 *الاستخدام الصحيح:*
│ ▸ قم بالرد على فيديو أو رسالة صوتية
│ ▸ ثم استخدم الأمر:
│ ▸ *${usedPrefix + command}*
│
│ 🌟 *الأوامر المدعومة:*
│ ▸ \`${usedPrefix}tomp3\`
│ ▸ \`${usedPrefix}لصوت\`
│ ▸ \`${usedPrefix}لموسيقى\`
│ ▸ \`${usedPrefix}تحويلصوت\`
│
╰───「 🎀 ${info.botName} 🎀 」───•`.trim();
    }
    
    const media = await q.download();
    if (!media) {
        throw `
╭───「 ❌ *خطأ في التحميل* ❌ 」───•
│
│ ⚠️ *حدث خطأ أثناء تحميل الملف*
│ 🔄 *يرجى المحاولة مرة أخرى*
│
│ 💡 *الأسباب المحتملة:*
│ ▸ الملف كبير جداً
│ ▸ مشكلة في الاتصال
│ ▸ الملف تالف
│
╰───「 🌸 ${info.botName} 🌸 」───•`.trim();
    }
    
    // رد تفاعلي
    await m.react('🔄');
    
    await conn.sendMessage(m.chat, { 
        text: `
╭───「 🎵 *جاري التحويل* 🎵 」───•
│
│ ⏳ *جاري معالجة الملف...*
│ 🎯 *التحويل:* MP4 → MP3
│ 📊 *الحجم:* ${(media.length / 1024 / 1024).toFixed(2)} MB
│
│ 🎧 *سيصبح جاهزاً قريباً*
│
╰───「 🌸 ${info.botName} 🌸 」───•`.trim()
    }, { quoted: m });
    
    try {
        const audio = await toAudio(media, 'mp4');
        
        if (!audio.data) {
            await m.react('❌');
            throw `
╭───「 ❌ *خطأ في التحويل* ❌ 」───•
│
│ ⚠️ *فشل في تحويل الملف إلى MP3*
│
│ 💡 *الحلول المقترحة:*
│ ▸ تأكد أن الملف يحتوي على صوت
│ ▸ جرب بملف آخر
│ ▸ الملف قد يكون تالفاً
│
╰───「 🎀 ${info.botName} 🎀 」───•`.trim();
        }
        
        // إرسال الملف الصوتي
        await conn.sendMessage(m.chat, { 
            audio: audio.data, 
            mimetype: 'audio/mpeg',
            ptt: true,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: false
            }
        }, { quoted: m });
        
        // رسالة نجاح
        await conn.sendMessage(m.chat, {
            text: `
╭───「 ✅ *تم التحويل بنجاح* ✅ 」───•
│
│ 🎵 *تم تحويل الملف إلى MP3*
│ 📊 *الحجم:* ${(audio.data.length / 1024 / 1024).toFixed(2)} MB
│ 🎧 *الصيغة:* MP3
│
│ 💫 *يمكنك الاستماع الآن*
│ 📥 *أو حفظ الملف الصوتي*
│
╰───「 🎀 ${info.botName} 🎀 」───•`.trim()
        }, { quoted: m });
        
        await m.react('✅');
        
    } catch (error) {
        await m.react('❌');
        await conn.sendMessage(m.chat, { 
            text: `
╭───「 🚨 *خطأ غير متوقع* 🚨 」───•
│
│ ⚠️ *حدث خطأ أثناء المعالجة*
│ 📝 *التفاصيل:* ${error.message}
│
│ 🔄 *يرجى المحاولة مرة أخرى*
│ 📞 *إذا استمر الخطأ تواصل مع المطور*
│
╰───「 🌸 ${info.botName} 🌸 」───•`.trim()
        }, { quoted: m });
    }
};

handler.help = ['tomp3 <reply>', 'لصوت <رد>', 'لموسيقى <رد>'];
handler.tags = ['convertidor', 'audio', 'أدوات'];
handler.command = /^(to(mp3|audio)|لصوت|لموسيقى|تحويلصوت|mp3)$/i;
handler.register = true;

export default handler;
