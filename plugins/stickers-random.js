import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'

const actions = {
  lick: { e: '👅', v: 'لحس', nsfw: false, aliases: [] },
  bite: { e: '🧛‍♂️', v: 'عض', nsfw: false, aliases: [] },
  blush: { e: '😳', v: 'إحمر خجلاً بجانب', nsfw: false, aliases: [] },
  cuddle: { e: '🥰', v: 'احتضن', nsfw: false, aliases: [] },
  handhold: { e: '🤝', v: 'أمسك يد', nsfw: false, aliases: [] },
  highfive: { e: '✋', v: 'صافح', nsfw: false, aliases: [] },
  poke: { e: '👉', v: 'نقر', nsfw: false, aliases: [] },
  smile: { e: '😊', v: 'ابتسم لـ', nsfw: false, aliases: [] },
  wave: { e: '👋', v: 'حيا', nsfw: false, aliases: [] },
  nom: { e: '🍪', v: 'أعطى قطعة حلوى لـ', nsfw: false, aliases: [] },
  dance: { e: '💃', v: 'رقص مع', nsfw: false, aliases: [] },
  wink: { e: '😉', v: 'غمز', nsfw: false, aliases: [] },
  happy: { e: '😁', v: 'يشعر بالسعادة مع', nsfw: false, aliases: [] },
  smug: { e: '😏', v: 'نظر بتعالٍ لـ', nsfw: false, aliases: [] },
  blowjob: { e: '😳', v: 'قام بعمل جنسي فموي لـ', nsfw: true, aliases: ['oral'] }
}

const actionByCommand = Object.entries(actions).reduce((map, [k, v]) => {
map[k] = { ...v, main: k }
if (v.aliases) for (const a of v.aliases) map[a] = { ...v, main: k }
return map
}, {})

let handler = async (m, { conn, command }) => {
try {
if (m.quoted?.sender) m.mentionedJid.push(m.quoted.sender)
if (!m.mentionedJid.length) m.mentionedJid.push(m.sender)
const getName = async jid => (await conn.getName(jid).catch(() => null)) || `+${jid.split('@')[0]}`
const senderName = await getName(m.sender)

const mentionedNames = await Promise.all(m.mentionedJid.map(async u => u === m.sender ? 'شخص ما' : await getName(u)))

const act = actionByCommand[command.toLowerCase()] || { e: '✨', v: 'قام بسحر مع', nsfw: false, main: command.toLowerCase() }
const texto = `${act.e} ${senderName} ${act.v} ${mentionedNames.join(', ')}`
const tipo = act.nsfw ? 'nsfw' : 'sfw'
const endpoint = act.main
const { url } = await fetch(`https://api.waifu.pics/${tipo}/${endpoint}`).then(r => r.json())

let stiker
try { stiker = await sticker(null, url, texto) } catch {}
if (stiker) {
await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, { contextInfo: { forwardingScore: 200, isForwarded: false, externalAdReply: { showAdAttribution: false, title: texto, body: '', mediaType: 2, sourceUrl: '', thumbnail: m.pp }}}, { quoted: m })
return
}

const gifBuffer = await fetch(url).then(r => r.buffer())
await conn.sendMessage(m.chat, { video: gifBuffer, gifPlayback: true, caption: texto, mentions: m.mentionedJid }, { quoted: m })
} catch (e) {
console.error(`[❌ خطأ في ${command}]`, e)
await conn.reply(m.chat, `❌ حدث خطأ في أمر *${command}*.`, m)
}}
handler.help    = Object.keys(actions).flatMap(k => [k, ...(actions[k].aliases || [])])
handler.tags    = ['sticker']
handler.command = new RegExp(`^(${Object.keys(actionByCommand).join('|')})$`, 'i')
handler.register = true

export default handler
