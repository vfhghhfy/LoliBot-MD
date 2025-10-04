//كود مترجم وإعادة صياغته بالعربية بواسطة ChatGPT بناءً على نسخة elrebelde21

const handler = async (m, { conn, args }) => {
  const res = await m.db.query('SELECT marry FROM usuarios WHERE id = $1', [m.sender])
  const user = res.rows[0]

  // إذا كان المستخدم متزوج بالفعل
  if (user.marry) {
    const pareja = await m.db.query('SELECT nombre FROM usuarios WHERE id = $1', [user.marry])
    const spouseName = pareja.rows[0]?.nombre || 'بدون اسم'
    if (user.marry === (m.mentionedJid[0] || ''))
      return conn.reply(
        m.chat,
        `⚠️ أنت بالفعل متزوج من @${user.marry.split('@')[0]}، لا داعي لتتزوج نفس الشخص مرة أخرى 🤨`,
        m,
        { mentions: [m.sender] }
      )

    return conn.reply(
      m.chat,
      `⚠️ أنت متزوج حالياً من @${user.marry.split('@')[0]} (${spouseName}).\nهل تنوي الخيانة؟ 🤨`,
      m,
      { mentions: [m.sender] }
    )
  }

  // التحقق من وجود إشارة
  const mentionedUser = m.mentionedJid[0]
  if (!mentionedUser)
    return m.reply('⚠️ يرجى الإشارة إلى الشخص الذي تريد الزواج منه باستخدام @الاسم')
  if (mentionedUser === m.sender)
    return m.reply("⚠️ لا يمكنك الزواج من نفسك يا عبقري 😅")

  // التحقق من المستخدم الآخر
  const check = await m.db.query('SELECT marry FROM usuarios WHERE id = $1', [mentionedUser])
  if (!check.rows[0])
    return m.reply('⚠️ المستخدم الذي تحاول الزواج منه غير موجود في قاعدة البيانات.')
  if (check.rows[0].marry)
    return m.reply(`⚠️ المستخدم الذي اخترته متزوج بالفعل 😬`)

  // إرسال طلب الزواج
  await m.db.query('UPDATE usuarios SET marry_request = $1 WHERE id = $2', [m.sender, mentionedUser])
  await conn.reply(
    m.chat,
    `💍 *@${m.sender.split('@')[0]}* يتقدم للزواج منك 😳\n@${mentionedUser.split('@')[0]} لديك خيار:\n\n❤️ أكتب *أقبل*\n💔 أكتب *أرفض*`,
    m,
    { mentions: [m.sender, mentionedUser] }
  )

  // انتهاء صلاحية الطلب بعد 60 ثانية
  setTimeout(async () => {
    const again = await m.db.query('SELECT marry_request FROM usuarios WHERE id = $1', [mentionedUser])
    if (again.rows[0]?.marry_request) {
      await m.db.query('UPDATE usuarios SET marry_request = NULL WHERE id = $1', [mentionedUser])
      await conn.reply(m.chat, '⌛ انتهى الوقت، لم يتم الرد على طلب الزواج.', m)
    }
  }, 60000)
}

// التفاعل مع الرد "أقبل" أو "أرفض"
handler.before = async (m) => {
  const res = await m.db.query('SELECT marry_request FROM usuarios WHERE id = $1', [m.sender])
  const req = res.rows[0]?.marry_request
  if (!req) return

  const response = m.originalText.toLowerCase()
  if (response === 'aceptar' || response === 'أقبل') {
    await m.db.query('UPDATE usuarios SET marry = $1, marry_request = NULL WHERE id = $2', [req, m.sender])
    await m.db.query('UPDATE usuarios SET marry = $1 WHERE id = $2', [m.sender, req])
    await conn.reply(
      m.chat,
      `🎉 تهانينا! 🥳\n@${req.split('@')[0]} و @${m.sender.split('@')[0]} أصبحا الآن زوجين رسميًا 💞`,
      m,
      { mentions: [req, m.sender] }
    )
  } else if (response === 'rechazar' || response === 'أرفض') {
    await m.db.query('UPDATE usuarios SET marry_request = NULL WHERE id = $1', [m.sender])
    await conn.reply(
      m.chat,
      `💔 لقد رفضت طلب الزواج من @${req.split('@')[0]}`,
      m,
      { mentions: [req] }
    )
  }
}

handler.help = ['marry @tag', 'زواج @الاسم']
handler.tags = ['econ']
handler.command = ['marry', 'pareja', 'زواج', 'تزاوج', 'زوج']
handler.register = true

export default handler
