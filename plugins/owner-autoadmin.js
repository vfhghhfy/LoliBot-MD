let handler = async (m, { conn, isAdmin }) => {
  if (m.fromMe) throw '🚫 لا يمكنك usar este comando desde el propio bot.'; 

  if (isAdmin) 
    return m.reply('✅ Ya eres admin del grupo mi creador 🫡\n✅ أنت بالفعل أدمن في المجموعة يا صانعـي 🫡');

  await conn.groupParticipantsUpdate(m.chat, [m.sender], "promote");
  return m.reply('✅ Ahora eres administrador.\n✅ تم ترقيتك إلى أدمن.');
};

handler.help = ['autoadmin', 'ترقية']
handler.tags = ['owner']
handler.command = /^(autoadmin|admin\.|atad|ترقية|رفع)$/i
handler.owner = true
handler.botAdmin = true

export default handler;
