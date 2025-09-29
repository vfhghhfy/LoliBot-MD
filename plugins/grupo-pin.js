let handler = async (m, { conn, command }) => {
if (!m.quoted) return m.reply(`⚠️ رد على رسالة لـ ${command === 'pin' || command === 'تثبيت' ? 'تثبيتها' : 'إلغاء تثبيتها'}.`);
try {
let messageKey = {remoteJid: m.chat,
fromMe: m.quoted.fromMe,
id: m.quoted.id,
participant: m.quoted.sender
};

if (command === 'pin' || command === 'تثبيت') {
await conn.sendMessage(m.chat, { pin: messageKey,type: 1, time: 604800 })
m.react("✅️")
}
   
if (command === 'unpin' || command === 'إلغاء_تثبيت') {
await conn.sendMessage(m.chat, { pin: messageKey,type: 2, time: 86400 })
m.react("✅️")
}

if (command === 'destacar' || command === 'تمييز') {
conn.sendMessage(m.chat, {keep: messageKey, type: 1, time: 15552000 })
m.react("✅️")
}

if (command === 'desmarcar' || command === 'إلغاء_تمييز') {
conn.sendMessage(m.chat, {keep: messageKey, type: 2, time: 86400 })
m.react("✅️")
}
} catch (error) {
console.error(error);
}};

// الأوامر العربية المضافة
handler.help = ['pin', 'unpin', 'destacar', 'desmarcar', 'تثبيت', 'إلغاء_تثبيت', 'تمييز', 'إلغاء_تمييز']
handler.tags = ['group', 'المجموعة']
handler.command = ['pin', 'unpin', 'destacar', 'desmarcar', 'تثبيت', 'إلغاء_تثبيت', 'تمييز', 'إلغاء_تمييز'] 
handler.admin = true
handler.group = true
handler.botAdmin = true
handler.register = true 
export default handler
