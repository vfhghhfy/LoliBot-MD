import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'
import { db } from '../lib/postgres.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const userResult = await db.query(
    'SELECT sticker_packname, sticker_author FROM usuarios WHERE id = $1',
    [m.sender]
  );
  const user = userResult.rows[0] || {};
  let stiker = false;
  let f = user.sticker_packname || global.info.packname;
  let g =
    user.sticker_packname && user.sticker_author
      ? user.sticker_author
      : user.sticker_packname && !user.sticker_author
      ? ''
      : global.info.author;

  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || '';

    // ✅ معالجة الصور والفيديوهات والملصقات
    if (/webp|image|video/g.test(mime)) {
      if (/video/g.test(mime))
        if ((q.msg || q).seconds > 18)
          return m.reply(
            '⚠️ المقطع طويل جدًا! 😤 يجب ألا يتجاوز طول الفيديو 12 ثانية فقط.'
          );

      let img = await q.download?.();
      if (!img)
        return m.reply(
          `🖼️ أين الصورة؟ 🤔\nالرجاء الرد على صورة أو فيديو لإنشاء الملصق.\nاستخدم الأمر: ${usedPrefix + command}`
        );

      let out;
      try {
        stiker = await sticker(img, false, f, g);
      } catch (e) {
        console.error(e);
      } finally {
        if (!stiker) {
          if (/webp/g.test(mime)) out = await webp2png(img);
          else if (/image/g.test(mime)) out = await uploadImage(img);
          else if (/video/g.test(mime)) out = await uploadFile(img);
          if (typeof out !== 'string') out = await uploadImage(img);
          stiker = await sticker(false, out, f, g);
        }
      }
    } else if (args[0]) {
      if (isUrl(args[0])) stiker = await sticker(false, args[0], f, g);
      else return m.reply('❌ الرابط غير صالح، تأكد من أنه رابط مباشر لصورة (jpg, png, gif).');
    }
  } catch (e) {
    console.error(e);
    if (!stiker) stiker = e;
  } finally {
    if (stiker)
      conn.sendFile(
        m.chat,
        stiker,
        'sticker.webp',
        '',
        m,
        true,
        {
          contextInfo: {
            forwardingScore: 200,
            isForwarded: false,
            externalAdReply: {
              showAdAttribution: false,
              title: info.wm,
              body: ``,
              mediaType: 2,
              sourceUrl: [info.nna, info.nna2, info.md, info.yt].getRandom(),
              thumbnail: m.pp,
            },
          },
        },
        { quoted: m }
      );
    else
      return m.reply(
        `🖼️ لم أجد صورة 😕\nالرجاء الرد على صورة أو فيديو لإنشاء الملصق.\nاستخدم: ${usedPrefix + command}`
      );
  }
};

// 🧾 المساعدة والوسوم
handler.help = ['sticker', 's', 'ملصق', 'ستيكر'];
handler.tags = ['sticker'];

// 🎯 الأوامر باللغتين
handler.command = /^(s|sticker|ملصق|ستيكر)$/i;

handler.register = true;
export default handler;

// ✅ دالة التحقق من الروابط
const isUrl = (text) => {
  return text.match(
    new RegExp(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/,
      'gi'
    )
  );
};
