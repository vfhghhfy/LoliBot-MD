//import Presence from '@adiwajshing/baileys'
//let Presence = (await import(global.baileys)).default
let handler = async (m, { conn, args, text }) => {
const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || './media/Menu1.jpg'
if (!text) throw "⚠️ يرجى إدخال النص الجديد للمجموعة"
try {
let text = args.join` `
if(!args || !args[0]) {
} else {
conn.groupUpdateSubject(m.chat, text)
}
m.react("✅️")
} catch (e) { 
throw "خطأ"
}}
handler.help = ['setname'];
handler.tags = ['group'];
handler.command = /^(setname|newnombre|nuevonombre|اسم|تغييرالاسم)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler
