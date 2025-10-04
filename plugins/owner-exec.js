import syntaxerror from 'syntax-error'
import { format } from 'util'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

let handler = async (m, _2) => {

  // التحقق من أن المستخدم هو المالك فقط
  const { conn, isOwner, isROwner, args, text, metadata } = _2
  if (!isOwner) return conn.reply(m.chat, '❌ هذا الأمر مخصص للمالك فقط.', m)

  // التحقق من وجود بادئة الأمر (= أو =>)
  let prefixMatch = (m.originalText || m.text)?.match(/^=?>\s?|^تشغيل\s?/)
  if (!prefixMatch) return

  // إزالة البادئة من النص
  const noPrefix = m.originalText.replace(prefixMatch[0], '').trim()
  const _text = prefixMatch[0].startsWith('=') ? 'return ' + noPrefix : noPrefix
  const old = m.exp * 1
  let _return
  let _syntax = ''

  try {
    let i = 15
    const f = { exports: {} }

    // تنفيذ الكود المرسل بشكل آمن داخل السياق
    let exec = new (async () => {}).constructor(
      'print', 'm', 'handler', 'require', 'conn', 'Array',
      'process', 'args', 'groupMetadata', 'module', 'exports', 'argument',
      _text
    )

    _return = await exec.call(conn,
      (...args) => {
        if (--i < 1) return
        console.log(...args)
        return conn.reply(m.chat, format(...args), m)
      },
      m, handler, require, conn, CustomArray, process, args, metadata, f, f.exports, [conn, _2]
    )

  } catch (e) {
    // التحقق من وجود أخطاء تركيبية
    const err = syntaxerror(_text, 'دالة التنفيذ', {
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
      sourceType: 'module'
    })
    if (err) _syntax = '```خطأ في الكود:\n' + err + '```\n\n'
    _return = e
  } finally {
    // إرسال النتيجة أو الخطأ إلى الدردشة
    conn.reply(m.chat, _syntax + format(_return), m)
    m.exp = old
  }
}

// 🧩 المساعدة والأوامر المتاحة
handler.help = ['> ', '=> ', '=', '#']
handler.tags = ['المالك']
handler.customPrefix = /^=?>\s?|^تشغيل\s?/
//handler.command = /(?:)/i
//handler.owner = true
handler.register = true

export default handler

// 🧱 صنف مخصص للتحكم في حجم المصفوفات
class CustomArray extends Array {
  constructor(...args) {
    if (typeof args[0] === 'number') return super(Math.min(args[0], 10000))
    else return super(...args)
  }
}
