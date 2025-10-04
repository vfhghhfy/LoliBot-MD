import { spawn } from 'child_process'

let handler = async (m, { conn, isROwner, text }) => {
  // منع الاستخدام في وضع خاطئ (اختياري)
  // if (!process.send) throw '❌ استخدم: node index.js بدلاً من node main.js'

  if (conn.user.jid == conn.user.jid) {
    async function loading() {
      // نسب التقدم الظاهرة أثناء إعادة التشغيل
      var progress = ["10%", "30%", "50%", "80%", "100%"]

      // إرسال رسالة بدء العملية
      let { key } = await conn.sendMessage(m.chat, { text: `♻️ *جارٍ إعادة تشغيل البوت...*` }, { quoted: m })

      // عرض نسبة التقدم تدريجيًا
      for (let i = 0; i < progress.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await conn.sendMessage(m.chat, { text: progress[i], edit: key }, { quoted: m })
      }

      // رسالة الانتهاء
      await conn.sendMessage(
        m.chat,
        { text: `🚀 *تمت إعادة تشغيل البوت بنجاح!*\n⌛ يرجى الانتظار لحظة حتى يشتغل النظام بالكامل...`, edit: key },
        { quoted: m }
      )

      // إنهاء العملية لإعادة التشغيل
      process.exit(0)
    }

    loading()
  } else throw '❌ ليس لديك صلاحية لتنفيذ هذا الأمر.'
}

handler.help = ['restart']
handler.tags = ['owner']

// الأوامر المتعددة اللغات (إنجليزية + إسبانية + عربية)
handler.command = /^(restart|reiniciar|اعادة|اعادة_التشغيل|ريستارت|اعد|اعاده)$/i

handler.owner = true
export default handler

// دالة تأخير بسيطة
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
