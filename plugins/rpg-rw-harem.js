//الكود الأصلي من: https://github.com/elrebelde21
//ترجمة وإضافة أوامر عربية بواسطة GPT-5

async function handler(m, { conn, args }) {
  if (!m.db) return;

  try {
    // 🔍 تحديد المستخدم المستهدف (المرسل أو المذكور)
    let targetUser = m.sender;
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      targetUser = m.mentionedJid[0];
    }

    // 📦 جلب الشخصيات المملوكة من قاعدة البيانات
    const { rows: userCharacters } = await m.db.query(
      'SELECT name, price FROM characters WHERE claimed_by = $1 ORDER BY name',
      [targetUser]
    );

    // ⚠️ في حال عدم وجود شخصيات
    if (userCharacters.length === 0) {
      const targetUsername =
        targetUser === m.sender ? 'أنت' : `@${targetUser.split('@')[0]}`;
      return conn.reply(
        m.chat,
        `🔹 *${targetUsername}* لا تمتلك أي شخصية في قائمتك.`,
        m,
        { mentions: [targetUser] }
      );
    }

    // 📄 إعداد الصفحات
    const itemsPerPage = 6;
    const totalPages = Math.ceil(userCharacters.length / itemsPerPage);
    let page = parseInt(args[0]) || 1;
    if (page < 1 || page > totalPages) page = 1;

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageCharacters = userCharacters.slice(startIndex, endIndex);

    // 🧾 بناء الرسالة
    let message = `*📜 \`قائمة الشخصيات المملوكة\`*\n\n`;
    message += `👤 *المستخدم:* @${targetUser.split('@')[0]}\n`;
    message += `💠 *عدد الشخصيات:* ${userCharacters.length}\n\n`;
    message += `🧍‍♀️ *قائمة الشخصيات:*\n`;

    currentPageCharacters.forEach((character, index) => {
      message += `${index + 1}. *${character.name}* — 💰 ${character.price.toLocaleString()} كوينز\n`;
    });

    message += `\n📄 *الصفحة:* ${page} من ${totalPages}`;

    // 📤 إرسال الرد
    return conn.reply(m.chat, message, m, { mentions: [targetUser] });
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, '⚠️ حدث خطأ أثناء عرض قائمة الشخصيات. حاول مرة أخرى لاحقًا.', m);
  }
}

// 🧩 إعدادات الأوامر والمساعدة
handler.help = ['harem @tag', 'هاريم @منشن'];
handler.tags = ['gacha'];
handler.command = /^(harem|هاريم)$/i;
handler.register = true;

export default handler;
