import fetch from 'node-fetch'
import uploadImage from '../lib/uploadImage.js'

const handler = async (m, { conn, usedPrefix, command }) => {
try {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || q.mediaType || ""
if (!mime.startsWith('image')) return m.reply(`⚠️ *↯ من فضلك قم بالرد على صورة لتحسينها بجودة عالية (HD).*`)
await m.react('⌛')
    
let img = await q.download?.()
if (!img) return m.reply(`❌ لم أستطع تنزيل الصورة.`)
let url = await uploadImage(img)
let res = await fetch(`https://api.neoxr.eu/api/remini?image=${encodeURIComponent(url)}&apikey=GataDios`)
let json = await res.json()
if (!json.status || !json.data?.url) return m.reply('❌ فشل تحسين الصورة.')
await conn.sendFile(m.chat, json.data.url, 'hd.jpg', `✅ *تمت ترقية صورتك إلى دقة عالية (HD)*`, m)
await m.react('✅')
} catch (e) {
console.error(e)
await m.react('❌')
m.reply(`❌ خطأ: ${e.message || e}`)
}}

handler.help = ['hd', 'remini', 'enhance', 'تحسين', 'دقة', 'فلتر']
handler.tags = ['tools']
handler.command = /^(hd|remini|enhance|تحسين|دقة|فلتر)$/i
handler.register = true
handler.limit = 1

export default handler
