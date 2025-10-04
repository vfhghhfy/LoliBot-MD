import { sticker } from '../lib/sticker.js';
import { db } from '../lib/postgres.js';
import axios from 'axios';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  // جلب إعدادات المستخدم من قاعدة البيانات (اسم الحزمة والمؤلف)
  const userResult = await db.query(
    'SELECT sticker_packname, sticker_author FROM usuarios WHERE id = $1',
    [m.sender]
  );
  const user = userResult.rows[0] || {};
  let f = user.sticker_packname || global.info.packname;
  let g =
    user.sticker_packname && user.sticker_author
      ? user.sticker_author
      : user.sticker_packname && !user.sticker_author
      ? ''
      : global.info.author;

  // التحقق من وجود نص
  let text;
  if (args.length >= 1) {
    text = args.join(' ');
  } else if (m.quoted && m.quoted.text) {
    text = m.quoted.text;
  } else
    return m.reply(
      '⚠️ *استخدام غير صحيح!*\n\nيرجى كتابة نص لإنشاء الملصق.\nمثال:\n' +
        `*${usedPrefix + command}* هذا نص تجريبي`
    );

  if (!text)
    return m.reply(
      '⚠️ *استخدام غير صحيح!*\n\nيجب إضافة نص لإنشاء الملصق.'
    );

  // تحديد الشخص المستهدف أو المستخدم نفسه
  const who =
    (m.mentionedJid && m.mentionedJid[0]) ||
    (m.fromMe ? conn.user.jid : m.sender);

  // إزالة المنشن من النص إن وُجد
  const mentionRegex = new RegExp(
    `@${who.split('@')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`,
    'g'
  );
  const mishi = text.replace(mentionRegex, '');

  // تحديد الحد الأقصى للنص
  if (mishi.length > 65)
    return m.reply('⚠️ النص لا يمكن أن يتجاوز *65 حرفًا*.');

  // جلب الصورة الشخصية واسم المستخدم
  const pp =
    (await conn
      .profilePictureUrl(who)
      .catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')) || '';
  const nombre = await conn.getName(who);

  // إنشاء كائن الطلب لخدمة إنشاء الاقتباس
  const obj = {
    type: 'quote',
    format: 'png',
    backgroundColor: '#000000',
    width: 512,
    height: 768,
    scale: 2,
    messages: [
      {
        entities: [],
        avatar: true,
        from: {
          id: 1,
          name: `${who?.name || nombre}`,
          photo: { url: `${pp}` },
        },
        text: mishi,
        replyMessage: {},
      },
    ],
  };

  // إرسال الطلب إلى API وإنشاء الصورة
  const json = await axios.post('https://bot.lyo.su/quote/generate', obj, {
    headers: { 'Content-Type': 'application/json' },
  });
  const buffer = Buffer.from(json.data.result.image, 'base64');

  // تحويل الصورة إلى ملصق
  let stiker = await sticker(buffer, false, f, g);

  // إرسال الملصق إلى المستخدم
  if (stiker)
    return conn.sendFile(
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
            body: info.vs,
            mediaType: 2,
            sourceUrl: info.md,
            thumbnail: m.pp,
          },
        },
      },
      { quoted: m }
    );
};

// أوامر المساعدة
handler.help = ['qc', 'اقتباس', 'قول', 'نص_ستيكر'];

// تصنيف الأمر
handler.tags = ['sticker'];

// دعم أوامر عربية وإنجليزية
handler.command = /^(qc|quote|اقتباس|قول|نص_ستيكر)$/i;

// يتطلب التسجيل
handler.register = true;

export default handler;
