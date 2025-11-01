import fetch from 'node-fetch';
import axios from 'axios';
import { instagramdl } from '@bochilteam/scraper';
import { fileTypeFromBuffer } from 'file-type';

const userRequests = {};

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) return m.reply(`⚠️ يرجى إدخال رابط فيديو إنستغرام.\n\nمثال: *${usedPrefix + command}* https://www.instagram.com/p/C60xXk3J-sb/`);
  
  if (userRequests[m.sender]) return await conn.reply(m.chat, `⏳ انتظر حتى ينتهي التحميل الحالي...`, m);
  
  userRequests[m.sender] = true;
  await m.react('⌛');

  try {
    const url = args[0];
    
    // محاولات التحميل من مصادر مختلفة
    const downloadAttempts = [
      async () => {
        const res = await fetch(`https://api.siputzx.my.id/api/d/igdl?url=${url}`);
        const data = await res.json();
        return data.data?.[0]?.url;
      },
      async () => {
        const res = await fetch(`https://api.fgmods.my.id/api/downloader/igdl?url=${url}&apikey=fgmods`);
        const data = await res.json();
        return data.result?.[0]?.url;
      },
      async () => {
        const result = await instagramdl(url);
        return result[0]?.url;
      },
      async () => {
        const res = await fetch(`https://api.erdwpe.com/api/download/instagram?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        return data.data?.[0]?.url;
      }
    ];

    let mediaUrl = null;
    
    // تجربة جميع المصادر
    for (const attempt of downloadAttempts) {
      try {
        mediaUrl = await attempt();
        if (mediaUrl) {
          console.log(`✅ تم العثور على الرابط من: ${attempt.name}`);
          break;
        }
      } catch (err) {
        console.log(`❌ فشل المصدر: ${err.message}`);
        continue;
      }
    }

    if (!mediaUrl) throw new Error('❌ تعذر تحميل الفيديو من أي مصدر');

    // تحديد نوع الملف
    const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('.mov') || mediaUrl.includes('.webm');
    const fileName = isVideo ? 'انستغرام.mp4' : 'انستغرام.jpg';
    const caption = isVideo ? '🎥 *فيديو انستغرام*' : '🖼️ *صورة انستغرام*';

    // إرسال الملف مباشرة
    await conn.sendFile(m.chat, mediaUrl, fileName, caption, m);
    await m.react('✅');

  } catch (error) {
    console.error(error);
    await m.reply(`❌ خطأ في التحميل: ${error.message}`);
    await m.react('❌');
  } finally {
    delete userRequests[m.sender];
  }
};

// الأمر التلقائي عند إرسال رابط انستجرام
const linkHandler = async (m, { conn }) => {
  const text = m.text || '';
  
  // كشف روابط انستجرام تلقائياً
  const instagramRegex = /https?:\/\/(www\.)?instagram\.com\/(p|reel|stories)\/[^\s]+/gi;
  const matches = text.match(instagramRegex);
  
  if (matches && matches.length > 0 && !m.text.startsWith('!') && !m.text.startsWith('/') && !m.text.startsWith('.')) {
    const url = matches[0];
    
    if (userRequests[m.sender]) return;
    userRequests[m.sender] = true;
    
    await m.react('⌛');
    
    try {
      // استخدام نفس منطق التحميل
      const res = await fetch(`https://api.siputzx.my.id/api/d/igdl?url=${url}`);
      const data = await res.json();
      const mediaUrl = data.data?.[0]?.url;
      
      if (mediaUrl) {
        const isVideo = mediaUrl.includes('.mp4');
        const fileName = isVideo ? 'انستغرام.mp4' : 'انستغرام.jpg';
        const caption = isVideo ? '🎥 *فيديو انستغرام*' : '🖼️ *صورة انستغرام*';
        
        await conn.sendFile(m.chat, mediaUrl, fileName, caption, m);
        await m.react('✅');
      } else {
        throw new Error('لم يتم العثور على وسائط');
      }
    } catch (error) {
      await m.reply('❌ تعذر تحميل محتوى انستجرام تلقائياً. جرب استخدام الأمر !انستغرام');
      await m.react('❌');
    } finally {
      delete userRequests[m.sender];
    }
  }
};

// تسجيل المعالجين
handler.help = ['انستغرام *<رابط>*'];
handler.tags = ['تحميل'];
handler.command = /^(instagramdl|instagram|igdl|ig|انستغرام|انستا|انستقرام)$/i;
handler.limit = 1;
handler.register = true;

// تصدير المعالج التلقائي
export { linkHandler };
export default handler;
