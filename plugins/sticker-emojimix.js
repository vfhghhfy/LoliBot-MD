import { sticker } from '../lib/sticker.js'
import { db } from '../lib/postgres.js'
import fetch from 'node-fetch'
import fs from "fs"

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  // جلب إعدادات حزمة الملصقات الخاصة بالمستخدم من قاعدة البيانات
  const userResult = await db.query('SELECT sticker_packname, sticker_author FROM usuarios WHERE id = $1', [m.sender])
  const user = userResult.rows[0] || {}

  // اسم الحزمة والمؤلف الافتراضي
  let f = user.sticker_packname || global.info.packname
  let g = (user.sticker_packname && user.sticker_author
    ? user.sticker_author
    : (user.sticker_packname && !user.sticker_author
      ? ''
      : global.info.author))

  // تحقق من وجود رمزين إيموجي مفصولين بـ +
  if (!args[0])
    return m.reply(`⚠️ يجب عليك استخدام *إيموجيين مفصولين بعلامة +*\n📌 مثال:\n*${usedPrefix + command}* 😺+😆`)

  try {
    // تقسيم الإيموجيين
    let [emoji1, emoji2] = text.split`+`

    // إرسال تنبيه قبل المعالجة
    await conn.sendMessage(m.chat, {
      text: `⏳ جاري دمج الإيموجيات ${emoji1} + ${emoji2}...\nيرجى الانتظار لحظة ✨`,
      contextInfo: {
        forwardingScore: 0,
        isForwarded: false,
        externalAdReply: {
          title: 'Emoji Mix Generator',
          body: 'العملية قيد التنفيذ...',
          mediaType: 1,
          thumbnail: m.pp,
        }
      }
    }, { quoted: m })

    // جلب النتائج من Tenor API (مطبقة على emoji kitchen)
    let anu = await fetchJson(
      `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`
    )

    // إنشاء الملصقات وإرسالها للمستخدم
    for (let res of anu.results) {
      let stiker = await sticker(false, res.url, f, g)
      await conn.sendFile(
        m.chat,
        stiker,
        'sticker.webp',
        '',
        m,
        true,
        {
          contextInfo: {
            'forwardingScore': 200,
            'isForwarded': false,
            externalAdReply: {
              showAdAttribution: false,
              title: `${emoji1} + ${emoji2}`,
              body: `✨ تم الدمج بنجاح!`,
              mediaType: 2,
              sourceUrl: info.md,
              thumbnail: m.pp
            }
          }
        },
        { quoted: m }
      )
    }
  } catch (e) {
    console.log(e)
    m.reply('❌ حدث خطأ أثناء إنشاء الإيموجي المدمج، حاول مجددًا.')
  }
}

handler.help = ['emojimix'].map(v => v + ' 😺+😆')
handler.tags = ['sticker']
handler.command = /^(emojimix|emogimix|combinaremojis|crearemoji|emojismix|emogismix|دمج|مزج|ايموجي_دمج)$/i
handler.register = true
handler.limit = 1
export default handler

// دالة مساعدة لجلب البيانات JSON من الإنترنت
const fetchJson = (url, options) =>
  new Promise(async (resolve, reject) => {
    fetch(url, options)
      .then(response => response.json())
      .then(json => resolve(json))
      .catch(err => reject(err))
  })
