// كود مترجم ومعدل - نسخة مغامرات RPG
// تم تحويل النصوص إلى العربية مع الحفاظ على المنطق الأصلي

const handler = async (m, { conn }) => {
  const cooldown = 600_000; // 10 دقائق
  const now = Date.now();
  const res = await m.db.query('SELECT exp, lastAdventure FROM usuarios WHERE id = $1', [m.sender]);
  const user = res.rows[0];
  const lastAdventure = Number(user?.lastadventure || user?.lastAdventure) || 0;
  const remaining = Math.max(0, lastAdventure + cooldown - now);

  if (remaining > 0) 
    return conn.reply(m.chat, `⏳ يجب أن ترتاح ${msToTime(remaining)} قبل الانطلاق في مغامرة جديدة...`, m);

  const reward = Math.floor(Math.random() * 2500) + 1000;
  const story = adventures.getRandom();

  await m.db.query(
    `UPDATE usuarios SET exp = exp + $1, lastAdventure = $2 WHERE id = $3`,
    [reward, now, m.sender]
  );

  await conn.reply(
    m.chat,
    `🗺️ *${story}*\n\n🏅 ربحت: *${formatNumber(reward)} XP*`,
    m
  );
};

handler.help = ['مغامرة', 'adventure'];
handler.tags = ['rpg'];
handler.command = /^(مغامرة|adventure|rpgadventure)$/i;
handler.register = true;

export default handler;

// 🏕️ قائمة الجمل العشوائية
const adventures = [
  "انطلقت في رحلة عبر الغابة المظلمة ووجدت صندوقاً مليئاً بالذهب!",
  "قاتلت وحشاً أسطورياً وانتزعت منه جوهرة سحرية.",
  "أنقذت قروياً من اللصوص وحصلت على مكافأة سخية.",
  "عثرت على خريطة قديمة تقود إلى كنز في الصحراء.",
  "تسللت إلى قلعة مهجورة وعثرت على سيف نادر.",
  "استكشفت الكهوف واكتشفت بلورات مضيئة.",
  "واجهت عصابة من المرتزقة وانتصرت عليهم ببراعة.",
  "قابلت ساحراً عجوزاً منحك تعويذة تزيد قوتك.",
  "ساعدت تاجرًا في توصيل بضاعته وربحك XP جيد.",
  "دخلت معركة تدريبية وخرجت أكثر خبرة وثقة."
];

// 🔢 دالة تنسيق الأرقام
function formatNumber(num) {
  return num.toLocaleString("ar-EG");
}

// ⏳ دالة حساب الوقت المتبقي
function msToTime(duration) {
  const totalSeconds = Math.floor(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} دقيقة و ${seconds} ثانية`;
}

// 🔁 دالة لاختيار عنصر عشوائي
Array.prototype.getRandom = function () {
  return this[Math.floor(Math.random() * this.length)];
};
