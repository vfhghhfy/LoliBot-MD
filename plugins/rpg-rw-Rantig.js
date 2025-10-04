//الكود الأصلي من: https://github.com/elrebelde21

async function handler(m, { conn }) {
  if (!m.db) return;

  try {
    // 🔍 جلب بيانات الشخصيات من قاعدة البيانات
    const { rows: characters } = await m.db.query('SELECT claimed_by FROM characters');
    const totalCharacters = characters.length;
    const claimedCharacters = characters.filter(c => c.claimed_by);
    const freeCharacters = characters.filter(c => !c.claimed_by);

    // 🧮 حساب عدد الشخصيات التي يملكها كل مستخدم
    const userClaims = claimedCharacters.reduce((acc, character) => {
      acc[character.claimed_by] = (acc[character.claimed_by] || 0) + 1;
      return acc;
    }, {});

    // 🏆 ترتيب المستخدمين حسب عدد الشخصيات
    const topUsers = Object.entries(userClaims)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10);

    // 📝 إعداد نص التصنيف
    let textt = `📊 *تصنيف الشخصيات* 📊\n`;
    textt += `- عدد الشخصيات الكلية: ${totalCharacters}\n`;
    textt += `- الشخصيات المُطالَب بها: ${claimedCharacters.length}\n`;
    textt += `- الشخصيات المتاحة: ${freeCharacters.length}\n\n`;
    textt += '*🏅 أفضل المستخدمين الذين يمتلكون أكثر الشخصيات:*\n`;

    // 📋 عرض الترتيب
    topUsers.forEach(([user, count], index) => {
      textt += `\n${index + 1}- @${user.split('@')[0]} (${count} شخصية)`;
    });

    // 📤 إرسال الرد إلى الدردشة
    await conn.sendMessage(
      m.chat,
      {
        text:
          textt +
          `\n\n> _استمر في استخدام البوت للمطالبة بالمزيد من الشخصيات!_`,
        contextInfo: { mentionedJid: topUsers.map(([user]) => user) },
      },
      { quoted: m }
    );
  } catch (e) {
    console.error(e);
    m.reply('⚠️ حدث خطأ أثناء تحميل التصنيف. حاول مرة أخرى لاحقًا.');
  }
}

// 🧩 إعدادات المساعدة والأوامر
handler.help = ['rw-personajes', 'ranking', 'تصنيف_الشخصيات'];
handler.tags = ['gacha'];
handler.command = /^(rw-personajes|ranking|تصنيف_الشخصيات)$/i;
handler.register = true;

export default handler;
