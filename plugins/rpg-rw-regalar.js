//الكود الأصلي من: https://github.com/elrebelde21
//ترجمة وإضافة أوامر عربية بواسطة GPT-5

async function handler(m, { conn, args }) {
  // 🗄️ التحقق من قاعدة البيانات
  if (!m.db)
    return conn.sendMessage(
      m.chat,
      { text: '⚠️ خطأ: لم يتم الاتصال بقاعدة البيانات.' },
      { quoted: m }
    );

  // 📋 التحقق من تنسيق الاستخدام
  if (!m.mentionedJid || m.mentionedJid.length === 0 || args.length < 1)
    return conn.reply(
      m.chat,
      '⚠️ *الاستخدام الصحيح:*\n/اهدي @منشن اسم_الشخصية\n📌 مثال: /اهدي @user ساكوراجي',
      m
    );

  // 👤 تحديد المستلم واسم الشخصية
  const recipient = m.mentionedJid[0];
  const characterName = args.slice(1).join(' ').trim();
  if (!characterName)
    return conn.reply(m.chat, '⚠️ يرجى تحديد اسم الشخصية المراد إهداؤها.', m);
  if (recipient === m.sender)
    return conn.reply(m.chat, '❌ لا يمكنك إهداء شخصية لنفسك 😆.', m);

  try {
    // 🔎 البحث عن الشخصية المملوكة من قبل المستخدم
    const { rows } = await m.db.query(
      'SELECT id, name, claimed_by FROM characters WHERE LOWER(name) = $1 AND claimed_by = $2',
      [characterName.toLowerCase(), m.sender]
    );
    const character = rows[0];

    // 🚫 في حال لم تكن الشخصية مملوكة له أو غير موجودة
    if (!character) {
      const { rows: exists } = await m.db.query(
        'SELECT name FROM characters WHERE LOWER(name) = $1',
        [characterName.toLowerCase()]
      );
      if (!exists[0])
        return conn.reply(
          m.chat,
          `❌ لم يتم العثور على الشخصية *"${characterName}"* في قاعدة البيانات.`,
          m
        );
      return conn.reply(
        m.chat,
        `⚠️ لا يمكنك إهداء *${characterName}* لأنها ليست ضمن ممتلكاتك.`,
        m
      );
    }

    // 🎁 تحديث قاعدة البيانات (نقل الملكية)
    await m.db.query('UPDATE characters SET claimed_by = $1 WHERE id = $2', [
      recipient,
      character.id,
    ]);

    // 📤 رسالة النجاح
    return conn.reply(
      m.chat,
      `🎉 *تم الإهداء بنجاح!*\nلقد أهديت الشخصية *${character.name}* إلى @${recipient.split('@')[0]} 💖`,
      m,
      { mentions: [recipient] }
    );
  } catch (e) {
    console.error(e);
    return conn.reply(
      m.chat,
      '⚠️ حدث خطأ أثناء محاولة الإهداء. يرجى المحاولة لاحقًا.',
      m
    );
  }
}

// 🧩 إعداد الأوامر والمساعدة
handler.help = ['give @tag nombre_del_personaje', 'اهدي @منشن اسم_الشخصية'];
handler.tags = ['gacha'];
handler.command = /^(give|regalar-personajes|اهدي)$/i;
handler.register = true;

export default handler;
