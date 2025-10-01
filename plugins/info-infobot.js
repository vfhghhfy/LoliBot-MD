import { db, getSubbotConfig } from '../lib/postgres.js'
import os from 'os'
import speed from 'performance-now'
import process from 'process'

const getSystemInfo = () => {
  const memoriaUso = process.memoryUsage()
  const usoRam = humanFileSize(memoriaUso.rss)
  
  // حساب استخدام CPU بشكل صحيح
  const cpus = os.cpus()
  let totalIdle = 0, totalTick = 0
  
  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type]
    }
    totalIdle += cpu.times.idle
  })
  
  const usoCpu = ((1 - totalIdle / totalTick) * 100).toFixed(2) + '%'
  
  return {
    plataforma: os.platform(),
    núcleosCPU: cpus.length,
    modeloCPU: cpus[0]?.model || 'غير معروف',
    arquitecturaSistema: os.arch(),
    usoRam,
    usoCpu,
    tiempoActividad: toTime(os.uptime() * 1000)
  }
}

const handler = async (m, { conn }) => {
  const start = speed()
  
  try {
    // الحصول على إحصائيات دقيقة
    const botId = (conn.user?.id || '').split(':')[0].replace('@s.whatsapp.net', '')
    
    // إحصائيات المجموعات
    const resGrupos = await db.query(`SELECT joined FROM chats WHERE is_group = true AND bot_id = $1`, [botId])
    const totalGrupos = resGrupos.rowCount || 0
    const gruposUnidos = resGrupos.rows.filter(row => row.joined === true).length
    const gruposSalidos = totalGrupos - gruposUnidos
    
    // إحصائيات الدردشات الخاصة
    const resPrivados = await db.query(`SELECT id FROM chats WHERE is_group = false AND bot_id = $1`, [botId])
    const privates = resPrivados.rowCount || 0
    
    // إحصائيات المستخدمين
    const usuariosResult = await db.query(`SELECT COUNT(*)::int FROM usuarios`)
    const totalUsers = usuariosResult.rows[0]?.count || 0
    
    const registeredResult = await db.query(`SELECT COUNT(*)::int FROM usuarios WHERE registered = true`)
    const registeredUsers = registeredResult.rows[0]?.count || 0
    
    // إحصائيات الأوامر
    const statsResult = await db.query(`SELECT SUM(count)::int AS total FROM stats`)
    const comandosEjecutados = statsResult.rows[0]?.total || 0
    
    // معلومات النظام
    const sistema = getSystemInfo()
    const latencia = speed() - start
    const uptime = process.uptime() * 1000
    
    // معلومات البوت
    const config = await getSubbotConfig(conn.user?.id || conn.user.jid)
    const prefijos = Array.isArray(config?.prefix) ? config.prefix.join(' ') : (config?.prefix || '.')
    const modo = config?.mode === 'private' ? 'خاص' : 'عام'
    
    // حساب البوتات الفرعية
    const subbotsCount = (global.conns || []).filter(sock => {
      const id = sock?.userId || sock?.user?.id?.split('@')[0]
      const isAlive = sock?.userId && typeof sock?.uptime === 'number'
      const mainId = conn.user?.id?.split('@')[0]?.split(':')[0]
      return isAlive && id && id !== mainId
    }).length
    
    // حساب الإضافات
    const totalPlugins = Object.values(global.plugins || {}).filter(p => p.help && p.tags).length

    const teks = `*≡ معلومات البوت*

*📊 الإحصائيات*
• المجموعات الكلية: ${totalGrupos}
• المجموعات الموجود فيها: ${gruposUnidos}
• المجموعات المتروكة: ${gruposSalidos}
• الدردشات الخاصة: ${privates}
• البوتات الفرعية: ${subbotsCount}
• إجمالي الإضافات: ${totalPlugins}

*⚙️ الإعدادات*
• الوضع: ${modo}
• البادئة: ${prefijos}
• السرعة: ${latencia.toFixed(2)} مللي ثانية
• مدة التشغيل: ${toTime(uptime)}

*📈 النشاط*
• الأوامر المنفذة: ${toNum(comandosEjecutados)}
• المستخدمون المسجلون: ${toNum(registeredUsers)} من ${toNum(totalUsers)}

*🖥️ الخادم*
• النظام: ${sistema.plataforma}
• المعالج: ${sistema.modeloCPU}
• النوى: ${sistema.núcleosCPU}
• الذاكرة المستخدمة: ${sistema.usoRam}
• استخدام المعالج: ${sistema.usoCpu}
• تشغيل الخادم: ${sistema.tiempoActividad}`

    await conn.sendMessage(m.chat, {
      text: teks, 
      contextInfo: { 
        mentionedJid: null,
        externalAdReply: {
          title: `معلومات البوت - ${conn.user.name}`,
          body: `الأوامر: ${toNum(comandosEjecutados)}`,
          mediaType: 1,
          thumbnailUrl: "https://telegra.ph/file/39fb047cdf23c790e0146.jpg",
          sourceUrl: info.yt || "https://whatsapp.com/channel/0029Va9TO4E8Cdl2c1fzJc0f"
        }
      }
    }, { quoted: m })
    
  } catch (error) {
    console.error('خطأ في معلومات البوت:', error)
    await m.reply('❌ حدث خطأ في جلب المعلومات. يرجى المحاولة لاحقاً.')
  }
}

handler.help = ['معلومات', 'infobot', 'البيانات']
handler.tags = ['main']
handler.command = /^(معلومات|معلومات-البوت|infobot|انفوبوت|البيانات|احصائيات)$/i
handler.register = true

export default handler

// الدوال المساعدة
const toNum = (n) => {
  if (!n || isNaN(n)) return '0'
  return n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' :
         n >= 1_000 ? (n / 1_000).toFixed(1) + 'K' : n.toString()
}

const humanFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

const toTime = (ms) => {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d} يوم ${h} ساعة ${m} دقيقة ${s} ثانية`
}
