import { db } from "../lib/postgres.js";

const handler = async (m, { conn }) => {
  // 🗂️ تحديث حالة المجموعة في قاعدة البيانات (إلغاء الحظر)
  await db.query(`
    INSERT INTO group_settings (group_id, banned)
    VALUES ($1, false)
    ON CONFLICT (group_id) DO UPDATE SET banned = false
  `, [m.chat]);

  // 📩 إرسال رسالة تأكيد
  m.reply("✅ تم رفع الحظر عن هذه المجموعة. يمكن للبوت الآن التفاعل هنا مرة أخرى 🤖");
};

// 🧭 المساعدة
handler.help = ['unbanchat', 'رفع_الحظر', 'فتح_المجموعة'];
handler.tags = ['owner'];

// 🌍 الأوامر المتاحة بالعربية والإنجليزية
handler.command = /^unbanchat|رفع_الحظر|فتح_المجموعة$/i;

// 👑 الصلاحيات
handler.owner = true;

export default handler;
