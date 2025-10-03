let handler = async (m, { conn, text, usedPrefix, command }) => {
let teks = text ? text : m.quoted && m.quoted.text ? m.quoted.text : ''

// 📝 أمر كتابة نص مزخرف في صورة
if (command == 'txt' || command == 'escribir' || command == 'نص' || command == 'كتابة') {
if (!teks) return m.reply(`⚠️ ما هو النص الذي تريد كتابته؟\n\n📌 مثال:\n*${usedPrefix + command}* مرحباً بوت`)
let img = `${global.APIs.fgmods.url}/maker/txt?text=${encodeURIComponent(teks)}&apikey=${global.APIs.fgmods.key}`;
conn.sendFile(m.chat, img, 'img.png', `✍🏻 ها هو النص الخاص بك\n${info.wm}`, m);
}

// 💻 أمر كود كربون
if (command == 'carbon' || command == 'كربون') {    
if (!teks) return m.reply(`⚠️ أدخل النص لتحويله إلى صورة كود.\n\n📌 مثال:\n*${usedPrefix + command}* \ncase "مرحبا":\nm.reply("أهلاً")\nbreak`)
let res = `https://www.archive-ui.biz.id/api/maker/carbonify?text=${teks}`
await conn.sendFile(m.chat, res, 'carbon.png', `💻 تم تحويل النص إلى صورة كود.`, m)
}
}

handler.help = ['txt', 'escribir', 'carbon', 'نص', 'كتابة', 'كربون']
handler.tags = ['tools', 'fun']
handler.command = /^(txt|escribir|carbon|نص|كتابة|كربون)$/i
handler.limit = 1
handler.register = true 

export default handler
