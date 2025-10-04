import { db, getSubbotConfig } from "../lib/postgres.js";

const handler = async (m, { args, conn, usedPrefix }) => {
  const id = conn.user?.id;
  if (!id) return;
  const cleanId = id.replace(/:\d+/, '');
  const config = await getSubbotConfig(id);
  const actuales = Array.isArray(config.prefix) ? config.prefix : [config.prefix];

  // 🧾 عند عدم إدخال أي وسيطات — عرض البادئات الحالية
  if (args.length === 0) {
    const lista =
      actuales.length > 0
        ? actuales.map(p => `\`${p || '(بدون بادئة)'}\``).join(", ")
        : "بدون بادئة";
    return m.reply(
`📌 *البادئات الحالية:* ${lista}

✏️ *أمثلة الاستخدام:*
• \`${usedPrefix}setprefix /\` _(سيستجيب فقط للأوامر التي تبدأ بـ “/”)_
• \`${usedPrefix}setprefix 0\` _(بدون بادئة)_
• \`${usedPrefix}setprefix 0,#,!\` _(بدون بادئة، # و !)_`
    );
  }

  // 🔠 تحليل المدخلات الجديدة
  const entrada = args.join(" ").trim();

  // 🚫 عند اختيار "بدون بادئة"
  if (entrada.toLowerCase() === "noprefix" || entrada === "0") {
    try {
      const res = await db.query(
        `INSERT INTO subbots (id, prefix)
         VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET prefix = $2 RETURNING prefix`,
        [cleanId, [""]]
      );
      return m.reply(
        `✅ تم تفعيل وضع *بدون بادئة*.\nالآن يمكنك كتابة الأوامر مباشرة مثل:\n• \`menu\``
      );
    } catch (err) {
      console.error(err);
      return m.reply("❌ حدث خطأ أثناء حفظ البادئات، يرجى التحقق من قاعدة البيانات.");
    }
  }

  // 🧩 تجهيز قائمة البادئات الجديدة
  const lista = entrada
    .split(",")
    .map(p => p.trim())
    .map(p => (p === "0" ? "" : p))
    .filter((p, i, self) => self.indexOf(p) === i); // إزالة التكرارات

  if (lista.length === 0) return m.reply("❌ لم يتم الكشف عن أي بادئات صالحة.");
  if (lista.length > 9) return m.reply("⚠️ الحد الأقصى للبادئات هو 9.");

  try {
    const res = await db.query(
      `INSERT INTO subbots (id, prefix)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET prefix = $2 RETURNING prefix`,
      [cleanId, lista]
    );
    const nuevoTexto = lista
      .map(p => `\`${p || '(بدون بادئة)'}\``)
      .join(", ");
    m.reply(`✅ تم تحديث البادئات إلى: ${nuevoTexto}`);
  } catch (err) {
    console.error(err);
    return m.reply(
      "❌ حدث خطأ أثناء حفظ البادئات، يُرجى إبلاغ المطوّر باستخدام الأمر: /report"
    );
  }
};

// 🧭 التعليمات
handler.help = ['setprefix', 'تعيين_البادئة', 'تغيير_البادئة'];
handler.tags = ['jadibot'];

// 🌍 الأوامر المدعومة باللغتين
handler.command = /^setprefix|تعيين_البادئة|تغيير_البادئة$/i;

// 👑 الإعدادات
handler.owner = true;

export default handler;
