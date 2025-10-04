import { db } from "../lib/postgres.js";

// 📦 المعالج الرئيسي
let handler = async (m, { command, text }) => {
  // 🧍 تحديد الشخص المستهدف
  let who = m.isGroup ? m.mentionedJid?.[0] : m.chat;
  if (!who) return m.reply("⚠️ يرجى الإشارة إلى شخص باستخدام @المنشن");
  let idFinal = who;

  // 🔍 البحث عن المستخدم عبر LID (اختياري)
  if (idFinal.includes("@lid")) {
    const result = await db.query(`SELECT num FROM usuarios WHERE lid = $1`, [idFinal]);
    if (!result.rowCount) return m.reply("❌ لم يتم العثور على مستخدم بهذا LID في قاعدة البيانات.");
    const numero = result.rows[0].num;
    idFinal = numero + "@s.whatsapp.net";
  }

  // 🧩 تنظيف المعرف وتحضير الرقم
  const cleanJid = idFinal.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
  const cantidad = parseInt(text.match(/\d+/)?.[0]);
  if (!cantidad || isNaN(cantidad)) return m.reply("⚠️ أدخل كمية صالحة من الأرقام.");

  try {
    const res = await db.query(`SELECT id FROM usuarios WHERE id = $1`, [cleanJid]);
    if (!res.rowCount) return m.reply("❌ هذا المستخدم غير مسجل في قاعدة البيانات.");

    let resultado;

    // 💎 إضافة الألماس (الحد)
    if (/addlimit|añadirdiamantes|dardiamantes|اضف_الماس|اضف_حد/i.test(command)) {
      resultado = await db.query(`UPDATE usuarios SET limite = limite + $1 WHERE id = $2 RETURNING limite`, [cantidad, cleanJid]);
      return m.reply(`*≡ 💎 تم إضافة الألماس:*\n┏━━━━━━━━━━━━\n┃• *الكمية:* ${cantidad}\n┗━━━━━━━━━━━━`);
    }

    // 💎 إزالة الألماس (الحد)
    if (/removelimit|quitardiamantes|sacardiamantes|حذف_الماس|نقص_الماس/i.test(command)) {
      resultado = await db.query(`UPDATE usuarios SET limite = GREATEST(0, limite - $1) WHERE id = $2 RETURNING limite`, [cantidad, cleanJid]);
      return m.reply(`*≡ 💎 تم خصم الألماس:*\n┏━━━━━━━━━━━━\n┃• *الكمية:* ${cantidad}\n┗━━━━━━━━━━━━`);
    }

    // ✨ إضافة نقاط الخبرة
    if (/addexp|añadirxp|addxp|اضف_خبرة|اضف_xp/i.test(command)) {
      resultado = await db.query(`UPDATE usuarios SET exp = exp + $1 WHERE id = $2 RETURNING exp`, [cantidad, cleanJid]);
      return m.reply(`*≡ ✨ تم إضافة الخبرة:*\n┏━━━━━━━━━━━━\n┃• *الكمية:* ${cantidad}\n┗━━━━━━━━━━━━`);
    }

    // ✨ خصم نقاط الخبرة
    if (/removexp|quitarxp|sacarexp|احذف_خبرة|نقص_xp/i.test(command)) {
      resultado = await db.query(`UPDATE usuarios SET exp = GREATEST(0, exp - $1) WHERE id = $2 RETURNING exp`, [cantidad, cleanJid]);
      return m.reply(`*≡ ✨ تم خصم الخبرة:*\n┏━━━━━━━━━━━━\n┃• *الكمية:* ${cantidad}\n┗━━━━━━━━━━━━`);
    }

  } catch (e) {
    console.error(e);
    return m.reply("❌ حدث خطأ أثناء تعديل البيانات.");
  }
};

// 🧾 المساعدة والأوامر
handler.help = [
  'addexp', 'addlimit', 'removexp', 'removelimit',
  'اضف_خبرة', 'اضف_الماس', 'حذف_الماس', 'احذف_خبرة'
];

handler.tags = ['المالك', 'التحكم'];
handler.command = /^(añadirdiamantes|dardiamantes|addlimit|removelimit|quitardiamantes|sacardiamantes|añadirxp|addexp|addxp|removexp|quitarxp|sacarexp|اضف_الماس|اضف_حد|حذف_الماس|نقص_الماس|اضف_خبرة|اضف_xp|احذف_خبرة|نقص_xp)$/i;
handler.owner = true;
handler.register = true;

export default handler;
