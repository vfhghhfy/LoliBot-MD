import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    // إذا تم الرد على رسالة، أضف المرسل الأصلي إلى قائمة المذكورين
    if (m.quoted?.sender) m.mentionedJid.push(m.quoted.sender)
    if (!m.mentionedJid.length) m.mentionedJid.push(m.sender)

    // جلب أسماء المستخدمين من JID
    const getName = async jid => (await conn.getName(jid).catch(() => null)) || `+${jid.split('@')[0]}`
    const senderName = await getName(m.sender)
    const mentionedNames = await Promise.all(m.mentionedJid.map(getName))

    // النص الظاهر في الملصق أو الفيديو
    const texto = `🔪 *${senderName}* قام بقتل *${mentionedNames.join(', ')}* ببرود دم 😵`

    // جلب رابط الصورة من API
    const { url } = await fetch('https://api.waifu.pics/sfw/kill').then(r => r.json())

    let stiker
    try {
      // محاولة إنشاء الملصق من الصورة
      stiker = await sticker(null, url, texto)
    } catch (e) {
      console.error('⚠️ خطأ أثناء توليد الملصق:', e)
    }

    // إرسال الملصق إذا نجح إنشاؤه
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
    const gifBuffer = await fetch(url).then(r => r.buffer())
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
handler.help = ['kill', 'اقتل', 'ذبح', 'طعن', 'موت']
handler.tags = ['sticker']

// أوامر متعددة اللغات
handler.command = /^(kill|asesinar|matar|slay|stab|اقتل|ذبح|طعن|موت)$/i

handler.register = true

export default handler
