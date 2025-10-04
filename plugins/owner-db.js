import { db } from '../lib/postgres.js';

let handler = async (m, { conn, args, isOwner, command }) => {
  const subcmd = args[0]?.toLowerCase();

  switch (subcmd) {
    case 'info':
    case 'معلومات': { // 🔹 أمر بديل بالعربية
      try {
        const [usuarios, registrados, chats, grupos, mensajes, tablasRes, totalSize] = await Promise.all([
          db.query('SELECT COUNT(*) FROM usuarios'),
          db.query('SELECT COUNT(*) FROM usuarios WHERE registered = true'),
          db.query('SELECT COUNT(*) FROM chats'),
          db.query("SELECT COUNT(*) FROM group_settings WHERE welcome IS NOT NULL"),
          db.query('SELECT SUM(message_count) FROM messages'),
          db.query(`
            SELECT relname AS tabla, n_live_tup AS filas,
                   pg_size_pretty(pg_total_relation_size(relid)) AS tamaño
            FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;
          `),
          db.query(`
            SELECT pg_size_pretty(SUM(pg_total_relation_size(relid))) AS total
            FROM pg_stat_user_tables;
          `)
        ]);

        const text = [
          `📊 *\`إحصائيات قاعدة البيانات\`*`,
          `> 👤 المستخدمون: *${usuarios.rows[0].count}*`,
          `> ✅ المسجلون: *${registrados.rows[0].count}*`,
          `> 💬 عدد الدردشات الكلي: *${chats.rows[0].count}*`,
          `> 💾 الحجم الإجمالي للقاعدة: *${totalSize.rows[0].total}*`,
          `\n📁 *\`الحجم حسب الجداول:\`*`,
          ...tablasRes.rows.map(r => `• *${r.tabla}*: ${r.filas} صفوف — ${r.tamaño}`)
        ].join('\n');

        await m.reply(text);
      } catch (e) {
        console.error('[❌] /db info error:', e);
        await m.reply('❌ حدث خطأ أثناء استعلام قاعدة البيانات.');
      }
      break;
    }

    case 'optimizar':
    case 'تحسين': { // 🔹 أمر عربي بديل
      try {
        const inicio = Date.now();
        await db.query('VACUUM FULL;');
        const tiempo = ((Date.now() - inicio) / 1000).toFixed(2);
        await m.reply(`✅ *تمت عملية التحسين بنجاح.*\n📉 تم تنفيذ *VACUUM FULL*\n⏱️ المدة: *${tiempo} ثانية*`);
      } catch (e) {
        console.error('[❌] Error en optimizar:', e);
        await m.reply('❌ لم يتمكن النظام من تحسين القاعدة.');
      }
      break;
    }

    default:
      await m.reply(`❓ استخدم أحد الأوامر التالية:

• /db info — عرض الإحصائيات
• /db optimizar — تحسين القاعدة (VACUUM FULL)
• /قاعدة معلومات — عرض الإحصائيات
• /قاعدة تحسين — تحسين القاعدة`);
  }
};

handler.help = ['db info', 'db optimizar', 'قاعدة معلومات', 'قاعدة تحسين'];
handler.tags = ['owner'];
handler.command = /^(db|قاعدة)$/i; // 🔹 دعم الأمر العربي "قاعدة"
handler.rowner = true;

export default handler;
