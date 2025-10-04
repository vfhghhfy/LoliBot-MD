// 🧱 أمر التعدين (minar) — تمت ترجمته بالكامل إلى العربية مع الحفاظ على المنطق الأصلي
const handler = async (m, { conn }) => {
  const now = Date.now();
  const cooldown = 600_000; // 10 دقائق
  const hasil = Math.floor(Math.random() * 6000);

  const res = await m.db.query("SELECT exp, lastmiming FROM usuarios WHERE id = $1", [m.sender]);
  const user = res.rows[0];
  const lastMine = Number(user?.lastmiming) || 0;
  const nextMineTime = lastMine + cooldown;
  const restante = Math.max(0, nextMineTime - now);

  if (restante > 0) 
    return m.reply(`⏳ يرجى الانتظار *${msToTime(restante)}* قبل أن تتمكن من التعدين مرة أخرى.`);

  const minar = pickRandom([
    '😎 محترف! لقد قمت بالتعدين',
    '🌟✨ رائع!! حصلت على',
    '⛏️ واو!! أنت منجم بارع! حصلت على',
    '💎 لقد قمت بالتعدين!',
    '😲 تمكنت من استخراج',
    '📈 أرباحك ارتفعت لأنك نقّبت عن',
    '⛏️⛏️⛏️ جاري التعدين...',
    '🤩 نعم!!! الآن تمتلك',
    '🏆 الحظ بجانبك، حصلت على',
    '😻 لقد حالفك الحظ في التنقيب عن',
    '♻️ مهمتك اكتملت! حصلت على',
    '⛏️ التعدين منحك مكافأة قدرها',
    '🛣️ أثناء بحثك وجدت منجماً يحتوي على',
    '👾 التعدين زاد من رصيدك بمقدار',
    '🎉 مبروك!! الآن لديك',
    '⚒️ لقد نقّبت ووجدت'
  ]);

  await m.db.query(`
    UPDATE usuarios 
    SET exp = exp + $1, lastmiming = $2 
    WHERE id = $3
  `, [hasil, now, m.sender]);

  m.reply(`${minar} *${formatNumber(hasil)} XP*`);
};

handler.help = ['minar', 'miming', 'mine', 'تعدين', 'منجم']; // 🔁 إضافة أوامر عربية مكافئة
handler.tags = ['econ'];
handler.command = ['minar', 'miming', 'mine', 'تعدين', 'منجم'];
handler.register = true;

export default handler;

// 🔹 دوال مساعدة

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function msToTime(duration) {
  const totalSeconds = Math.floor(Math.max(0, duration) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} دقيقة و ${seconds} ثانية`;
}

function formatNumber(num) {
  return num.toLocaleString('en').replace(/,/g, '.'); 
}
