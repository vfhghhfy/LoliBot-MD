import yts from 'yt-search';

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
if (!text) return m.reply(`*ماذا تبحث؟* أدخل اسم الأغنية\n*• مثال*\n*${usedPrefix + command}* bad bunny`);
m.react('📀');
let result = await yts(text);
let ytres = result.videos;
if (!ytres.length) return m.reply('❌ لم يتم العثور على نتائج.');
let textoo = `*• نتائج البحث عن:*  ${text}\n\n`;
for (let i = 0; i < Math.min(15, ytres.length); i++) { 
let v = ytres[i];
textoo += `🎵 *العنوان:* ${v.title}\n📆 *نشر منذ:* ${v.ago}\n👀 *المشاهدات:* ${v.views}\n⌛ *المدة:* ${v.timestamp}\n🔗 *الرابط:* ${v.url}\n\n⊱ ────── {.⋅ ♫ ⋅.} ───── ⊰\n\n`;
}
await conn.sendFile(m.chat, ytres[0].image, 'thumbnail.jpg', textoo, m);
};
handler.help = ['playlist', 'yts'];
handler.tags = ['downloader'];
handler.command = ['playvid2', 'playlist', 'اغنية', 'yts', 'اغنيه'];
handler.register = true;
export default handler;

/*كود مع القوائم القديم
import yts from 'yt-search';
let handler = async (m, { conn, usedPrefix, text, args, command }) => {
if (!text) return m.reply(`*ماذا تبحث؟* أدخل اسم الأغنية\n*• مثال*\n*${usedPrefix + command}* bad bunny `) 
m.react('📀');
    
let result = await yts(text);
let ytres = result.videos;
let listSections = [];
for (let index in ytres) {
let v = ytres[index];
listSections.push({title: `${index} | ${v.title}`,
rows: [{header: '• • •「 🅐🅤🅓🅘🅞 」• • •', title: "", description: `▢ ⌚ المدة:* ${v.timestamp}\n▢ 👀 *المشاهدات:* ${v.views}\n▢ 📌 *العنوان* : ${v.title}\n▢ 📆 *نشر منذ:* ${v.ago}\n`, id: `${usedPrefix}fgmp3 ${v.url}`
}, {
header: "• • •「 🅥🅘🅓🅔🅞 」• • •", title: "" , description: `▢ ⌚ المدة:* ${v.timestamp}\n▢ 👀 *المشاهدات:* ${v.views}\n▢ 📌 *العنوان* : ${v.title}\n▢ 📆 *نشر منذ:* ${v.ago}\n`, id: `${usedPrefix}fgmp4 ${v.url}`
}, {
header: "• • •「 🅓🅞🅒🅤🅜🅔🅝🅣🅞🅢 🅜🅟❸ 」• • •", title: "" , description: `▢ ⌚ المدة:* ${v.timestamp}\n▢ 👀 *المشاهدات:* ${v.views}\n▢ 📌 *العنوان* : ${v.title}\n▢ 📆 *نشر منذ:* ${v.ago}\n`, id: `${usedPrefix}ytmp3doc ${v.url}` }, {
header: "'• • •「 🅓🅞🅒🅤🅜🅔🅝🅣🅞🅢 🅜🅟❹ 」• • •", title: "" , description: `▢ ⌚ المدة:* ${v.timestamp}\n▢ 👀 *المشاهدات:* ${v.views}\n▢ 📌 *العنوان* : ${v.title}\n▢ 📆 *نشر منذ:* ${v.ago}\n`, id: `${usedPrefix}ytmp4doc ${v.url}`
}]});}
    
await conn.sendList(m.chat, `*• النتائج:* ${text}*\n\n> *اختر خيارًا واضغط إرسال*`, wm, `🚀 النتائج 🚀`, ytres[0].image, listSections, m);
};
handler.help = ['playlist', 'yts']
handler.tags = ['downloader']
handler.command = ['playvid2', 'playlist', 'playlista', 'yts', 'ytsearch'] 
handler.register = true 

export default handler
*/
