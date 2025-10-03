import { db } from "../lib/postgres.js";

const handler = async (m, { conn }) => {
  // 🔒 تحديث إعدادات القروب: تفعيل الحظر
  await db.query(
    `INSERT INTO group_settings (group_id, banned)
     VALUES ($1, true)
     ON CONFLICT (group_id) DO UPDATE SET banned = true`,
    [m.chat]
  );

  // 🟢 رسالة تأكيد
  m.reply("✅ تم *حظر هذه المجموعة* 🚫، البوت لن يرد هنا بعد الآن.");
};

handler.help = [
  'banchat', 
  'ban2', 
  'banchat1', 
  'حظرالقروب', 
  'حظرالمجموعة'
];

handler.tags = ['owner'];

// 📝 دعم أوامر متعددة باللغتين
handler.command = /^(banchat|ban2|banchat1|حظرالقروب|حظرالمجموعة)$/i;

// الأمر مخصص للمالك فقط
//handler.botAdmin = true
handler.owner = true;

export default handler;
