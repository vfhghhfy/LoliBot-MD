const handler = async (m, { conn, args }) => {
  const targetId = m.mentionedJid[0] || args[0]
  if (!targetId) return m.reply("⚠️ يجب عليك الإشارة إلى الشخص الذي تريد الطلاق منه.")

  const userRes = await m.db.query('SELECT marry FROM usuarios WHERE id = $1', [m.sender])
  const user = userRes.rows[0]
  if (!user || !user.marry || user.marry !== targetId)
    return m.reply("⚠️ لا يمكنك الطلاق لأنك لست متزوجًا من هذا الشخص.")

  await m.db.query('UPDATE usuarios SET marry = NULL WHERE id = $1', [m.sender])
  await m.db.query('UPDATE usuarios SET marry = NULL WHERE id = $1', [targetId])

  const nombre1 = await conn.getName(m.sender)
  const nombre2 = await conn.getName(targetId)

  return conn.reply(
    m.chat,
    `💔 @${m.sender.split('@')[0]} (${nombre1}) قد طلق @${targetId.split('@')[0]} (${nombre2}) وأصبحا الآن منفصلين 🫣`,
    m,
    { mentions: [m.sender, targetId] }
  )
}

handler.help = ['divorce <@tag>', 'طلاق <@الاسم>']
handler.tags = ['econ']
handler.command = ['divorce', 'طلاق', 'انفصال']
handler.register = true

export default handler
