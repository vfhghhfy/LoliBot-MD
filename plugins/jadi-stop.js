import fs from "fs";
import path from "path";

const handler = async (m, { conn }) => {
  const rawId = conn.user?.id || "";
  const cleanId = rawId.replace(/:\d+/, ""); // إزالة :16, :17
  const sessionPath = path.join("jadibot", cleanId);
  const isSubBot = fs.existsSync(sessionPath);

  if (!isSubBot) 
    return m.reply("⚠️ هذا الأمر يمكن استخدامه فقط من داخل *جلسة SubBot*.");

  try {
    await m.reply("👋 مع السلامة، راح أشتاق لك :(");
    await conn.logout();

    setTimeout(() => {
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log(`[SubBot ${cleanId}] تم إغلاق وحذف الجلسة.`);
      }
    }, 2000);

    setTimeout(() => {
      m.reply("✅ *تم إنهاء جلسة الـ SubBot بنجاح.*\nيمكنك إعادة الاتصال باستخدام `/jadibot` أو `/serbot` أو `/انضم`.");
    }, 3000);

  } catch (err) {
    console.error(`❌ خطأ أثناء محاولة إغلاق الـ SubBot ${cleanId}:`, err);
    await m.reply("❌ حدث خطأ أثناء إغلاق جلسة الـ SubBot.");
  }
};

handler.help = ['stop', 'خروج', 'وقف'];
handler.tags = ['jadibot'];
handler.command = /^(stop|خروج|وقف)$/i; // إضافة أوامر عربية
handler.owner = true;
handler.private = true;
handler.register = true;

export default handler;
