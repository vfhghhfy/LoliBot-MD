let handler = async (m, { conn, text, command }) => {
  // تحديد المعرف (إما المجموعة الحالية أو التي يتم تمريرها)
  let id = text ? text : m.chat  

  // رسالة الوداع عند مغادرة البوت
  await conn.reply(id, '*🤖 البوت سيغادر المجموعة الآن، إلى اللقاء 👋*') 

  // تنفيذ الخروج من المجموعة
  await conn.groupLeave(id)
}

handler.help = ["leave"]
handler.tags = ["owner"]

// الأوامر المتعددة اللغات (إسبانية + إنجليزية + عربية)
handler.command = /^(salir|leavegc|salirdelgrupo|leave|غادر|اخرج|خروج|انسحب)$/i

handler.owner = true
handler.register = true

export default handler
