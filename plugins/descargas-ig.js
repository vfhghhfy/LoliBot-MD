import fetch from 'node-fetch';
import axios from 'axios';
import { instagramdl } from '@bochilteam/scraper';
import { fileTypeFromBuffer } from 'file-type';
const userMessages = new Map();
const userRequests = {};

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const datas = global;
  if (!args[0]) return m.reply(`⚠️ يرجى إدخال رابط فيديو إنستغرام مع الأمر.\n\nمثال: *${usedPrefix + command}* https://www.instagram.com/p/C60xXk3J-sb/?igsh=YzljYTk1ODg3Zg==`) 
  
  if (userRequests[m.sender]) return await conn.reply(m.chat, `يا @${m.sender.split('@')[0]}, اهدأ، أنت بالفعل تقوم بتحميل شيء ما 😒\nانتظر حتى تنتهي طلبك الحالي قبل تقديم طلب آخر...`, m)
  
  userRequests[m.sender] = true;
  await m.react('⌛');
  
  try {
    const downloadAttempts = [
      async () => {
        const res = await fetch(`https://api.siputzx.my.id/api/d/igdl?url=${args[0]}`);
        const data = await res.json();
        const fileType = data.data[0].url.includes('.webp') ? 'image' : 'video';
        return { 
          url: data.data[0].url, 
          type: fileType, 
          caption: fileType === 'image' ? '_*ها هي صورتك من إنستغرام*_' : '*ها هو الفيديو من إنستغرام*'
        };
      },
      async () => {
        const res = await fetch(`${info.fgmods.url}/downloader/igdl?url=${args[0]}&apikey=${info.fgmods.key}`);
        const data = await res.json();
        const result = data.result[0];
        const fileType = result.url.endsWith('.jpg') || result.url.endsWith('.png') ? 'image' : 'video';
        return { 
          url: result.url, 
          type: fileType, 
          caption: fileType === 'image' ? '_*ها هي صورتك من إنستغرام*_' : '*ها هو الفيديو من إنستغرام*'
        };
      },
      async () => {
        const apiUrl = `${info.apis}/download/instagram?url=${encodeURIComponent(args[0])}`;
        const apiResponse = await fetch(apiUrl);
        const delius = await apiResponse.json();
        return { 
          url: delius.data[0].url, 
          type: delius.data[0].type, 
          caption: delius.data[0].type === 'image' ? '_*ها هي صورتك من إنستغرام*_' : '*ها هو الفيديو من إنستغرام*'
        };
      },
      async () => {
        const resultssss = await instagramdl(args[0]);
        const shortUrl3 = await (await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`)).text();
        const txt4 = `_${shortUrl3}_`.trim();
        return { 
          url: resultssss[0].url, 
          type: resultssss[0].url.endsWith('.mp4') ? 'video' : 'image', 
          caption: txt4 
        };
      },
    ];

    let fileData = null;
    for (const attempt of downloadAttempts) {
      try {
        fileData = await attempt();
        if (fileData) break; 
      } catch (err) {
        console.error(`خطأ في المحاولة: ${err.message}`);
        continue; 
      }
    }

    if (!fileData) throw new Error('تعذر تحميل الملف من أي من واجهات البرمجة');
    
    const fileName = fileData.type === 'image' ? 'انستغرام.jpg' : 'انستغرام.mp4';
    await conn.sendFile(m.chat, fileData.url, fileName, fileData.caption, m);
    await m.react('✅');
  } catch (e) {
    await m.react('❌');
    console.log(e);
    handler.limit = 0;
  } finally {
    delete userRequests[m.sender];
  }
};

handler.help = ['انستغرام *<رابط>*'];
handler.tags = ['تحميل'];
handler.command = /^(instagramdl|instagram|igdl|ig|انستغرام|انستا|انستقرام)$/i;
handler.limit = 1;
handler.register = true;

export default handler;

const getBuffer = async (url, options) => {
  options = options || {};
  const res = await axios({ 
    method: 'get', 
    url, 
    headers: { 
      'DNT': 1, 
      'Upgrade-Insecure-Request': 1 
    }, 
    ...options, 
    responseType: 'arraybuffer' 
  });
  const buffer = Buffer.from(res.data, 'binary');
  const detectedType = await fileTypeFromBuffer(buffer);
  if (!detectedType || (detectedType.mime !== 'image/jpeg' && detectedType.mime !== 'image/png' && detectedType.mime !== 'video/mp4')) {
    return null;
  }
  return { buffer, detectedType };
};
