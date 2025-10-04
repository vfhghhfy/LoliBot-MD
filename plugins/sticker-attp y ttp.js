import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'
import { db } from '../lib/postgres.js';

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const userResult = await db.query('SELECT sticker_packname, sticker_author FROM usuarios WHERE id = $1', [m.sender]);
  const user = userResult.rows[0] || {};

  let f = user.sticker_packname || global.info.packname;
  let g = (user.sticker_packname && user.sticker_author ? user.sticker_author : (user.sticker_packname && !user.sticker_author ? '' : global.info.author));

  if (!text)
    return m.reply(`⚠️ اكتب النص الذي تريد تحويله إلى ملصق\n📌 مثال:\n*${usedPrefix + command}* هذا ملصقي الجديد`);

  let teks = encodeURI(text);
  conn.fakeReply(
    m.chat,
    `⏳ انتظر قليلاً... أقوم بتحويل النص إلى ملصق 👏\n\n> *قد يستغرق هذا بعض الدقائق*`,
    '0@s.whatsapp.net',
    `الرجاء عدم الإرسال المتكرر.`,
    'status@broadcast'
  );

  // 🌀 أمر ATTp أو ملصق متحرك
  if (command === 'attp' || command === 'ملصقمتحرك') {
    if (text.length > 40)
      return m.reply(`⚠️ النص لا يمكن أن يحتوي على أكثر من 40 حرفًا.\n\n✍️ جرب كتابة نص أقصر.`);

    let res = await fetch(`https://api.neoxr.eu/api/attp?text=${teks}%21&color=%5B%22%23FF0000%22%2C+%22%2300FF00%22%2C+%22%230000FF%22%5D&apikey=GataDios`);
    let json = await res.json();

    if (!json.status)
      return m.reply('❌ حدث خلل في واجهة الـ API، حاول لاحقًا.');

    let stiker = await sticker(null, json.data.url, f, g);
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
            body: info.vs,
            mediaType: 2,
            sourceUrl: info.md,
            thumbnail: m.pp
          }
        }
      },
      { quoted: m }
    );
  }

  // 🧊 أمر TTP أو Brat أو ملصق نصي
  if (command === 'ttp' || command === 'brat' || command === 'ملصق' || command === 'برات') {
    if (text.length > 300)
      return m.reply(`⚠️ النص لا يمكن أن يحتوي على أكثر من 300 حرف.\n\n✍️ جرب نصًا أقصر.`);

    let res = await fetch(`https://api.neoxr.eu/api/brat?text=${teks}&apikey=GataDios`);
    let json = await res.json();

    if (!json.status)
      return m.reply('❌ حدث خلل في واجهة الـ API، حاول لاحقًا.');

    let stiker = await sticker(null, json.data.url, f, g);
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
            body: info.vs,
            mediaType: 2,
            sourceUrl: info.md,
            thumbnail: m.pp
          }
        }
      },
      { quoted: m }
    );
  }

  // 🎥 أمر Bratvid أو براتفيديو (ملصق متحرك بالفيديو)
  if (command === 'brat2' || command === 'bratvid' || command === 'براتفيديو') {
    if (text.length > 250)
      return m.reply(`⚠️ النص لا يمكن أن يحتوي على أكثر من 250 حرف.\n\n✍️ جرب نصًا أقصر.`);

    let res = await fetch(`https://api.neoxr.eu/api/bratvid?text=${teks}&apikey=GataDios`);
    let json = await res.json();

    if (!json.status)
      return m.reply('❌ حدث خلل في واجهة الـ API، حاول لاحقًا.');

    let stiker = await sticker(null, json.data.url, f, g);
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
            body: info.vs,
            mediaType: 2,
            sourceUrl: info.md,
            thumbnail: m.pp
          }
        }
      },
      { quoted: m }
    );
  }
};

handler.help = ['attp', 'brat', 'bratvid', 'ملصق', 'ملصقمتحرك', 'برات', 'براتفيديو'];
handler.tags = ['sticker'];
handler.command = /^(attp|ttp|ttp2|ttp3|ttp4|attp2|brat|brat2|bratvid|ملصق|ملصقمتحرك|برات|براتفيديو)$/i;
handler.register = true;

export default handler;
