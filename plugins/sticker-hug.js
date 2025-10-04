import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    // إذا تم الرد على رسالة، أضف المرسل إلى قائمة المذكورين
    if (m.quoted?.sender) m.mentionedJid.push(m.quoted.sender)
    if (!m.mentionedJid.length) m.mentionedJid.push(m.sender)

    // دالة لجلب اسم المستخدم من الـ JID
    const getName = async jid => (await conn.getName(jid).catch(() => null)) || `+${jid.split('@')[0]}`

    const senderName = await getName(m.sender)
    const mentionedNames = await Promise.all(m.mentionedJid.map(getName))

    // النص المرسل في الرسالة أو الملصق
    const texto = `🤗 ${senderName} يعانق ${mentionedNames.join(', ')} بكل حب ❤️`

    // جلب صورة GIF من واجهة API
    const { url: gifUrl } = await fetch('https://api.waifu.pics/sfw/hug').then(r => r.json())

    let stiker
    try {
      // محاولة تحويل الـ GIF إلى ملصق
      stiker = await sticker(null, gifUrl, texto)
    } catch (e) {
      console.error('❌ خطأ أثناء إنشاء الملصق:', e)
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
              thumbnail: m.pp
            }
          }
        },
        { quoted: m }
      )
      return
    }

    // في حال فشل إنشاء الملصق، أرسل الـ GIF مباشرةً
    const gifBuffer = await fetch(gifUrl).then(r => r.buffer())
    await conn.sendMessage(
      m.chat,
      {
        video: gifBuffer,
        gifPlayback: true,
        caption: texto,
        mentions: m.mentionedJid
      },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    m.react("❌️")
  }
}

// المساعدة والعلامات
handler.help = ['hug', 'عناق', 'احضان', 'احضن']
handler.tags = ['sticker']

// الأوامر المتاحة باللغتين
handler.command = /^(hug|abrazo|abrazar|abrazito|عناق|احضان|احضن)$/i

handler.register = true

export default handler
