const free = 5000;
const expIncrease = 1000;
const bonusExp = 10000;
const bonusLimit = 10;
const bonusMoney = 5000;

const handler = async (m, { conn }) => {
  const now = Date.now();
  const res = await m.db.query("SELECT exp, limite, money, lastclaim, dailystreak FROM usuarios WHERE id = $1", [m.sender]);
  const user = res.rows[0];
  const lastClaim = Number(user?.lastclaim) || 0;
  const streak = Number(user?.dailystreak) || 0;
  const nextClaimTime = lastClaim + 86400000; // 24 ساعة
  const restante = Math.max(0, nextClaimTime - now);

  if (now - lastClaim < 86400000)
    return m.reply(`⚠️ لقد حصلت بالفعل على مكافأتك اليومية 🎁\n⏳ عد بعد *${msToTime(restante)}* لتستطيع المطالبة مرة أخرى.`);

  const newStreak = (now - lastClaim < 172800000) ? streak + 1 : 1;
  const currentExp = free + (newStreak - 1) * expIncrease;
  const nextExp = currentExp + expIncrease;

  let bonusText = "";
  if (newStreak % 7 === 0) {
    await m.db.query(`
      UPDATE usuarios 
      SET exp = exp + $1, limite = limite + $2, money = money + $3, lastclaim = $4, dailystreak = $5
      WHERE id = $6
    `, [currentExp + bonusExp, bonusLimit, bonusMoney, now, newStreak, m.sender]);

    bonusText = `\n\n🎉 *مكافأة الأسبوع!* 🎉\n> +${formatNumber(bonusExp)} نقاط خبرة ⚡\n> +${bonusLimit} ألماس 💎\n> +${formatNumber(bonusMoney)} عملات 🪙\n\n`;
  } else {
    await m.db.query(`
      UPDATE usuarios 
      SET exp = exp + $1, lastclaim = $2, dailystreak = $3
      WHERE id = $4
    `, [currentExp, now, newStreak, m.sender]);
  }

  await conn.fakeReply(
    m.chat,
    `*🎁 مكافأتك اليومية!*\n\n> لقد حصلت على *${formatNumber(currentExp)} XP* (اليوم رقم ${newStreak})\n${bonusText}🔜 لا تنس المطالبة غدًا لتحصل على *${formatK(nextExp)} (${formatNumber(nextExp)}) XP إضافية* 🔥`,
    '13135550002@s.whatsapp.net',
    `🎁 استلام المكافأة اليومية 🎁`,
    'status@broadcast'
  );
};

handler.help = ['daily', 'claim', 'يومي', 'مكافأة', 'المطالبة'];
handler.tags = ['econ'];
handler.command = ['daily', 'claim', 'يومي', 'مكافأة', 'المطالبة'];
handler.register = true;

export default handler;

// ======= الدوال المساعدة =======

function msToTime(duration) {
  const totalSeconds = Math.floor(Math.max(0, duration) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours} ساعة و ${minutes} دقيقة`;
}

function formatNumber(num) {
  return num.toLocaleString('en').replace(/,/g, '.'); 
}

function formatK(num) {
  return (num / 1000).toFixed(1) + 'k'; 
}
