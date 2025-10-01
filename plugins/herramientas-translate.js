import fetch from 'node-fetch';

const handler = async (m, { args, usedPrefix, command }) => {
const defaultLang = 'ar';
if (!args || !args[0]) return m.reply(`⚠️ *الاستخدام الصحيح للأمر:*  
» ${usedPrefix + command} (اللغة الهدف) (النص المطلوب ترجمته)

📌 *أمثلة:*
• ${usedPrefix + command} en مرحبا » الإنجليزية
• ${usedPrefix + command} fr صباح الخير » الفرنسية
• ${usedPrefix + command} pt كيف حالك » البرتغالية
• ${usedPrefix + command} de جيد » الألمانية
• ${usedPrefix + command} it صباح الخير » الإيطالية
• ${usedPrefix + command} es السلام عليكم » الإسبانية`);

  let lang = args[0];
  let text = args.slice(1).join(' ');

  if ((lang || '').length !== 2) {
    text = args.join(' ');
    lang = defaultLang;
  }

  if (!text && m.quoted && m.quoted.text) text = m.quoted.text;

  if (!text) return m.reply(msg);

  try {
    const res = await fetch("https://tr.skyultraplus.com/translate", {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: "auto",
        target: lang,
        format: "text",
        alternatives: 3,
        api_key: ""
      }),
      headers: { "Content-Type": "application/json" }
    });

    const json = await res.json();

    if (!json || !json.translatedText) throw '❌ تعذرت الترجمة.';

    await m.reply(`*الترجمة:*\n${json.translatedText}`);
  } catch (e) {
    console.error(e);
    await m.reply('*[❗معلومة❗] خطأ، يرجى المحاولة مرة أخرى*');
  }
};

// الأوامر العربية المضافة
handler.help = ['ترجمة', 'ترجم', 'translate', 'traducir'];
handler.tags = ['أدوات', 'tools'];
handler.command = /^(translate|traducir|trad|ترجمة|ترجم)$/i;
handler.register = true;

export default handler;
