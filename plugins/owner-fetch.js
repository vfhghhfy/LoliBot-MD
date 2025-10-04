import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // تجاهل الرسائل الصادرة من المالك نفسه
  if (m.fromMe) return

  // التحقق من أن الرابط صحيح
  if (!/^https?:\/\//.test(text)) 
    return m.reply(`📘 مثال الاستخدام:\n${usedPrefix + command} https://example.com`)

  // تفاعل مبدئي
  m.react("💻")

  let url = text
  let res = await fetch(url)

  // منع تحميل ملفات ضخمة جدًا
  if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
    throw `⚠️ حجم المحتوى كبير جدًا!\nContent-Length: ${res.headers.get('content-length')}`
  }

  // التحقق من نوع الملف
  if (!/text|json/.test(res.headers.get('content-type'))) 
    return conn.sendFile(m.chat, url, 'ملف', text, m)

  // قراءة النص أو JSON
  let txt = await res.buffer()
  try {
    txt = format(JSON.parse(txt + ''))
  } catch (e) {
    txt = txt + ''
  } finally {
    // إرسال أول 65536 حرف فقط لتفادي ثقل الرسائل
    m.reply(txt.slice(0, 65536) + '')
  }
}

// 🧩 معلومات الأوامر والمساعدة
handler.help = ['fetch', 'get', 'جلب'].map(v => v + ' *<رابط>*')
handler.tags = ['المالك']

// الأوامر المدعومة باللغتين
handler.command = /^(fetch|get|جلب)$/i

//handler.limit = 1
handler.register = true

export default handler
