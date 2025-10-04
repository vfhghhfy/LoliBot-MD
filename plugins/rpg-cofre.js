const handler = async (m, { conn }) => {
  const cooldown = 122_400_000; // 🕛 مدة الانتظار: 3 أيام
  const now = Date.now();
  const res = await m.db.query("SELECT exp, money, limite, lastcofre FROM usuarios WHERE id = $1", [m.sender]);
  const user = res.rows[0];
  const lastCofre = Number(user?.lastcofre) || 0;
  const nextTime = lastCofre + cooldown;
  const restante = Math.max(0, nextTime - now);

  // ⏳ تحقق من انتهاء فترة الانتظار
  if (restante > 0) 
    return m.reply(`🕛 لقد حصلت بالفعل على صندوقك 🎁\n⏱️ عُد بعد *${msToTime(restante)}* لفتح صندوق جديد.`);

  // 🏦 محتوى الصندوق
  const img = 'https://img.freepik.com/vector-gratis/cofre-monedas-oro-piedras-preciosas-cristales-trofeo_107791-7769.jpg?w=2000';
  const diamantes = Math.floor(Math.random() * 30);
  const coins = Math.floor(Math.random() * 4000);
  const xp = Math.floor(Math.random() * 5000);

  // 💾 تحديث بيانات المستخدم في قاعدة البيانات
  await m.db.query(`
    UPDATE usuarios 
    SET exp = exp + $1, money = money + $2, limite = limite + $3, lastcofre = $4 
    WHERE id = $5
  `, [xp, coins, diamantes, now, m.sender]);

  // 💬 نص الرسالة الظاهرة للمستخدم
  const texto = `🎁 *لقد فتحت صندوق المكافآت!*

📦 محتوى الصندوق:
💎 ${diamantes} ألماس
🪙 ${coins} عملة
⚡ ${xp} نقاط خبرة (XP)

✨ استمر في اللعب لتحصل على المزيد!`;

  // 🖼️ إرسال الصورة مع النص
  await conn.sendMessage(m.chat, {
    image: { url: img },
    caption: texto
  }, {
    quoted: {
      key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
      message: { conversation: '🎉 فتح الصندوق السحري 🎁' }
    }
  });
};

// 🧩 أوامر المساعدة المتاحة
handler.help = ['cofre', 'coffer', 'abrircofre', 'افتح_الصندوق', 'صندوق', 'كنز'];
handler.tags = ['اقتصاد', 'مكافآت'];
handler.command = /^(coffer|cofre|abrircofre|cofreabrir|افتح_الصندوق|صندوق|كنز)$/i;
handler.level = 9;
handler.register = true;

export default handler;

// 🕒 دالة تحويل الوقت إلى تنسيق مقروء
function msToTime(duration) {
  const totalMinutes = Math.floor(duration / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} ساعة و ${minutes} دقيقة`;
}
