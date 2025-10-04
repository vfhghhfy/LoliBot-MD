import { db } from "../lib/postgres.js";

const handler = async (m, { conn, args }) => {
  const id = conn.user?.id;
  if (!id) return m.reply("❌ تعذر تحديد هوية هذا البوت.");
  const cleanId = id.replace(/:\d+/, '');

  try {
    // 🧩 تحديد نوع الفلترة: 1 = رسمي، 2 = سب-بوت
    const tipoFiltro = args[0] === '1' ? 'oficial' : args[0] === '2' ? 'subbot' : null;

    // 📊 تنفيذ استعلام القاعدة
    const [res, conteo] = await Promise.all([
      db.query(`SELECT * FROM subbots${tipoFiltro ? ` WHERE tipo = '${tipoFiltro}'` : ''}`),
      tipoFiltro
        ? null
        : db.query(`SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE tipo = 'oficial') AS oficiales,
        COUNT(*) FILTER (WHERE tipo = 'subbot') AS subbots
      FROM subbots`)
    ]);

    // ⚠️ في حال لا توجد بيانات
    if (res.rows.length === 0) {
      return m.reply(
        tipoFiltro
          ? `❌ لا يوجد أي بوت من النوع *${tipoFiltro}* في قاعدة البيانات.`
          : "❌ جدول *subbots* فارغ، لا يوجد شيء لعرضه."
      );
    }

    // 🧾 رسالة العرض
    let mensaje = `📋 *قائمة البوتات ${tipoFiltro ? `(${tipoFiltro})` : ''}:*\n`;

    // عرض ملخص الأعداد العامة فقط إذا لم يتم تحديد نوع
    if (!tipoFiltro && conteo) {
      const { total, oficiales, subbots } = conteo.rows[0];
      mensaje += `*• البوتات الرئيسية:* ${oficiales}\n`;
      mensaje += `*• البوتات الفرعية:* ${subbots}\n\n`;
      mensaje += `\`🤖 الإعدادات العامة:\`\n`;
    }

    // 🔍 المرور على كل صف وإظهار التفاصيل
    for (const row of res.rows) {
      mensaje += `- 🆔 المعرف: ${row.id} (${row.tipo || 'غير محدد'})\n`;
      mensaje += `- ⚙️ الوضع: ${row.mode || 'عام'}\n`;
      mensaje += `- 📛 الاسم: ${row.name || 'افتراضي'}\n`;
      mensaje += `- 🔣 البادئات: ${row.prefix ? row.prefix.join(', ') : '[/,.,#]'}\n`;
      mensaje += `- 👑 المالكين: ${row.owners?.length ? row.owners.join(', ') : 'افتراضي'}\n`;
      mensaje += `- 🚫 منع الخاص: ${row.anti_private ? 'مفعل ✅' : 'غير مفعل ❌'}\n`;
      mensaje += `- 📞 منع المكالمات: ${row.anti_call ? 'مفعل ✅' : 'غير مفعل ❌'}\n`;
      mensaje += `- 🔒 خصوصية الرقم: ${row.privacy ? 'مفعلة ✅' : 'غير مفعلة ❌'}\n`;
      mensaje += `- 🤝 السماح باستعارة البوت: ${row.prestar ? 'مفعل ✅' : 'غير مفعل ❌'}\n`;
      mensaje += `- 🖼️ الشعار (اللوجو): ${row.logo_url || 'لا يوجد'}\n`;
      mensaje += `\n─────────────\n\n`;
    }

    // 📤 إرسال النتيجة للمستخدم
    m.reply(mensaje.trim());

  } catch (err) {
    console.error("❌ خطأ أثناء استعلام جدول subbots:", err);
    m.reply("❌ حدث خطأ أثناء قراءة جدول البوتات. يرجى إبلاغ المطور.");
  }
};

// 🧭 أوامر المساعدة
handler.help = ['testsubbots [اختياري: 1|2]', 'عرض_البوتات', 'قائمة_السب_بوتات'];
handler.tags = ['owner'];

// 🌍 الأوامر باللغتين
handler.command = /^testsubbots|عرض_البوتات|قائمة_السب_بوتات$/i;

// 🔐 صلاحيات
handler.register = true;
handler.owner = true;

export default handler;
