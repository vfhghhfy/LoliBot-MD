import util from 'util'
import path from 'path' 
import fetch from 'node-fetch';

let toM = a => '@' + a.split('@')[0] 
let handler = async (m, { conn, metadata, command, text, participants, usedPrefix}) => {
let fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }  
try {

let user = a => '@' + a.split('@')[0]
let ps = metadata.participants.map(v => v.id)
let a = ps.getRandom()
let b = ps.getRandom() 
let c = ps.getRandom()
let d = ps.getRandom()
let e = ps.getRandom()
let f = ps.getRandom()
let g = ps.getRandom()
let h = ps.getRandom()
let i = ps.getRandom()
let j = ps.getRandom() 

//------------------------------------------------------------------------------------

if (command == 'amistad' || command == 'amigorandom' || command == 'صداقة' || command == 'صديق') {   
m.reply(`*🔰 هيا لنكوّن بعض الصداقات 🔰*\n\n*يا ${toM(a)} تواصل مع ${toM(b)} خاص لتلعبوا معًا وتصبحوا أصدقاء 🙆*\n\n*أفضل الصداقات تبدأ بلعبة 😉*`, null, {
mentions: [a, b]})}

//------------------------------------------------------------------------------------
  
if (command == 'follar' || command == 'violar' || command == 'نيك' || command == 'ضرب') {   
if (!text) return m.reply(`*أدخل @ أو اسم الشخص الذي تريد ${command.replace('how', '')}*`) 
let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
conn.reply(m.chat, `🤤👅🥵 *لقد انتهيت من ${command.replace('how', '')} @!*🥵👅🤤\n\n*لقد انتهيت من ${command.replace('how', '')} العاهرة* *${text}* *بأربع أرجل بينما كانت تئن مثل عاهرة ملعونة "آآه.. آآآه، استمر، لا تتوقف، لا تتوقف.." وقد تركتها ممزقة لدرجة أنها لا تستطيع تحمل حتى جسدها الملعون!*\n\n*${text}*\n🤤🥵 *!لقد تم ${command.replace('how', '')}* 🥵🤤`, { mentions: [user] })}

//------------------------------------------------------------------------------------

if (command == 'formarpareja' || command == 'formarparejas' || command == 'زوج' || command == 'تزويج') {
m.reply(`*${toM(a)}, لقد حان الوقت لتتزوج 💍 من ${toM(b)}, زوجين جميلين 😉💓*`, null, {
mentions: [a, b]})}
  
//------------------------------------------------------------------------------------
    
if (command == 'personalidad' || command == 'شخصية') {
if (!text) return conn.reply(m.chat, 'أدخل اسم؟', m)
let personalidad = `┏━━°❀❬ *الشخصية* ❭❀°━━┓
*┃*
*┃• الاسم* : ${text}
*┃• الأخلاق الحميدة* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}
*┃• الأخلاق السيئة* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}
*┃• نوع الشخص* : ${pickRandom(['طيب القلب','متعجرف','بخيل','كريم','متواضع','خجول','جبان','فضولي','حساس','غير ثنائي XD', 'أحمق'])}
*┃• دائماً* : ${pickRandom(['ثقيل','سيء المزاج','مشتت','مزعج','نمام','يمارس العادة السرية','يتسوق','يشاهد الأنمي','يتحدث في الواتساب لأنه أعزب','مستلقي بلا فائدة','مغازل','على الهاتف'])}
*┃• الذكاء* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}
*┃• الكسل* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}
*┃• الغضب* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}
*┃• الخوف* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}
*┃• الشهرة* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}
*┃• الجنس* : ${pickRandom(['رجل', 'امرأة', 'مثلي', 'ثنائي الجنس', 'بانسي', 'نسوية', 'مغاير', 'ذكر ألفا', 'أنثى ألفا', 'مسترجلة', 'بالوسيكشوال', 'بلايستيشن سيكشوال', 'السيد منويلا', 'ديك سيكشوال'])}
┗━━━━━━━━━━━━━━━━`
conn.reply(m.chat, personalidad, m, { mentions: conn.parseMention(personalidad) })
}   

//------------------------------------------------------------------------------------

if (command == 'ship' || command == 'shippear' || command == 'حب' || command == 'علاقة') {
if (!text) return m.reply(`⚠️ اكتب اسم شخصين لحساب حبهما`)
let [text1, ...text2] = text.split(' ')
text2 = (text2 || []).join(' ')
if (!text2) throw `⚠️ اسم الشخص الثاني مفقود`
let love = `_❤️ *${text1}* فرصتك في الوقوع في حب *${text2}* هي *${Math.floor(Math.random() * 100)}%* 👩🏻‍❤️‍👨🏻_ `.trim()
m.reply(love, null, { mentions: conn.parseMention(love) })
}

//------------------------------------------------------------------------------------

if (command == 'Doxxeo' || command == 'doxxeo' || command == 'doxxear' || command == 'Doxxear' || command == 'doxeo' || command == 'doxear' || command == 'doxxeame' || command == 'doxeame' || command == 'اختراق' || command == 'هاك') {
let who
if (m.isGroup) who = m.mentionedJid[0]
else who = m.chat
let start = `*😱 بدء الاختراق!! 😱*`
let ala = `😨`
let boost = `*${pickRandom(['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'])}%*`
let boost2 = `*${pickRandom(['21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40'])}%*`
let boost3 = `*${pickRandom(['41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60'])}%*`
let boost4 = `*${pickRandom(['61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80'])}%*`
let boost5 = `*${pickRandom(['81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','100'])}%*`

const { key } = await conn.sendMessage(m.chat, {text: `${start}`, mentions: conn.parseMention(text)}, {quoted: m}) 
await delay(1000 * 1)
await conn.sendMessage(m.chat, {text: `${boost2}`, edit: key})
await delay(1000 * 1)
await conn.sendMessage(m.chat, {text: `${boost3}`, edit: key})
await delay(1000 * 1)
await conn.sendMessage(m.chat, {text: `${boost4}`, edit: key})
await delay(1000 * 1)
await conn.sendMessage(m.chat, {text: `${boost5}`, edit: key})

let old = performance.now()
let neww = performance.now()
let speed = `${neww - old}`
let doxeo = `*✅ تم اختراق الشخص بنجاح 🤣*\n\n*الوقت: ${speed} ثانية!*

*النتائج:*
*الاسم:* ${text}
*الأيبي:* 192.28.213.234
*N:* 43 7462
*W:* 12.4893
*SS NUMBER:* 6979191519182016
*IPV6:* fe80::5dcd::ef69::fb22::d9888%12 
*UPNP:* مفعل
*DMZ:* 10.112.42.15
*MAC:* 5A:78:3E:7E:00
*ISP:* TORNADO SLK PRODUCTION
*DNS:* 8.8.8.8
*ALT DNS:* 1.1.1.1.1  
*DNS SUFFIX:* TORNADO WI-FI
*WAN:* 100.23.10.90
*WAN TYPE:* private nat
*GATEWAY:* 192.168.0.1
*SUBNET MASK:* 255.255.0.255
*UDP OPEN PORTS:* 8080.80
*TCP OPEN PORTS:* 443
*ROUTER VENDEDOR:* ERICCSON
*DEVICE VENDEDOR:* WIN32-X
*CONNECTION TYPE:* TORNADO SLK PRODUCTION
*ICMPHOPS:* 192.168.0.1 192.168.1.1 100.73.43.4
host-132.12.32.167.ucom.com
host-132.12.111.ucom.com
36.134.67.189 216.239.78.11
Sof02s32inf14.1e100.net
*HTTP:* 192.168.3.1:433-->92.28.211.234:80
*Http:* 192.168.625-->92.28.211.455:80
*Http:* 192.168.817-->92.28.211.8:971
*Upd:* 192.168452-->92.28.211:7265288
*Tcp:* 192.168.682-->92.28.211:62227.7
*Tcp:* 192.168.725-->92.28.211:67wu2
*Tcp:* 192.168.629-->92.28.211.167:8615
*EXTERNAL MAC:* 6U:77:89:ER:O4
*MODEM JUMPS:* 58`
await conn.sendMessage(m.chat, {text: doxeo, edit: key})
}

//------------------------------------------------------------------------------------

if (command == 'gay' || command == 'مثلي') {
let vn = 'https://qu.ax/HfeP.mp3'
let who
if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
else who = m.sender 
let member = participants.map(u => u.id)
let me = m.sender
let jodoh = member[Math.floor(Math.random() * member.length)]
let random = `${Math.floor(Math.random() * 100)}`
let gay = random
if (gay < 20 ) {gay = 'أنت مغاير 🤪🤙'} else if (gay == 21 ) {gay = 'أكثر أو أقل 🤔'} else if (gay == 23 ) {gay = 'أكثر أو أقل 🤔'} else if (gay == 24 ) {ga = 'أكثر أو أقل 🤔'} else if (gay == 25 ) {gay = 'أكثر أو أقل 🤔'} else if (gay == 26 ) {gay = 'أكثر أو أقل 🤔'} else if (gay == 27 ) {gay = 'أكثر أو أقل 🤔'} else if (gay == 28 ) {gay = 'أكثر أو أقل 🤔'} else if (gay == 29 ) {gay = 'أكثر أو أقل 🤔'} else if (gay == 30 ) {gay = 'أكثر أو أقل 🤔'} else if (gay == 31 ) {gay = 'لدي شكوكي 😑'} else if (gay == 32 ) {gay = 'لدي شكوكي 😑'} else if (gay == 33 ) {gay = 'لدي شكوكي 😑'} else if (gay == 34 ) {gay = 'لدي شكوكي 😑'} else if (gay == 35 ) {gay = 'لدي شكوكي 😑'} else if (gay == 36 ) {gay = 'لدي شكوكي 😑'} else if (gay == 37 ) {gay = 'لدي شكوكي 😑'} else if (gay == 38 ) {gay = 'لدي شكوكي 😑'} else if (gay == 39 ) {gay = 'لدي شكوكي 😑'} else if (gay == 40 ) {gay = 'لدي شكوكي 😑'} else if (gay == 41 ) {gay = 'هل أنا محق؟ 😏'} else if (gay == 42 ) {gay = 'هل أنا محق؟ 😏'} else if (gay == 43 ) {gay = 'هل أنا محق؟ 😏'} else if (gay == 44 ) {gay = 'هل أنا محق؟ 😏'} else if (gay == 45 ) {gay = 'هل أنا محق؟ 😏'} else if (gay == 46 ) {gay = 'هل أنا محق؟ 😏'} else if (gay == 47 ) {gay = 'هل أنا محق؟ 😏'} else if (gay == 48 ) {gay = 'هل أنا محق؟ 😏'} else if (gay == 49 ) {gay = 'هل أنا محق؟ 😏'} else if (gay == 50 ) {gay = 'هل أنت أم لا؟ 🧐'} else if (gay > 51) {gay = 'أنت مثلي 🥸'}
let jawab = `@${who.split("@")[0]} هو 🏳️‍🌈 ${random}% مثلي\n\n${gay}`;
const avatar = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png');

const imageRes = await fetch(`https://some-random-api.com/canvas/gay?avatar=${encodeURIComponent(avatar)}`);
const buffer = await imageRes.buffer();

await conn.sendMessage(m.chat, {
  image: buffer,
  caption: jawab,
  contextInfo: {
    mentionedJid: [who],
    forwardingScore: 9999999,
    isForwarded: false
  }
}, { quoted: m, ephemeralExpiration: 24 * 60 * 1000 });

await conn.sendFile(m.chat, vn, 'gay.mp3', null, m, true, {
  type: 'audioMessage',
  ptt: true
});
}

//------------------------------------------------------------------------------------
    
if (command == 'gay2' || command == 'مثلي2') {
if (!text) return m.reply(`🤔 أحمق ضع علامة على الشخص ب @` ) 
let juego = `_*${text.toUpperCase()}* *هو* *${(500).getRandom()}%* *مثلي*_ 🏳️‍🌈`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}

//------------------------------------------------------------------------------------
  
if (command == 'lesbiana' || command == 'سحاقية') { 
if (!text) return m.reply(`🤔 أحمق ضع علامة على الشخص ب @` ) 
let juego = `_*${text.toUpperCase()}* *هي* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()}*_ 🏳️‍🌈`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------
  
if (command == 'pajero' || command == 'منيك') {
if (!text) return m.reply(`🤔 أحمق ضع علامة على الشخص ب @` ) 
let juego = `_*${text.toUpperCase()}* *هو* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()}*_ 😏💦`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------
  
if (command == 'pajera' || command == 'منيكة') {
if (!text) return m.reply(`🤔 أحمق ضع علامة على الشخص ب @` ) 
let juego = `_*${text.toUpperCase()}* *هي* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()}*_ 😏💦`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------
  
if (command == 'puto' || command == 'عاهر') {
if (!text) return m.reply(`🤔 أحمق ضع علامة على الشخص ب @` ) 
let juego = `_*${text.toUpperCase()}* *هو* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()},* *مزيد من المعلومات في الخاص 🔥🥵 XD*_`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------
  
if (command == 'puta' || command == 'عاهرة') {
if (!text) return m.reply(`🤔 أحمق ضع علامة على الشخص ب @` ) 
let juego = `_*${text.toUpperCase()}* *هي* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()},* *مزيد من المعلومات في الخاص 🔥🥵 XD*_`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}

//------------------------------------------------------------------------------------
  
if (command == 'manco' || command == 'فاشل') {
if (!text) return m.reply(`🤔 أحمق ضع علامة على الشخص ب @` ) 
let juego = `_*${text.toUpperCase()}* *هو* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()} 💩*_`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------ 
  
if (command == 'manca' || command == 'فاشلة') {
if (!text) return m.reply(`🤔 أحمق ضع علامة على الشخص ب @` ) 
let juego = `_*${text.toUpperCase()}* *هي* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()} 💩*_`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------
  
if (command == 'rata' || command == 'جرذ') {
if (!text) return m.reply(`🤔 أحمق ضع علامة على الشخص ب @` ) 
let juego = `_*${text.toUpperCase()}* *هو* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()} 🐁 يأكل الجبن 🧀*_`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------ 
  
if (command == 'prostituto' || command == 'مومس') {
if (!text) return m.reply(`🤔 أحمق ضع علامة على الشخص ب @` ) 
let juego = `_*${text.toUpperCase()}* *هو* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()} 🫦👅, من يريد خدماته؟ XD*_`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------  
  
if (command == 'prostituta' || command == 'مومسة') {
if (!text) return m.reply(`🤔 أحمق ضع علامة على الشخص ب @` ) 
let juego = `_*${text.toUpperCase()}* *هي* *${(500).getRandom()}%* *${command.replace('how', '').toUpperCase()} 🫦👅, من يريد خدماته؟ XD*_`.trim()
await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {})}
  
//------------------------------------------------------------------------------------

if (command == 'love' || command == 'حب') {
if (!text) return m.reply(`🤔 أحمق ضع علامة على الشخص ب @` ) 
conn.reply(m.chat, ` *❤️❤️ مقياس الحب ❤️❤️* 
*حب ${text} لك هو* *${Math.floor(Math.random() * 100)}%* *من 100%*
*هل يجب أن تطلب منه/ها أن يكون صديقك/صديقتك؟*`.trim(), m, m.mentionedJid ? {
 mentions: m.mentionedJid
 } : {})} 

//------------------------------------------------------------------------------------    
if (command == 'top' || command == 'ترتيب') {
if (!text) return m.reply(`والنص? 🤔\n📍 مثال: ${usedPrefix}top نيدرو`)
let ps = metadata.participants.map(v => v.id)
let a = ps.getRandom()
let b = ps.getRandom()
let c = ps.getRandom()
let d = ps.getRandom()
let e = ps.getRandom()
let f = ps.getRandom()
let g = ps.getRandom()
let h = ps.getRandom()
let i = ps.getRandom()
let j = ps.getRandom()
let k = Math.floor(Math.random() * 70);
let x = `${pickRandom(['🤓','😅','😂','😳','😎', '🥵', '😱', '🤑', '🙄', '💩','🍑','🤨','🥴','🔥','👇🏻','😔', '👀','🌚'])}`
let l = Math.floor(Math.random() * x.length);
let vn = `https://hansxd.nasihosting.com/sound/sound${k}.mp3`
let top = `*${x} أفضل 10 ${text} ${x}*
    
*1. ${user(a)}*
*2. ${user(b)}*
*3. ${user(c)}*
*4. ${user(d)}*
*5. ${user(e)}*
*6. ${user(f)}*
*7. ${user(g)}*
*8. ${user(h)}*
*9. ${user(i)}*
*10. ${user(j)}*`
m.reply(top, null, { mentions: [a, b, c, d, e, f, g, h, i, j]})
conn.sendFile(m.chat, vn, 'error.mp3', null, m, true, {
type: 'audioMessage',
ptt: true })}

//------------------------------------------------------------------------------------
 
 if (command == 'topgays' || command == 'مثليين') {
let vn = 'https://qu.ax/HfeP.mp3'
let top = `*🌈أفضل 10 مثليين/سحاقيات في المجموعة🌈*
    
*_1.- 🏳️‍🌈 ${user(a)}_* 🏳️‍🌈
*_2.- 🪂 ${user(b)}_* 🪂
*_3.- 🪁 ${user(c)}_* 🪁
*_4.- 🏳️‍🌈 ${user(d)}_* 🏳️‍🌈
*_5.- 🪂 ${user(e)}_* 🪂
*_6.- 🪁 ${user(f)}_* 🪁
*_7.- 🏳️‍🌈 ${user(g)}_* 🏳️‍🌈
*_8.- 🪂 ${user(h)}_* 🪂
*_9.- 🪁 ${user(i)}_* 🪁
*_10.- 🏳️‍🌈 ${user(j)}_* 🏳️‍🌈`
m.reply(top, null, { mentions: conn.parseMention(top) })
conn.sendFile(m.chat, vn, 'error.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true })}
    
//------------------------------------------------------------------------------------ 
     
if (command == 'topotakus' || command == 'اوتاكو') {
let vn = 'https://qu.ax/ZgFZ.mp3'
let top = `*🌸 أفضل 10 عشاق الأنمي في المجموعة 🌸*
    
*_1.- 💮 ${user(a)}_* 💮
*_2.- 🌷 ${user(b)}_* 🌷
*_3.- 💮 ${user(c)}_* 💮
*_4.- 🌷 ${user(d)}_* 🌷
*_5.- 💮 ${user(e)}_* 💮
*_6.- 🌷 ${user(f)}_* 🌷
*_7.- 💮 ${user(g)}_* 💮
*_8.- 🌷 ${user(h)}_* 🌷
*_9.- 💮 ${user(i)}_* 💮
*_10.- 🌷 ${user(j)}_* 🌷`
m.reply(top, null, { mentions: conn.parseMention(top) })
conn.sendFile(m.chat, vn, 'otaku.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true 
})}
   
//------------------------------------------------------------------------------------
    
if (command == 'topintegrantes' || command == 'topintegrante' || command == 'أعضاء') {
let top = `*_💎أفضل 10 أعضاء👑_*
    
*_1.- 💎 ${user(a)}_* 💎
*_2.- 👑 ${user(b)}_* 👑
*_3.- 💎 ${user(c)}_* 💎
*_4.- 👑 ${user(d)}_* 👑
*_5.- 💎 ${user(e)}_* 💎
*_6.- 👑 ${user(f)}_* 👑
*_7.- 💎 ${user(g)}_* 💎
*_8.- 👑 ${user(h)}_* 👑
*_9.- 💎 ${user(i)}_* 💎
*_10.- 👑 ${user(j)}_* 👑`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------   
   
if (command == 'toplagrasa' || command == 'topgrasa' || command == 'دهون') {
let top = `*_Uwu أفضل 10 الدهون Uwu_* 
    
*_1.- Bv ${user(a)} Bv_*
*_2.- :v ${user(b)} :v_*
*_3.- :D ${user(c)} :D_*
*_4.- Owo ${user(d)} Owo_*
*_5.- U.u ${user(e)} U.u_*
*_6.- >:v ${user(f)} >:v_*
*_7.- :'v ${user(g)} :'v_*
*_8.- ._. ${user(h)} ._._*
*_9.- :V ${user(i)} :V_*
*_10.- XD ${user(j)} XD_*`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------
   
if (command == 'toppanafrescos' || command == 'toppanafresco' || command == 'بانه') {
let top = `*_👊أفضل 10 بانه فريسكوس👊_* 
    
*_1.- 🤑 ${user(a)}_* 🤑
*_2.- 🤙 ${user(b)}_* 🤙
*_3.- 😎 ${user(c)}_* 😎
*_4.- 👌 ${user(d)}_* 👌
*_5.- 🧐 ${user(e)}_* 🧐
*_6.- 😃 ${user(f)}_* 😃
*_7.- 😋 ${user(g)}_* 😋
*_8.- 🤜 ${user(h)}_* 🤜
*_9.- 💪 ${user(i)}_* 💪
*_10.- 😉 ${user(j)}_* 😉`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------
   
if (command == 'topshiposters' || command == 'topshipost' || command == 'مهرج') {
let top = `*_😱أفضل 10 مهرجين في المجموعة😱_* 
    
*_1.- 😈 ${user(a)}_* 😈
*_2.- 🤙 ${user(b)}_* 🤙
*_3.- 🥶 ${user(c)}_* 🥶
*_4.- 🤑 ${user(d)}_* 🤑
*_5.- 🥵 ${user(e)}_* 🥵
*_6.- 🤝 ${user(f)}_* 🤝
*_7.- 😟 ${user(g)}_* 😟
*_8.- 😨 ${user(h)}_* 😨
*_9.- 😇 ${user(i)}_* 😇
*_10.- 🤠 ${user(j)}_* 🤠`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------  
   
if (command == 'toppajer@s' || command == 'منيكين') {
let top = `*_😏أكثر الأشخاص استمناء في المجموعة💦_* 
    
*_1.- 🥵 ${user(a)}_* 💦
*_2.- 🥵 ${user(b)}_* 💦
*_3.- 🥵 ${user(c)}_* 💦
*_4.- 🥵 ${user(d)}_* 💦
*_5.- 🥵 ${user(e)}_* 💦
*_6.- 🥵 ${user(f)}_* 💦
*_7.- 🥵 ${user(g)}_* 💦
*_8.- 🥵 ${user(h)}_* 💦
*_9.- 🥵 ${user(i)}_* 💦
*_10.- 🥵 ${user(j)}_* 💦`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------  
   
if (command == 'toplind@s' || command == 'toplindos' || command == 'جميلين') {
let top = `*_😳أجمل وأكثر الأشخاص جاذبية في المجموعة😳_*
    
*_1.- ✨ ${user(a)}_* ✨
*_2.- ✨ ${user(b)}_* ✨
*_3.- ✨ ${user(c)}_* ✨
*_4.- ✨ ${user(d)}_* ✨
*_5.- ✨ ${user(e)}_* ✨
*_6.- ✨ ${user(f)}_* ✨
*_7.- ✨ ${user(g)}_* ✨
*_8.- ✨ ${user(h)}_* ✨
*_9.- ✨ ${user(i)}_* ✨
*_10.- ✨ ${user(j)}_* ✨`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------
   
if (command == 'topput@s' || command == 'عاهرات') {
let top = `*_😏أكثر الأشخاص عهراً في المجموعة هم🔥_* 
    
*_1.- 👉 ${user(a)}_* 👌
*_2.- 👉 ${user(b)}_* 👌
*_3.- 👉 ${user(c)}_* 👌
*_4.- 👉 ${user(d)}_* 👌
*_5.- 👉 ${user(e)}_* 👌
*_6.- 👉 ${user(f)}_* 👌
*_7.- 👉 ${user(g)}_* 👌
*_8.- 👉 ${user(h)}_* 👌
*_9.- 👉 ${user(i)}_* 👌
*_10.- 👉 ${user(j)}_* 👌`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------   
   
if (command == 'topfamosos' || command == 'topfamos@s' || command == 'مشاهير') {
let top = `*_🌟أشهر الأشخاص في المجموعة🌟_* 
    
*_1.- 🛫 ${user(a)}_* 🛫
*_2.- 🥂 ${user(b)}_* 🥂
*_3.- 🤩 ${user(c)}_* 🤩
*_4.- 🛫 ${user(d)}_* 🛫
*_5.- 🥂 ${user(e)}_* 🥂
*_6.- 🤩 ${user(f)}_* 🤩
*_7.- 🛫 ${user(g)}_* 🛫
*_8.- 🥂 ${user(h)}_* 🥂
*_9.- 🤩 ${user(i)}_* 🤩
*_10.- 🛫 ${user(j)}_* 🛫`
m.reply(top, null, { mentions: conn.parseMention(top) })}
   
//------------------------------------------------------------------------------------ 
   
if (command == 'topparejas' || command == 'top5parejas' || command == 'أزواج') {
let top = `*_😍 أجمل 5 أزواج في المجموعة 😍_*
    
*_1.- ${user(a)} 💘 ${user(b)}_* 
يا له من زوجين رائعين 💖، هل تدعوني لحفل زفافكم؟ 🛐

*_2.- ${user(c)} 💘 ${user(d)}_*  
🌹 أنتم تستحقون الأفضل في العالم 💞

*_3.- ${user(e)} 💘 ${user(f)}_* 
يا لهما من مغرمين 😍، متى ستكوّنان عائلة؟ 🥰

*_4.- ${user(g)} 💘 ${user(h)}_* 
💗 أعلن أنكما زوجا السنة 💗 

*_5.- ${user(i)} 💘 ${user(j)}_* 
رائع! 💝، أنتما في شهر العسل 🥵✨❤️‍🔥`
m.reply(top, null, { mentions: conn.parseMention(top) })}
} catch (e) {
console.log(e)}}

// الأوامر العربية المضافة
handler.help = ["love", "gay2", "lesbiana", "pajero", "pajera", "puto", "puta", "manco", "manca", "rata", "prostituta", "prostituto", "amigorandom", "amistad", "formarpareja", "gay", "personalidad", "ship", "topgays", "top", "topputos", "toplindos", "toppajer@s", "topshipost", "toppanafresco", "topgrasa", "topintegrantes", "topfamos@s", "top5parejas", "Doxxeo", "doxxeo", "follar", "حب", "مثلي", "سحاقية", "منيك", "عاهر", "فاشل", "جرذ", "مومس", "صداقة", "زوج", "شخصية", "علاقة", "اختراق", "ترتيب", "مثليين", "اوتاكو", "أعضاء", "دهون", "بانه", "مهرج", "منيكين", "جميلين", "عاهرات", "مشاهير", "أزواج"];
handler.tags = ['game', 'fun', 'الألعاب', 'الترفيه'];
handler.command = /^love|gay2|lesbiana|pajero|pajera|puto|puta|manco|manca|rata|prostituta|prostituto|amigorandom|amistad|formarpareja|formarparejas|gay|personalidad|ship|shippear|topgays|top|topputos|toplindos|toplind@s|toppajer@s|toppajeros|topshipost|topshiposters|toppanafresco|topgrasa|toppanafrescos|toplagrasa|topintegrante|topintegrantes|topotakus|topfamosos|topfamos@s|topparejas|top5parejas|Doxxeo|doxxeo|doxxear|Doxxear|doxeo|doxear|doxxeame|doxeame|follar|violar|حب|مثلي|مثلي2|سحاقية|منيك|منيكة|عاهر|عاهرة|فاشل|فاشلة|جرذ|مومس|مومسة|صداقة|صديق|زوج|تزويج|شخصية|علاقة|اختراق|هاك|ترتيب|مثليين|اوتاكو|أعضاء|دهون|بانه|مهرج|منيكين|جميلين|عاهرات|مشاهير|أزواج/i
handler.register = true
export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function msToTime(duration) {
var milliseconds = parseInt((duration % 1000) / 100),
seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60),
hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
hours = (hours < 10) ? "0" + hours : hours
minutes = (minutes < 10) ? "0" + minutes : minutes
seconds = (seconds < 10) ? "0" + seconds : seconds
return hours + " ساعة " + minutes + " دقيقة"}
