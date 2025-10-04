import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    // إذا تم اقتباس رسالة، أضف المرسل كهدف
    if (m.quoted?.sender) m.mentionedJid.push(m.quoted.sender)
    if (!m.mentionedJid.length) m.mentionedJid.push(m.sender)

    // دالة لجلب الاسم أو الرقم
    const getName = async jid => (await conn.getName(jid).catch(() => null)) || `+${jid.split('@')[0]}`
    const senderName = await getName(m.sender)
    const mentionedNames = await Promise.all(m.mentionedJid.map(getName))

    // جلب صورة أو GIF من API
    const { url } = await fetch('https://api.waifu.pics/sfw/pat').then(r => r.json())

    // النص الظاهر للمستخدم
    const texto = `🫂 ${senderName} قام بربتة لطيفة على ${mentionedNames.join(', ')}`

    // محاولة إنشاء الملصق
    let stiker
    try {
      stiker = await sticker(null, url, texto)
    } catch (e) {
      console.error('⚠️ خطأ أثناء إنشاء الملصق:', e)
    }

    // إذا تم إنشاء الملصق بنجاح، أرسله
    if (stiker) {
      await conn.sendFile(
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
              title: texto,
              body: info.wm,
              mediaType: 2,
              sourceUrl: info.md,
              thumbnail: m.pp,
            },
          },
        },
        { quoted: m }
      )
      return
    }

    // في حال فشل إنشاء الملصق، أرسل GIF بدلًا منه
    const gifBuffer = await fetch(url).then(r => r.buffer())
    await conn.sendMessage(
      m.chat,
      { video: gifBuffer, gifPlayback: true, caption: texto, mentions: m.mentionedJid },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    m.react('❌️')
  }
}

// أوامر المساعدة
handler.help = ['pat', 'ربت', 'تحنان', 'مسح']

// تصنيف الأمر
handler.tags = ['sticker']

// أوامر متعددة اللغات
handler.command = /^(pat|ربت|تحنان|مسح|mimos|palmaditas|patt)$/i

// يتطلب التسجيل
handler.register = true

export default handler
