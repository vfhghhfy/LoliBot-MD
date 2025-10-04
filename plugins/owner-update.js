import { execSync } from 'child_process';

const handler = async (m, { conn, text }) => {
  try {
    // 🌀 بدء الرسالة المتحركة
    const icons = ['🔁', '🔄', '🔃', '🔂'];
    let i = 0;

    let progressMsg = await conn.reply(m.chat, `${icons[i]} **جارِ التحديث...**`, m);

    // 🔁 حركة الرموز أثناء التحميل
    const interval = setInterval(async () => {
      i = (i + 1) % icons.length;
      try {
        await conn.sendMessage(m.chat, {
          edit: progressMsg.key,
          text: `${icons[i]} **جارِ التحديث...**`
        });
      } catch {}
    }, 600);

    // ⚙️ تنفيذ أمر git pull لتحديث الملفات
    const stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''));
    clearInterval(interval);

    let messager = stdout.toString();

    // ✅ لا يوجد تحديث جديد
    if (messager.includes('Already up to date.'))
      messager = `✅ *البوت محدث بالفعل!* لا توجد تحديثات جديدة.`;

    // 🔧 تم تنزيل تحديث جديد
    else if (messager.includes('Updating'))
      messager = `🛠️ *تم التحديث بنجاح!*\n\n📦 تفاصيل التغييرات:\n${stdout.toString()}`;

    // 📩 إرسال النتيجة النهائية
    await conn.sendMessage(m.chat, {
      edit: progressMsg.key,
      text: messager
    });

  } catch {
    // 🚨 في حال وجود ملفات متعارضة
    try {
      const status = execSync('git status --porcelain');
      if (status.length > 0) {
        const conflictedFiles = status
          .toString()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            if (
              line.includes('.npm/') ||
              line.includes('.cache/') ||
              line.includes('tmp/') ||
              line.includes('BotSession/') ||
              line.includes('npm-debug.log')
            ) return null;
            return '• ' + line.slice(3);
          })
          .filter(Boolean);

        if (conflictedFiles.length > 0) {
          const errorMessage = `⚠️ *حدث تعارض أثناء التحديث!*\n\n> هناك ملفات محلية تتعارض مع التحديثات الجديدة.\n\n🔧 *الحلول المقترحة:*\n- أعد تثبيت البوت بالكامل.\n- أو قم بتحديث الملفات يدويًا.\n\n📁 *الملفات المتأثرة:*\n${conflictedFiles.join('\n')}`;
          await conn.reply(m.chat, errorMessage, m);
        }
      }
    } catch (error) {
      console.error(error);
      await m.reply(`⚠️ حدث خطأ غير متوقع أثناء التحديث. جرّب لاحقًا أو قم بالتحديث يدويًا.`);
    }
  }
};

// 🧭 أوامر المساعدة
handler.help = ['update', 'تحديث', 'تحديث_البوت', 'تحديث_الملفات'];
handler.tags = ['owner'];

// 🌐 الأوامر بالعربية والإنجليزية
handler.command = /^(update|actualizar|gitpull|تحديث|تحديث_البوت|تحديث_الملفات)$/i;

// 👑 مخصص فقط للمالك
handler.owner = true;

export default handler;
