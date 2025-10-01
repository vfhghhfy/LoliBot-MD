let handler = async (m, { conn, command, usedPrefix }) => {
let name = m.pushName 
let usuario = `${m.sender.split("@")[0]}`
let aa = usuario + '@s.whatsapp.net'
let _uptime = process.uptime() * 1000
let _muptime
if (process.send) { process.send('uptime')
_muptime = await new Promise(resolve => { process.once('message', resolve) 
setTimeout(resolve, 1000) }) * 1000}
let fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }
let uptime = clockString(_uptime)
let estado = `${pickRandom([`*┌───⊷ *🟢 حالة البوت*\n┆ *=> البوت نشط ✅*\n┆┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n┆ *=> البوت للاستخدام العام ✅️*\n┆┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n┆=> نشط منذ\n┆=> ${uptime} ✅\n╰──────────────────`, `*نشط ${uptime} ✅*`, `*مشغول حالياً 🥵*`, `نشط منذ: ${uptime}`, `البوت شغال يا برو 🤙`])}
`.trim()
await conn.fakeReply(m.chat, estado, m.sender, `مدة التشغيل: ${uptime}`, 'status@broadcast');
}
handler.help = ['حالة', 'status']
handler.tags = ['main']
handler.command = /^(حالة|status|ستاتس|ستات|stat|بوت)$/i
export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]}

function clockString(ms) {
let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')}
