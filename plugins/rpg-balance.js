const handler = async (m, { conn, usedPrefix }) => {
  // 👤 تحديد المستخدم المستهدف
  const who = m.quoted?.sender || m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender);

  // 🔍 جلب بيانات المستخدم من قاعدة البيانات
  const res = await m.db.query("SELECT limite, exp, money, banco FROM usuarios WHERE id = $1", [who]);
  const user = res.rows[0];
  if (!user) throw '✳️ المستخدم غير موجود في قاعدة البيانات.';

  // 💬 إنشاء رسالة الرصيد
  await conn.reply(m.chat, 
`*•───⧼⧼⧼ 📊 الحالة المالية ⧽⧽⧽───•*

@${who.split('@')[0]} لديه:

*• 💎 الألماس:* _${user.limite}_
*• ✨ الخبرة:* _${user.exp}_
*• 🪙 عملات لولي:* _${user.money}_
> خارج البنك 🏦

*•───⧼⧼⧼ 🏦 البنك ⧽⧽⧽───•*

*• 💰 الرصيد البنكي:* _${user.banco}_
> داخل البنك 🏦

•───────────────•

📘 *ملاحظة:*
يمكنك شراء 💎 الألماس باستخدام الأوامر التالية:
• *${usedPrefix}buy <الكمية>*
• *${usedPrefix}buyall*`, 
  m, 
  { mentions: [who] });
};

// 🧾 المساعدة والأوامر
handler.help = ['balance', 'رصيدي', 'الأموال'];
handler.tags = ['اقتصاد', 'مال', 'economy'];
handler.command = /^(bal|diamantes|diamond|balance|رصيدي|الرصيد|الماس|الأموال)$/i;
handler.register = true;

export default handler;
