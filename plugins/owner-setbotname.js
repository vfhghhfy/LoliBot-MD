import { db } from "../lib/postgres.js";

const handler = async (m, { args, conn }) => {
  const id = conn.user?.id;
  if (!id) return;

  const name = args.join(" ").trim();

  // التحقق من إدخال الاسم
  if (!name) {
    return m.reply(
      "❌ يرجى كتابة اسم جديد للبوت.\n\n" +
      "📌 مثال:\n" +
      "/setbotname لولي بوت 😎\n" +
      "أو بالعربية:\n" +
      "/تعيين_الاسم لولي بوت 😎"
    );
  }

  // تحديث اسم البوت في قاعدة البيانات
  await db.query(
    `UPDATE subbots SET name = $1 WHERE id = $2`,
    [name, id.replace(/:\d+/, '')]
  );

  // الرد للمستخدم بعد النجاح
  m.reply(`✅ تم تحديث اسم البوت بنجاح إلى:\n*${name}*`);
};

// المساعدة والأوسمة
handler.help = ["setbotname <nombre>", "تعيين_الاسم <الاسم>"];
handler.tags = ["jadibot"];

// الأوامر متعددة اللغات
handler.command = /^setbotname|تعيين_الاسم|اسم_البوت|setname$/i;

handler.register = true;
handler.owner = true;

export default handler;
