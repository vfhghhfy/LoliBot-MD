import { startSubBot } from '../lib/subbot.js';
let commandFlags = {}; 

const handler = async (m, { conn, command }) => {
  try {
    commandFlags[m.sender] = true;
    const phone = m.sender?.split('@')[0];

    if (!phone) return m.reply("❌ لم أتمكن من استخراج رقمك.");

    // رسالة تعليمات الكود (8 أرقام)
    const msgCode = `*🤖 LoliBot-MD 🤖*\n\n🔑 ربط الجلسة باستخدام كود الهاتف\n\n*1️⃣ افتح القائمة (⋮) في الزاوية العليا اليمنى*\n*2️⃣ اختر: الأجهزة المرتبطة*\n*3️⃣ اختر: ربط باستخدام كود الهاتف*\n*4️⃣ أدخل الكود المكون من 8 أرقام الموجود أدناه*\n\n⚠️ *الكود صالح لمدة 60 ثانية فقط!*`;

    // استدعاء ربط SubBot مع خيار الكود فقط
    await startSubBot(m, conn, msgCode, true, phone, m.chat, commandFlags);

    // بعد نجاح الربط
    setTimeout(() => {
      m.reply("✅ *تم ربط الجلسة بنجاح.*\nالآن يمكنك استخدام حسابك كـ SubBot بدون مشاكل 🚀");
    }, 5000); // يرسل رسالة النجاح بعد 5 ثواني (ممكن تغيرها)

  } catch (err) {
    console.error(`❌ خطأ أثناء محاولة تشغيل SubBot:`, err);
    await m.reply("⚠️ حدث خطأ أثناء محاولة تشغيل الجلسة.");
  }
};

handler.help = ['تنصيب'];
handler.tags = ['jadibot'];
handler.command = /^(تنصيب)$/i; // الأمر حصري "تنصيب"
handler.register = false;

export default handler;
