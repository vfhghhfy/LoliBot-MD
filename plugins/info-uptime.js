const handler = async (m) => {
  const uptime = process.uptime() * 1000 // بالميلي ثانية
  const tiempo = clockString(uptime)
  m.reply(`⏱️ *مدة التشغيل:* ${tiempo}`)
}

// إضافة الأوامر العربية
handler.help = ['uptime', 'المدة', 'الوقت'];
handler.tags = ['main'];
handler.command = /^(uptime|مدة|الوقت|تشغيل|متى)$/i

export default handler

function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
