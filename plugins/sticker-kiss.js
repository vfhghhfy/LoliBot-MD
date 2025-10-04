import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    // إذا تم الرد على رسالة، أضف المرسل الأصلي إلى قائمة المذكورين
    if (m.quoted?.sender) m.mentionedJid.push(m.quoted.sender)
    if (!m.mentionedJid.length) m.mentionedJid.push(m.sender)

    // دالة للحصول على اسم المستخدم من JID
    let getName = async (jid) => {
      let name = await conn.getName(jid).catch(() => null)
      return name || `+${jid.split('@')[0]}`
    }

    let senderName = await getName(m.sender)
    let mentionedNames = await Promise.all(m.mentionedJid.map(getName))

    // جلب صورة القبلة من API
    let res = await fetch('https://nekos.life/api/kiss')
    let json = await res.json()
    let { url } = json

    // النص العربي الذي سيظهر في الملصق أو الفيديو
    let texto = `💋 *${senderName}* قبّل *${mentionedNames.join(', ')}* بحرارة 😘`

    try {
      // محاولة إنشاء ملصق القبلة
      let stickerMessage = await sticker(null, url, texto)
      await conn.sendFile(
        m.chat,
        stickerMessage,
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
              thumbnail: m.pp
            }
          }
        },
        { quoted: m }
      )
    } catch (err) {
      // إذا فشل إنشاء الملصق، أرسل الصورة كفيديو GIF
      await conn.sendMessage(
        m.chat,
        { video: { url: url }, gifPlayback: true, caption: texto, mentions: m.mentionedJid },
        { quoted: m }
      )
    }
  } catch (e) {
    console.error(e)
  }
}

// أوامر المساعدة
handler.help = ['kiss', 'قبل', 'قبلة', 'بوسة']

// تصنيف الأوامر
handler.tags = ['sticker']

// أوامر متعددة اللغات (عربية + إنجليزية + إسبانية)
handler.command = /^(kiss|skiss|kis|besos|beso|besar|besando|قبل|قبلة|بوسة)$/i

// تسجيل التفعيل
handler.register = true

export default handler
