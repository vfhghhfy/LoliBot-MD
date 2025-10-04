import fs from 'fs';
import fuzzysort from 'fuzzysort';  

let handler = async (m, { usedPrefix, command, text }) => {
  // الحصول على قائمة المكونات (البلَغينات)
  let ar = Object.keys(plugins);
  let ar1 = ar.map(v => v.replace('.js', ''));

  // في حال لم يكتب المستخدم نص البحث
  if (!text) 
    return m.reply(`🔍 *ما الذي تريد البحث عنه؟*\n📘 مثال:\n${usedPrefix + command} ملصق`);

  // تنفيذ بحث غامض (تقريبي)
  let results = fuzzysort.go(text, ar1);

  // إذا لم يتم العثور على أي نتيجة
  if (results.length === 0) {
    return m.reply(`❌ لم يتم العثور على '${text}'.\n\n📋 *اقتراحات ممكنة:*\n${ar1.map(v => '• ' + v).join`\n`}`);
  }

  // إذا تم العثور على نتيجة، جلب اسم الملف وعرض محتواه
  let match = results[0].target;
  let filePath = './plugins/' + match + '.js';

  // التحقق من وجود الملف فعليًا
  if (!fs.existsSync(filePath)) 
    return m.reply(`⚠️ الملف '${match}.js' غير موجود في مجلد المكونات.`);

  // قراءة محتوى المكون وإرساله إلى المستخدم
  m.reply(fs.readFileSync(filePath, 'utf-8'));
};

// 🧩 معلومات الأوامر والمساعدة
handler.help = ['getplugin', 'gp', 'احصل', 'مكون'].map(v => v + ' <اسم>')
handler.tags = ['المالك']

// الأوامر المتاحة باللغتين (إنجليزية + عربية)
handler.command = /^(getplugin|gp|احصل|مكون)$/i

// للأمان: الأوامر خاصة بالمالك فقط
handler.rowner = true

export default handler;
