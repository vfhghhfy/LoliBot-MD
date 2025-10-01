import { db, getSubbotConfig } from '../lib/postgres.js'
import fs from 'fs'
import path from 'path'
import os from 'os'
import ws from 'ws'
import speed from 'performance-now'
import { sizeFormatter } from 'human-readable'

const format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`
})

const getCpuUsage = () => {
  const load = os.loadavg()[0]
  const cores = os.cpus().length
  return ((load / cores) * 100).toFixed(2) + '%'
}

const getFolderSize = (folderPath) => {
  let totalSize = 0
  function calculateSize(directory) {
    const files = fs.readdirSync(directory)
    for (const file of files) {
      const filePath = path.join(directory, file)
      const stats = fs.statSync(filePath)
      if (stats.isDirectory()) calculateSize(filePath)
      else totalSize += stats.size
    }
  }
  calculateSize(folderPath)
  return humanFileSize(totalSize)
}

const getSystemInfo = async () => {
  const cpuInfo = os.cpus()
  const modeloCPU = cpuInfo[0]?.model || 'N/A'
  const memoriaUso = process.memoryUsage()
  const usoRam = humanFileSize(memoriaUso.rss)
  const usoCpu = getCpuUsage()
  return {
    plataforma: os.platform(),
    núcleosCPU: cpuInfo.length,
    modeloCPU,
    arquitecturaSistema: os.arch(),
    versiónSistema: os.release(),
    procesosActivos: os.loadavg()[0],
    usoRam,
    usoCpu,
    tiempoActividad: toTime(os.uptime() * 1000)
  }
}

const handler = async (m, { conn }) => {
const start = speed();
const subbotsCount = (global.conns || []).filter(sock => {
const id = sock?.userId || sock?.user?.id?.split('@')[0]
const isAlive = sock?.userId && typeof sock?.uptime === 'number'
const mainId = conn.user?.id?.split('@')[0]?.split(':')[0]
return isAlive && id && id !== mainId}).length
const botId = (conn.user?.id || '').split(':')[0].replace('@s.whatsapp.net', '');
const resGrupos = await db.query(`SELECT joined FROM chats
  WHERE is_group = true AND bot_id = $1`, [botId]);
const totalGrupos = resGrupos.rowCount;
const groupsIn = resGrupos.rows.filter(row => row.joined === true);
const gruposUnidos = groupsIn.length;
const gruposSalidos = totalGrupos - gruposUnidos;
const resPrivados = await db.query(`SELECT id FROM chats
  WHERE is_group = false AND bot_id = $1`, [botId]);
const privates = resPrivados.rowCount;
const chatsTotales = totalGrupos + privates;
const totalPlugins = Object.values(global.plugins).filter(p => p.help && p.tags).length;
const latencia = speed() - start;
const uptime = process.uptime() * 1000;
const config = await getSubbotConfig(conn.user?.id || conn.user.jid);
const prefijos = Array.isArray(config.prefix) ? config.prefix.join(' ') : config.prefix;
const modo = config.mode === 'private' ? 'خاص' : 'عام';
const [{ count: totalUsers }] = (await db.query(`SELECT COUNT(*)::int FROM usuarios`)).rows;
const [{ count: registeredUsers }] = (await db.query(`SELECT COUNT(*)::int FROM usuarios WHERE registered = true`)).rows;
const [{ count: totalChats }] = (await db.query(`SELECT COUNT(*)::int FROM chats`)).rows;
const [{ total }] = (await db.query(`SELECT SUM(count)::int AS total FROM stats`)).rows;
const comandosEjecutados = total || 0;
const sistema = await getSystemInfo();

const teks = `*≡ معلومات البوت*

*المعلومات*
*▣ المجموعات الكلية:* ${totalGrupos}
*▣ المجموعات الموجود فيها:* ${gruposUnidos}
*▣ المجموعات المتروكة:* ${gruposSalidos}
*▣ الدردشات الخاصة:* ${privates}
*▣ إجمالي الدردشات:* ${chatsTotales}
*▣ البوتات الفرعية:* ${subbotsCount}
*▣ إجمالي الإضافات:* ${totalPlugins}
*▣ الوضع:* ${modo}
*▣ البادئة:* ${prefijos}
*▣ السرعة:* ${latencia.toFixed(4)} مللي ثانية
*▣ مدة التشغيل:* ${new Date(uptime).toISOString().substr(11, 8)}

*▣ الأوامر المنفذة:* ${toNum(comandosEjecutados)} / ${comandosEjecutados}
*▣ المجموعات المسجلة:* ${toNum(totalChats)} / ${totalChats}
*▣ المستخدمون المسجلون:* ${toNum(registeredUsers)} من ${toNum(totalUsers)} مستخدم

*≡ الخادم*
▣ *الخادم:* ${os.hostname()}
▣ *النظام:* ${sistema.plataforma}
▣ *الذاكرة المستخدمة:* ${sistema.usoRam}
▣ *استخدام المعالج:* ${sistema.usoCpu}
▣ *مدة التشغيل:* ${sistema.tiempoActividad}`;

await conn.sendMessage(m.chat, {
  text: teks, 
  contextInfo: { 
    mentionedJid: null, 
    forwardingScore: 1, 
    isForwarded: true, 
    externalAdReply: {
      mediaUrl: [info.nna, info.nna2, info.md].getRandom(), 
      mediaType: 2, 
      description: null, 
      title: `معلومات البوت`, 
      previewType: 0, 
      thumbnailUrl: "https://telegra.ph/file/39fb047cdf23c790e0146.jpg", 
      sourceUrl: info.yt
    }
  }
}, { quoted: m })
};

handler.help = ['معلومات', 'infobot']
handler.tags = ['main']
handler.command = /^(معلومات|معلومات-البوت|infobot|انفوبوت)$/i
handler.register = true
export default handler

const toNum = (n) => {
  if (!n || isNaN(n)) return '0'
  return n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' :
         n >= 1_000 ? (n / 1_000).toFixed(1) + 'k' : n.toString()
}

const humanFileSize = (bytes) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

const toTime = (ms) => {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d}يوم ${h}ساعة ${m}دقيقة ${s}ثانية`
}
