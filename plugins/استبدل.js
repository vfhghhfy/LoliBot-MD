import fs from 'fs'

import path from 'path'

let tempSelection = {} // لتخزين اختيار المستخدم مؤقتاً

let handler = async (m, { conn, text }) => {

  const sender = m.sender

  // 🔒 السماح فقط للمطور

  if (!sender.includes('967778668253')) {

    return m.reply('⛔ هذا الأمر خاص بالمطور فقط.')

  }

  // 📌 المرحلة 1: المستخدم كتب فقط "استبدل"

  if (!text) {

    const folderPath = './plugins'

    if (!fs.existsSync(folderPath)) {

      return m.reply('❌ مجلد plugins غير موجود.')

    }

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))

    if (files.length === 0) {

      return m.reply('⚠️ لا توجد ملفات .js داخل مجلد plugins.')

    }

    const fileList = files.map((f, i) => `🧩 *${i + 1}.* ${f}`).join('\n')

    tempSelection[sender] = { step: 'choose_file', files }

    return m.reply(

      `📂 *اختر الملف الذي تريد استبداله:*\n\n${fileList}\n\n✏️ أرسل رقم الملف الآن.`

    )

  }

  // 📌 المرحلة 2: المستخدم اختار رقم الملف

  if (tempSelection[sender]?.step === 'choose_file') {

    const index = parseInt(text.trim()) - 1

    const selectedFile = tempSelection[sender].files[index]

    if (!selectedFile) {

      return m.reply('❌ رقم غير صالح، حاول مجددًا.')

    }

    const filePath = path.join('./plugins', selectedFile)

    let oldCode = ''

    try {

      oldCode = fs.readFileSync(filePath, 'utf-8')

    } catch (err) {

      return m.reply(`❌ فشل في قراءة الملف:\n${err.message}`)

    }

    // قص الكود الطويل لتجنب مشاكل إرسال رسائل طويلة

    const preview = oldCode.length > 3000 ? oldCode.slice(0, 3000) + '\n... (تم تقصيره)' : oldCode

    tempSelection[sender] = { step: 'await_code', file: selectedFile }

    return m.reply(

      `📄 *الكود الحالي للملف ${selectedFile}:*\n\n` +

      '```js\n' + preview + '\n```\n\n' +

      `🧠 الآن أرسل الكود الجديد لاستبداله.`

    )

  }

  // 📌 المرحلة 3: المستخدم أرسل الكود الجديد

  if (tempSelection[sender]?.step === 'await_code') {

    const fileName = tempSelection[sender].file

    const filePath = path.join('./plugins', fileName)

    const newCode = text

    try {

      fs.writeFileSync(filePath, newCode, 'utf-8')

      delete tempSelection[sender]

      return m.reply(`✅ تم استبدال محتوى الملف *${fileName}* بنجاح.`)

    } catch (err) {

      delete tempSelection[sender]

      return m.reply(`❌ حدث خطأ أثناء الكتابة:\n${err.message}`)

    }

  }

}

handler.help = ['استبدل']

handler.tags = ['owner']

handler.command = /^(استبدل|replace)$/i

handler.owner = true

export default handler