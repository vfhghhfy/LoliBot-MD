import { createHash } from 'crypto';
import moment from 'moment-timezone';
import { db } from '../lib/postgres.js';
import fetch from 'node-fetch';

// 🔹 صور ترحيب عشوائية
const welcomeImages = [
  'https://telegra.ph/file/aaacb6b51f3a5c10f1c5e.jpg',
  'https://telegra.ph/file/2144de78d59803d3e95ee.jpg',
  'https://telegra.ph/file/31eea3f3a7d8b2df0f21a.jpg',
  'https://telegra.ph/file/1b6c18f1b28c6e61f6a02.jpg',
  'https://telegra.ph/file/2f3c237a97f7f89da3c3d.jpg'
];

const formatPhoneNumber = (jid) => {
  if (!jid) return null;
  const number = jid.replace('@s.whatsapp.net', '');
  if (!/^\d{8,15}$/.test(number)) return null;
  return `+${number}`;
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const who = m.sender;
  const date = moment.tz('Asia/Riyadh').format('DD/MM/YYYY');
  const time = moment.tz('Asia/Riyadh').format('LT');
  const phone = formatPhoneNumber(who);

  const userRes = await db.query(`SELECT * FROM usuarios WHERE id = $1`, [who]);
  const user = userRes.rows[0] || { registered: false };

  // 🔹 أمر التسجيل السريع
  if (/^(تسجيل|reg|verify|verificar)$/i.test(command)) {
    if (user.registered) return m.reply('✅ *أنت مسجل بالفعل 🤨*');
    if (!text) return m.reply(`⚠️ *طريقة الاستخدام:*\n${usedPrefix + command} الاسم\n📌 مثال: ${usedPrefix + command} دزاري`);

    let name = text.replace(/[0-9._-]+/g, '').trim();
    if (name.length < 2) return m.reply('⚠️ *الاسم قصير جدًا.*');
    if (name.length > 40) return m.reply('⚠️ *الاسم طويل جدًا.*');

    const serial = createHash('md5').update(who).digest('hex');
    const reg_time = new Date();

    await db.query(`
      INSERT INTO usuarios (id, nombre, money, limite, exp, reg_time, registered, serial_number)
      VALUES ($1, $2, 400, 2, 150, $3, true, $4)
      ON CONFLICT (id) DO UPDATE
      SET nombre = $2, money = usuarios.money + 400, limite = usuarios.limite + 2,
          exp = usuarios.exp + 150, reg_time = $3, registered = true, serial_number = $4
    `, [who, name + '✓', reg_time, serial]);

    const totalRes = await db.query(`SELECT COUNT(*) AS total FROM usuarios WHERE registered = true`);
    const totalUsers = parseInt(totalRes.rows[0].total);

    // 🔹 رسالة الترحيب
    const welcomeImage = welcomeImages[Math.floor(Math.random() * welcomeImages.length)];
    const caption = `[ ✅ تم التسجيل بنجاح ]

🎉 *أهلًا بك يا ${name}!*

📆 *التاريخ:* ${date}
🕒 *الوقت:* ${time}
☎️ *الرقم:* wa.me/${who.split('@')[0]}

🔑 *الرقم التسلسلي:* ${serial}

🎁 *مكافأتك:*
💎 +2 ألماس
🪙 +400 كوينز
⭐ +150 خبرة

👥 *عدد المسجلين الكلي:* ${formatNum(totalUsers)}
📜 *استخدم ${usedPrefix}قائمة لرؤية الأوامر.*

✨ *مرحبًا بك في عائلتنا ❤️*`;

    await conn.sendFile(m.chat, welcomeImage, 'welcome.jpg', caption, m);
  }

  // 🔹 عرض الرقم التسلسلي
  if (/^(sn|رقمي|nserie|myns)$/i.test(command)) {
    if (!user.registered) return m.reply(`⚠️ *أنت غير مسجل*\n📌 استخدم:\n${usedPrefix}تسجيل اسمك`);
    const serial = user.serial_number || createHash('md5').update(who).digest('hex');
    return conn.reply(m.chat, `🔑 *رقمك التسلسلي:*\n${serial}`, m);
  }

  // 🔹 حذف التسجيل
  if (/^(unreg|حذف_تسجيل)$/i.test(command)) {
    if (!user.registered) return m.reply(`⚠️ *أنت غير مسجل*\n📌 استخدم:\n${usedPrefix}تسجيل اسمك`);
    if (!text) return m.reply(`✳️ *أدخل رقمك التسلسلي لحذف التسجيل*\n📌 استخدم ${usedPrefix}رقمي لمعرفة الرقم.`);
    const serial = user.serial_number || createHash('md5').update(who).digest('hex');
    if (text !== serial) return m.reply('⚠️ *الرقم التسلسلي غير صحيح.*');

    await db.query(`UPDATE usuarios SET registered = false, nombre = NULL, money = 0, limite = 0, exp = 0, reg_time = NULL, serial_number = NULL WHERE id = $1`, [who]);
    return m.reply('🗑️ *تم حذف تسجيلك بنجاح.*');
  }
};

handler.help = ['تسجيل <الاسم>', 'رقمي', 'حذف_تسجيل <السيريال>'];
handler.tags = ['rg'];
handler.command = /^(تسجيل|reg|verify|verificar|sn|رقمي|unreg|حذف_تسجيل)$/i;
handler.register = true;

export default handler;

// 🔹 تنسيق الأرقام
function formatNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}
