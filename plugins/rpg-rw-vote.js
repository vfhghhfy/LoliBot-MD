// الكود الأصلي من: https://github.com/elrebelde21

async function handler(m, { conn, args }) {
  if (!m.db) return;
  try {
    const characterName = args.join(' ').trim();
    if (!characterName)
      return conn.reply(m.chat, '⚠️ الرجاء تحديد اسم الشخصية.', m);

    const { rows } = await m.db.query('SELECT timevot FROM usuarios WHERE id = $1', [m.sender]);
    const user = rows[0];
    const lastVoteTime = user?.timevot || 0;
    const cooldown = 1800000; // 30 دقيقة
    const now = Date.now();

    if (now - lastVoteTime < cooldown)
      return m.reply(`⏳ انتظر قليلًا! يمكنك التصويت مجددًا بعد ${msToTime(cooldown - (now - lastVoteTime))}.`);

    const { rows: characters } = await m.db.query(
      'SELECT id, name, price, votes FROM characters WHERE LOWER(name) = $1',
      [characterName.toLowerCase()]
    );
    const character = characters[0];
    if (!character)
      return conn.reply(m.chat, `⚠️ لم يتم العثور على الشخصية "${characterName}".`, m);

    const currentPrice = character.price ?? 0;
    const newVotes = (character.votes || 0) + 1;
    const increment = Math.floor(Math.random() * 50) + 1;
    const newPrice = currentPrice + increment;

    await m.db.query(
      'UPDATE characters SET votes = $1, price = $2 WHERE id = $3',
      [newVotes, newPrice, character.id]
    );
    await m.db.query('UPDATE usuarios SET timevot = $1 WHERE id = $2', [now, m.sender]);

    const formattedPrice = newPrice.toLocaleString();
    return conn.reply(
      m.chat,
      `✨️ لقد صوتَّ للشخصية *${character.name}*، سعرها الجديد هو *${formattedPrice}* (+${increment})`,
      m
    );
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, '⚠️ حدث خطأ أثناء التصويت. حاول مرة أخرى لاحقًا.', m);
  }
}

handler.help = ['vote <اسم الشخصية>', 'تصويت <اسم الشخصية>'];
handler.tags = ['gacha'];
handler.command = ['vote', 'تصويت']; // ← أمر عربي بديل
handler.register = true;

export default handler;

// 🕒 دالة تنسيق الوقت إلى دقائق وثوانٍ
function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100);
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);

  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  const secondsStr = seconds < 10 ? `0${seconds}` : seconds;

  return `${minutesStr} دقيقة ${secondsStr} ثانية`;
}
