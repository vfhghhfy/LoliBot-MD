const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) return m.reply(`✳️ الاستعمال:\n${usedPrefix + command} النص`);

  try {
    const base64 = Buffer.from(text, 'utf-8').toString('base64');
    return m.reply(`📦 النتيجة بالـ Base64:\n\n${base64}`);
  } catch (e) {
    return m.reply(`❌ حدث خطأ أثناء التحويل:\n${e.message}`);
  }
};

handler.help = ['tobase64', 'الى64', 'تحويل64']
handler.tags = ['tools']
handler.command = /^(tobase64|الى64|تحويل64)$/i
handler.register = true
handler.limit = 1

export default handler
