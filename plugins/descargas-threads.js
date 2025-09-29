import fetch from 'node-fetch'
const userRequests = {};

const handler = async (m, { conn, args, usedPrefix, command }) => {
if (!args[0]) return m.reply(`*⚠️ ماذا تبحث؟ أدخل رابط فيديو من Threads!!*\n*• مثال:*\n${usedPrefix + command} https://www.threads.net/@adri_leclerc_/post/C_dSNIOOlpy?xmt=AQGzxbmyveDB91QgFo_KQWzqL6PT2yCy2eg8BkhPTO-6Kw`)

if (userRequests[m.sender]) return await conn.reply(m.chat, `⏳ يا @${m.sender.split('@')[0]} أحمق، هناك طلب قيد المعالجة بالفعل. من فضلك، انتظر حتى ينتهي قبل تقديم طلب آخر`, userRequests[m.sender].message || m)   
const { key } = await conn.sendMessage(m.chat, {text: `⌛ انتظر ✋\n▰▰▰▱▱▱▱▱▱`}, {quoted: m}); 
userRequests[m.sender] = { active: true, message: { key, chat: m.chat, fromMe: true } };
await delay(1000);
await conn.sendMessage(m.chat, {text: `⌛ انتظر ✋ \n▰▰▰▰▰▱▱▱▱`, edit: key});
await delay(1000);
await conn.sendMessage(m.chat, {text: `⌛ لقد كاد أن ينتهي 🏃‍♂️💨\n▰▰▰▰▰▰▰▱▱`, edit: key});
m.react(`⌛`) 
try {
const res = await fetch(`https://api.agatz.xyz/api/threads?url=${args[0]}`);
const data = await res.json()
const downloadUrl = data.data.image_urls[0] || data.data.video_urls[0];
const fileType = downloadUrl.includes('.webp') || downloadUrl.includes('.jpg') || downloadUrl.includes('.png') ? 'image' : 'video';
if (fileType === 'image') {
await conn.sendFile(m.chat, downloadUrl, 'threads_image.jpg', '_*ها هي الصورة من Threads*_', m);
m.react('✅');
} else if (fileType === 'video') {
await conn.sendFile(m.chat, downloadUrl, 'threads_video.mp4', '_*ها هو الفيديو من Threads*_', m);
m.react('✅');
}
await conn.sendMessage(m.chat, {text: `✅ اكتمل\n▰▰▰▰▰▰▰▰▰`, edit: key})   
} catch {   
try {
const res2 = await fetch(`${info.apis}/download/threads?url=${args[0]}`);
const data2 = await res2.json();
if (data2.status === true && data2.data.length > 0) {
const downloadUrl = data2.data[0].url; 
const fileType = data2.data[0].type; 
if (fileType === 'image') {
await conn.sendFile(m.chat, downloadUrl, 'threads_image.jpg', '_*ها هي الصورة من Threads*_', m);
m.react('✅');
} else if (fileType === 'video') {
await conn.sendFile(m.chat, downloadUrl, 'threads_video.mp4', '_*ها هو الفيديو من Threads*_', m);
m.react('✅');
}}
await conn.sendMessage(m.chat, {text: `✅ اكتمل\n▰▰▰▰▰▰▰▰▰`, edit: key})   
} catch (e) {
m.react(`❌`) 
await conn.sendMessage(m.chat, {text: `\`\`\`⚠️ حدث خطأ ⚠️\`\`\`\n\n> *أبلغ عن الخطأ التالي إلى مطوري باستخدام الأمر:* #report\n\n>>> ${e} <<<<`, edit: key})   
console.log(e) 
}} finally {
delete userRequests[m.sender];
}}
handler.help = ['thread']
handler.tags = ['downloader']
handler.command = /^(thread|threads|ثريد)$/i;
handler.register = true;
handler.limit = 1

export default handler

const delay = time => new Promise(res => setTimeout(res, time))
