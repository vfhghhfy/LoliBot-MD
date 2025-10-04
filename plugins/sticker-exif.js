import { db } from '../lib/postgres.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // التحقق من إدخال المستخدم
  if (!args[0])
    return m.reply(`⚠️ *الاستخدام:* ${usedPrefix}${command} اسم_الحزمة | المؤلف\n📌 *مثال:* ${usedPrefix}${command} ملصقاتي | أحمد`)

  // تقسيم النص إلى اسم الحزمة والمؤلف
  let text = args.join(' ').split('|')
  let packname = text[0].trim()
  let author = text[1] ? text[1].trim() : ''

  // التحقق من المدخلات
  if (!packname) return m.reply('⚠️ يجب إدخال *اسم الحزمة* على الأقل.')
  if (packname.length > 600) return m.reply('⚠️ اسم الحزمة طويل جدًا (الحد الأقصى 600 حرف).')
  if (author && author.length > 650) return m.reply('⚠️ اسم المؤلف طويل جدًا (الحد الأقصى 650 حرف).')

  // تحديث بيانات المستخدم في قاعدة البيانات
  await db.query(
    `UPDATE usuarios
     SET sticker_packname = $1,
         sticker_author = $2
     WHERE id = $3`,
    [packname, author || null, m.sender]
  )

  // رسالة تأكيد
  await m.reply(
    `✅ تم تحديث إعدادات *EXIF* الخاصة بملصقاتك بنجاح!\n\n🎨 *اسم الحزمة:* ${packname}\n✍️ *المؤلف:* ${author || 'بدون'}\n\n> يمكنك الآن إنشاء ملصقاتك المخصصة بسهولة 😎`
  )
}

// المساعدة والعلامات
handler.help = ['exif <اسم_الحزمة> | <المؤلف>']
handler.tags = ['sticker']

// الأوامر المتعددة اللغات
handler.command = /^(exif|اكسف|حقوق)$/i

handler.register = true

export default handler
