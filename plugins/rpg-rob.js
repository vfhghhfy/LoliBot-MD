const ro = 3000;

const handler = async (m, { conn, usedPrefix, command }) => {
  const now = Date.now();
  const resRobber = await m.db.query('SELECT exp, lastrob FROM usuarios WHERE id = $1', [m.sender]);
  const robber = resRobber.rows[0];
  const cooldown = 3600000; // 1 ساعة
  const timeLeft = (robber.lastrob ?? 0) + cooldown - now;

  // 🕒 التحقق من التبريد (cooldown)
  if (timeLeft > 0)
    return m.reply(`🚓 الشرطة تراقب المكان! حاول مجددًا بعد: *${msToTime(timeLeft)}*`);

  // 🎯 تحديد الهدف
  let who;
  if (m.isGroup) {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted?.sender;
  } else {
    who = m.chat;
  }

  if (!who)
    return conn.reply(m.chat, `⚠️ *اذكر المستخدم الذي تريد سرقته!*`, m);

  if (who === m.sender)
    return m.reply(`❌ لا يمكنك سرقة نفسك!`);

  // 🔍 التحقق من الضحية في قاعدة البيانات
  const resVictim = await m.db.query('SELECT exp FROM usuarios WHERE id = $1', [who]);
  const victim = resVictim.rows[0];
  if (!victim)
    return m.reply(`❌ المستخدم غير موجود في قاعدة البيانات.`);

  // 💰 حساب الكمية المسروقة
  const cantidad = Math.floor(Math.random() * ro);
  if ((victim.exp ?? 0) < cantidad)
    return conn.reply(
      m.chat,
      `💸 @${who.split('@')[0]} يملك أقل من ${ro} XP.\n> لا تسرق الفقراء يا لص 😅`,
      m,
      { mentions: [who] }
    );

  // 💥 تنفيذ عملية السرقة
  await m.db.query('UPDATE usuarios SET exp = exp + $1, lastrob = $2 WHERE id = $3', [cantidad, now, m.sender]);
  await m.db.query('UPDATE usuarios SET exp = exp - $1 WHERE id = $2', [cantidad, who]);

  // ✅ رسالة النجاح
  return conn.reply(
    m.chat,
    `🏴‍☠️ *سرقت ${cantidad} XP من @${who.split('@')[0]} بنجاح!* 💸`,
    m,
    { mentions: [who] }
  );
};

// 🧩 المساعدة والأوامر
handler.help = ['rob', 'robar', 'سرقة'];
handler.tags = ['econ'];
handler.command = /^(robar|rob|سرقة)$/i;
handler.register = true;

export default handler;

// 🕐 دالة تحويل الوقت
function msToTime(duration) {
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  return `${hours} ساعة و ${minutes} دقيقة`;
}
