import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'
import { db } from '../lib/postgres.js'

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text)
    return m.reply(
      `⚠️ اكتب شيئًا للبحث عن حزم الملصقات.\n📘 مثال: *${usedPrefix + command} قطط*`
    )

  try {
    const res = await fetch(
      `https://api.dorratz.com/v3/stickerly?query=${encodeURIComponent(text)}`
    )
    const json = await res.json()

    if (!json.success || !json.data || json.data.length === 0)
      return m.reply(`❌ لم يتم العثور على أي حزمة باسم: *${text}*`)

    const packs = json.data.slice(0, 30)

    // جلب إعدادات الملصقات الخاصة بالمستخدم من قاعدة البيانات
    const userResult = await db.query(
      'SELECT sticker_packname, sticker_author FROM usuarios WHERE id = $1',
      [m.sender]
    )
    const user = userResult.rows[0] || {}
    const packname = user.sticker_packname || global.info.packname
    const author = user.sticker_author || global.info.author

    const total = packs.length
    const max = Math.min(total, 30)

    m.reply(
      `🎯 *نتائج البحث عن:* ${text}\n🧷 *عدد الملصقات التي سيتم إرسالها:* ${max}\n⏳ *يتم الإرسال... يرجى الانتظار قليلًا...*`
    )

    let enviados = 0
    for (const pack of packs) {
      const infoText = `📦 *${pack.name}*\n👤 ${pack.author}\n🧷 ${pack.stickerCount} ملصق\n👁 ${pack.viewCount.toLocaleString()} مشاهدة\n📤 ${pack.exportCount.toLocaleString()} تم تصديرها\n🔗 ${pack.url}`

      try {
        const stkr = await sticker(false, pack.thumbnailUrl, packname, author)
        if (stkr) {
          await conn.sendFile(
            m.chat,
            stkr,
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
                  body: pack.name,
                  mediaType: 2,
                  sourceUrl: [info.nna, info.nna2, info.md, info.yt].getRandom(),
                  thumbnail: m.pp,
                },
              },
            },
            { quoted: m }
          )
          enviados++
          await new Promise((r) => setTimeout(r, 700))
        }
      } catch (err) {
        console.log('❌ خطأ أثناء إنشاء الملصق:', err)
      }
    }

    if (enviados === 0)
      return m.reply('❌ لم يتم إرسال أي ملصق.')
    else return m.react('✅')
  } catch (e) {
    console.error(e)
    m.reply('❌ حدث خطأ أثناء البحث عن الملصقات.')
  }
}

// أوامر المساعدة
handler.help = ['stickerly <نص>', 'ملصقات <نص>', 'بحث_ملصقات <نص>']

// تصنيف الأوامر
handler.tags = ['sticker']

// أوامر متعددة اللغات (إنجليزية + عربية)
handler.command = /^(stickerly|ملصقات|بحث_ملصقات)$/i

// تفعيل التسجيل
handler.register = true

export default handler
