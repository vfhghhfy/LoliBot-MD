import { db, getSubbotConfig } from "../lib/postgres.js";

const handler = async (m, { args, conn, usedPrefix, command }) => {
  const id = conn.user?.id;
  if (!id) return;
  
  const cleanId = id.replace(/:\d+/, '');
  const newModeArg = args[0]?.toLowerCase();

  // التحقق من صحة الأمر
  if (!["on", "off", "private", "public", "خاص", "عام"].includes(newModeArg)) {
    return m.reply(
      `⚙️ الاستخدام الصحيح:\n\n` +
      `• *${usedPrefix + command} on* → تفعيل الوضع الخاص 🔒\n` +
      `• *${usedPrefix + command} off* → تفعيل الوضع العام 🌐\n\n` +
      `أو استخدم بالعربية:\n` +
      `• *${usedPrefix + command} خاص*\n` +
      `• *${usedPrefix + command} عام*`
    );
  }

  // تحديد الوضع الجديد
  const newMode = (
    newModeArg === "on" ||
    newModeArg === "private" ||
    newModeArg === "خاص"
  ) ? "private" : "public";

  try {
    // تحديث قاعدة البيانات
    const res = await db.query(
      `INSERT INTO subbots (id, mode)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET mode = $2 RETURNING mode`,
      [cleanId, newMode]
    );

    // تحديد النص الظاهر
    const stateText = newMode === "private"
      ? "🔒 *الوضع الخاص مفعل الآن*"
      : "🌐 *الوضع العام مفعل الآن*";

    // الرد للمستخدم
    m.reply(`✅ تم تغيير وضع البوت بنجاح.\nالحالة الحالية: ${stateText}`);

  } catch (err) {
    console.error(err);
    m.reply("❌ حدث خطأ أثناء محاولة تغيير الوضع. يرجى المحاولة لاحقًا.");
  }
};

// تعليمات المساعدة
handler.help = ['self'];
handler.tags = ['jadibot'];

// الأوامر المتعددة اللغات (إسبانية + إنجليزية + عربية)
handler.command = /^(modoprivado|self|modoprivate|خاص|عام|وضع_خاص|وضع_عام)$/i;

handler.owner = true;
export default handler;
