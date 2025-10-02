import ws from 'ws'
import { getSubbotConfig } from '../lib/postgres.js'

const handler = async (m, { conn }) => {
const mainId = globalThis.conn?.user?.id?.split('@')[0].split(':')[0]
const activos = (globalThis.conns || []).filter(sock => {
const id = sock?.userId || sock?.user?.id?.split('@')[0];
const isAlive = sock?.userId && typeof sock?.uptime === 'number';
return isAlive && id !== mainId;
});

if (!activos.length) return m.reply("❌ لا توجد بوتات فرعية متصلة حالياً.")
let mensaje = `🤖 *البوتات الفرعية النشطة: ${activos.length}*\n\n`
const participantes = m.isGroup ? (await conn.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants || [] : []

for (const sock of activos) {
const userId = sock.user?.id
if (!userId) continue
const cleanId = userId.replace(/:\d+/, '').split('@')[0]
const configId = userId.replace(/:\d+/, '')
const nombre = sock.user.name || "-"
let config = {}
try {
config = await getSubbotConfig(configId)
} catch {
config = { prefix: ["/", ".", "#"], mode: "public" }
}

const modo = config.mode === "private" ? "خاص" : "عام"
const prefijos = Array.isArray(config.prefix) ? config.prefix : [config.prefix]
const prefText = prefijos.map(p => `\`${p}\``).join(", ")
const mainPrefix = (prefijos[0] === "") ? "" : prefijos[0]
const textoMenu = mainPrefix ? `${mainPrefix}menu` : "menu"
const uptime = sock.uptime ? formatearMs(Date.now() - sock.uptime) : "غير معروف"
const estaEnGrupo = participantes.some(p => p.id === userId)
const mostrarNumero = !config.privacy
const mostrarPrestar = config.prestar && !config.privacy
let lineaBot = `• ${mostrarNumero ? `wa.me/${cleanId}?text=${encodeURIComponent(textoMenu)} (${nombre})` : `(${nombre})`}\n`
mensaje += lineaBot
mensaje += `   ⏱️ الوقت النشط: *${uptime}*\n`
mensaje += `   ⚙️ الوضع: *${modo}*\n`
mensaje += `   🛠️ البادئة: ${prefText}\n`
if (mostrarPrestar) mensaje += `   🟢 *إقراض البوت*: #join <الرابط>\n`
mensaje += `\n`
}
return m.reply(mensaje.trim())
}

// إضافة الأوامر العربية
handler.help = ['bots', 'البوتات', 'الفرعية']
handler.tags = ['jadibot']
handler.command = /^(bots|البوتات|الفرعية|سبوت|سبوتات)$/i
export default handler

function formatearMs(ms) {
  const segundos = Math.floor(ms / 1000)
  const minutos = Math.floor(segundos / 60)
  const horas = Math.floor(minutos / 60)
  const dias = Math.floor(horas / 24)
  return `${dias}يوم ${horas % 24}ساعة ${minutos % 60}دقيقة ${segundos % 60}ثانية`
}
