const xpperlimit = 750;

const handler = async (m, { conn, command, args }) => {
  const res = await m.db.query("SELECT exp, limite FROM usuarios WHERE id = $1", [m.sender]);
  let user = res.rows[0];
  let count = 1;

  // تحديد عدد الماسات التي سيتم شراؤها
  if (/all/i.test(command) || (args[0] && /all/i.test(args[0]))) {
    count = Math.floor(user.exp / xpperlimit);
  } else {
    count = parseInt(args[0]) || parseInt(command.replace(/^buy/i, "")) || 1;
  }

  count = Math.max(1, count);
  const totalCost = xpperlimit * count;

  // التحقق من وجود XP كافية
  if (user.exp < totalCost)
    return m.reply(`⚠️ عذرًا، لا تمتلك ما يكفي من *XP* لشراء *${count}* 💎`);

  // تحديث بيانات المستخدم بعد الشراء
  await m.db.query(
    `UPDATE usuarios 
      SET exp = exp - $1, limite = limite + $2 
      WHERE id = $3
    `,
    [totalCost, count, m.sender]
  );

  // رسالة تأكيد العملية
  await m.reply(
    `╔═❖ *إيصال عملية الشراء*\n` +
    `║‣ *تم الشراء:* ${count} 💎\n` +
    `║‣ *المستَهلَك:* ${totalCost} XP\n` +
    `╚═══════════════`
  );
};

handler.help = [
  'buy [cantidad]',
  'buyall',
  'buy all',
  'شراء [العدد]',
  'شراءالكل'
];

handler.tags = ['econ'];
handler.command = /^(buy(all)?|شراء(الكل)?)$/i; // ← دعم أوامر عربية
handler.register = true;

export default handler;
