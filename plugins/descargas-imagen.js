import { googleImage } from '@bochilteam/scraper';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) 
    return m.reply(`📌 ماذا تريد أن أبحث؟ 🤔️ 
استخدم الأمر بهذه الطريقة:
• مثال:
*${usedPrefix + command} لولي*`) 

  // قائمة الكلمات المحظورة
  const forbiddenWords = [
    'caca','polla','porno','porn','gore','cum','semen','puta','puto','culo',
    'putita','putito','pussy','hentai','pene','coño','asesinato','zoofilia',
    'mia khalifa','desnudo','desnuda','cuca','chocha','muertos','pornhub',
    'xnxx','xvideos','teta','vagina','marsha may','misha cross','sexmex',
    'furry','furro','furra','xxx','rule34','panocha','pedofilia','necrofilia',
    'pinga','horny','ass','nude','popo','nsfw','femdom','futanari','erofeet',
    'sexo','sex','yuri','ero','ecchi','blowjob','anal','ahegao','pija','verga',
    'trasero','violation','violacion','bdsm','cachonda','+18','cp','mia marin',
    'lana rhoades','cepesito','hot','buceta','xxx','Violet Myllers',
    'Violet Myllers pussy','Violet Myllers desnuda','Violet Myllers sin ropa',
    'Violet Myllers culo','Violet Myllers vagina','Pornografía',
    'Pornografía infantil','niña desnuda','niñas desnudas','niña pussy',
    'niña pack','niña culo','niña sin ropa','niña siendo abusada',
    'niña siendo abusada sexualmente','niña cogiendo','niña fototeta',
    'niña vagina','hero Boku no pico','Mia Khalifa cogiendo',
    'Mia Khalifa sin ropa','Mia Khalifa comiendo polla','Mia Khalifa desnuda'
  ];

  // التحقق من وجود كلمات ممنوعة
  if (forbiddenWords.some(word => m.text.toLowerCase().includes(word))) 
    return m.reply('🙄 لن أبحث عن هذه التفاهات....');

  try {
    const res = await googleImage(text);
    const image = await res.getRandom();
    const link = image;

    conn.sendFile(m.chat, link, 'resultado.jpg', `_🔎 نتائج البحث عن: ${text}_`, m);
  } catch (e) {
    console.log(e);
  }
}

handler.help = ['gimage <كلمة>', 'imagen <كلمة>'];
handler.tags = ['البحث'];
handler.command = /^(gimage|image|صورة)$/i;
handler.register = true;
handler.limit = 1;

export default handler;
