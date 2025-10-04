// الكود الأصلي من: https://github.com/elrebelde21
// ترجمة وإضافة أوامر عربية بواسطة GPT-5

let handler = async (m, { conn, text }) => {
  // 🗄️ التحقق من وجود اتصال بقاعدة البيانات
  if (!m.db) return;

  const characterName = text.trim().toLowerCase();

  // 📋 التحقق من إدخال اسم الشخصية
  if (!characterName)
    return conn.reply(
      m.chat,
      '⚠️ الرجاء تحديد اسم الشخصية التي تريد سحبها من السوق.',
      m
    );

  try {
    // 🔎 البحث عن الشخصية المعروضة للبيع والمملوكة للبائع
    const { rows } = await m.db.query(
      'SELECT * FROM characters WHERE LOWER(name) = $1 AND seller = $2 AND for_sale = true',
      [characterName, m.sender]
    );
    const characterToRemove = rows[0];

    // 🚫 إذا لم تكن الشخصية موجودة أو ليست للبيع أو ليست مملوكة له
    if (!characterToRemove) {
      const { rows: exists } = await m.db.query(
        'SELECT * FROM characters WHERE LOWER(name) = $1',
        [characterName]
      );
      if (!exists[0])
        return conn.reply(
          m.chat,
          `❌ لم يتم العثور على أي شخصية بالاسم: *${characterName}*.`,
          m
        );
      if (exists[0].seller !== m.sender)
        return conn.reply(
          m.chat,
          '❌ لا يمكنك سحب هذه الشخصية لأنها ليست معروضة من قبلك.',
          m
        );
      return conn.reply(
        m.chat,
        `⚠️ الشخصية *${characterName}* ليست معروضة حاليًا للبيع.`,
        m
      );
    }

    // 🛒 تحديث قاعدة البيانات (إزالة من السوق)
    await m.db.query(
      'UPDATE characters SET for_sale = false, seller = null, last_removed_time = $1 WHERE id = $2',
      [Date.now(), characterToRemove.id]
    );

    // ✅ رسالة النجاح
    return conn.reply(
      m.chat,
      `✅ تم سحب الشخصية *${characterToRemove.name}* من السوق بنجاح.`,
      m
    );
  } catch (e) {
    console.error(e);
    return conn.reply(
      m.chat,
      '⚠️ حدث خطأ أثناء محاولة سحب الشخصية. يرجى المحاولة لاحقًا.',
      m
    );
  }
};

// 🧩 إعداد الأوامر والمساعدة
handler.help = ['rw-retirar', 'اسحب'];
handler.tags = ['gacha'];
handler.command = /^(rw-retirar|اسحب)$/i;
handler.register = true;

export default handler;
