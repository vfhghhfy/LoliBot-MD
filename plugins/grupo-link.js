import fs from 'fs';
const handler = async (m, {conn, args}) => {
const group = m.chat;
m.reply('https://chat.whatsapp.com/' + await conn.groupInviteCode(group)) 
};

// الأوامر العربية المضافة
handler.help = ['linkgroup', 'رابط', 'رابط_المجموعة', 'دعوة'];
handler.tags = ['group', 'المجموعة'];
handler.command = /^link(gro?up)?|رابط-جروب|رابط_المجموعة|لينك$/i;
handler.group = true;
handler.botAdmin = true;
handler.register = true 
export default handler;
