import { db } from "../lib/postgres.js";

const handler = async (m, { args, conn }) => {
  const id = conn.user?.id;
  if (!id) return;

  const url = args[0];

  // 🧩 التحقق من أن المستخدم أدخل رابط
  if (!url) {
    return m.reply(
      "❌ يرجى إدخال رابط صالح لصورة الشعار.\n\n" +
      "📌 مثال:\n" +
      "/setlogo https://i.imgur.com/logo.jpg\n" +
      "أو بالعربية:\n" +
      "/تعيين_الشعار https://i.imgur.com/logo.png"
    );
  }

  // 🧠 التحقق من أن الرابط يبدأ بـ http ويحتوي على امتداد صورة معروف
  const isValidImage = /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  if (!isValidImage) {
    return m.reply(
      "⚠️ الرابط المدخل لا يبدو أنه لصورة صالحة.\n" +
      "✅ يجب أن ينتهي بـ ‎.jpg‎ أو ‎.png‎ أو ‎.gif‎ أو ‎.webp‎.\n\n" +
      "📌 مثال صحيح:\n" +
      "https://i.imgur.com/logo.png"
    );
  }

  try {
    // 💾 تحديث الشعار في قاعدة البيانات
    await db.query(
      `UPDATE subbots SET logo_url = $1 WHERE id = $2`,
      [url, id.replace(/:\d+/, "")]
    );

    // 🖼️ عرض تأكيد مع معاينة الصورة
    await conn.sendMessage(
      m.chat,
      {
        image: { url },
        caption:
          `✅ تم تحديث شعار البوت بنجاح.\n\n🖼️ *المعاينة:*`,
      },
      { quoted: m }
    );
  } catch (err) {
    console.error(err);
    m.reply("❌ حدث خطأ أثناء حفظ الشعار في قاعدة البيانات.");
  }
};

// 📚 المساعدة
handler.help = [
  "setlogo <url>",
  "تعيين_الشعار <رابط الصورة>",
  "تعيين_اللوجو <رابط الصورة>",
];

// 🏷️ التصنيف
handler.tags = ["jadibot"];

// 🌐 الأوامر المدعومة (عربية + إنجليزية)
handler.command = /^setlogo|تعيين_الشعار|تعيين_اللوجو|logo$/i;

// 👑 الإعدادات
handler.register = true;
handler.owner = true;

export default handler;
