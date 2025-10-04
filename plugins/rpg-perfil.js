import { createHash } from 'crypto'
import fetch from 'node-fetch'
import moment from 'moment-timezone'
import { xpRange } from '../lib/levelling.js'

// 🔹 دالة تنسيق رقم الهاتف
const formatPhoneNumber = (jid) => {
  if (!jid) return 'غير معروف';
  const number = jid.replace('@s.whatsapp.net', '');
  if (!/^\d{8,15}$/.test(number)) return 'غير معروف';
  return `+${number}`;
};

let handler = async (m, { conn }) => {
  let who = m.mentionedJid?.[0] || (m.fromMe ? conn.user?.jid : m.sender);

  // 🔹 جلب بيانات المستخدم من قاعدة البيانات
  const userResult = await m.db.query('SELECT * FROM usuarios WHERE id = $1', [who]);
  const user = userResult.rows[0];
  if (!user) return m.reply("⚠️ المستخدم غير مسجل في قاعدة البيانات.");

  // 🔹 جلب الحالة (bio) وصورة الملف الشخصي
  const bio = await conn.fetchStatus(who).catch(() => ({}));
  const biot = bio.status || 'لا توجد معلومات';
  const profilePic = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://telegra.ph/file/9d38415096b6c46bf03f8.jpg');
  const buffer = await (await fetch(profilePic)).buffer();

  const { exp, limite, nombre, registered, edad, level, marry, gender, birthday } = user;
  const { min, xp, max } = xpRange(level, global.multiplier || 1);
  const sn = createHash('md5').update(String(who)).digest('hex');
  const phone = formatPhoneNumber(who);

  // 🔹 محاولة تحديد الدولة عبر API
  let nacionalidad = 'غير معروفة';
  try {
    const response = await fetch(`${info.apis}/tools/country?text=${phone}`);
    const data = await response.json();
    if (data?.result?.name) nacionalidad = `${data.result.name} ${data.result.emoji}`;
  } catch (_) {}

  // 🔹 حالة العلاقة
  let relacion = '❌ *أنت غير مرتبط حاليًا، أعزب 🤑.*';
  if (marry) {
    const parejaRes = await m.db.query('SELECT nombre FROM usuarios WHERE id = $1', [marry]);
    const nombrePareja = parejaRes.rows[0]?.nombre || 'غير معروف';
    relacion = `💍 *مرتبط بـ:* ${nombrePareja}`;
  }

  // 🔹 نص الملف الشخصي
  const texto = `*「 الملف الشخصي 」*

👤 *الاسم:* ${nombre}
☎️ *الرقم:* ${phone}
🌐 *رابط واتساب:* wa.me/${who.split('@')[0]}
🌍 *الجنسية:* ${nacionalidad}
${edad ? `🎈 *العمر:* ${edad}` : ''}
${gender ? `⚧️ *النوع:* ${gender}` : ''}
${birthday ? `🎂 *تاريخ الميلاد:* ${moment(birthday).format('DD/MM/YYYY')}` : ''}

💎 *الحد:* ${limite ?? 0}
⚙️ *المستوى:* ${level}
◯ *مسجل:* ${registered ? 'نعم' : 'لا'}

${relacion}

*•━━━━⪻ الملف ⪼━━━━•*`;

  await conn.sendFile(m.chat, buffer, 'perfil.jpg', texto, m);
};

handler.help = ['perfil', 'perfil *@user*', 'ملفي', 'بروفايل'];
handler.tags = ['rg'];
handler.command = /^(perfil|profile|بروفايل|ملفي|ملف)$/i;
handler.register = true;

export default handler;
