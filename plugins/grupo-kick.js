let handler = async (m, { conn, participants, usedPrefix, command, isOwner }) => {
let kickte = `لمن تريد الطرد؟ قم بتحديد شخص بوسم @منشن`
if (!m.mentionedJid[0] && !m.quoted) return m.reply(kickte, m.chat, { mentions: conn.parseMention(kickte)}) 
let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
let owr = m.chat.split`-`[0]
await conn.groupParticipantsUpdate(m.chat, [user], 'remove')}
handler.help = ['kick *@user*']
handler.tags = ['group']
handler.command = ['kick', 'expulsar', 'طرد', 'اخرج'] 
handler.admin = true
handler.group = true
handler.botAdmin = true
handler.register = true 
export default handler
