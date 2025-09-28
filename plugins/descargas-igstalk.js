import fg from 'api-dylux'
let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`⚠️ يرجى إدخال اسم مستخدم إنستغرام\n\n*• مثال:* ${usedPrefix + command} GataDios`)
  m.react("⌛");
  
  try {
    const apiUrl = `${info.apis}/tools/igstalk?username=${encodeURIComponent(args[0])}`;
    const apiResponse = await fetch(apiUrl);
    const delius = await apiResponse.json();
    if (!delius || !delius.data) return m.react("❌");
    
    const profile = delius.data;
    const txt = `👤 *معلومات حساب إنستغرام*:
🔹 *اسم المستخدم*: ${profile.username}
🔹 *الاسم الكامل*: ${profile.full_name}
🔹 *السيرة الذاتية*: ${profile.biography}
🔹 *حساب موثق*: ${profile.verified ? 'نعم' : 'لا'}
🔹 *حساب خاص*: ${profile.private ? 'نعم' : 'لا'}
🔹 *المتابعون*: ${profile.followers}
🔹 *يتبع*: ${profile.following}
🔹 *المشاركات*: ${profile.posts}
🔹 *الرابط*: ${profile.url}`;

    await conn.sendFile(m.chat, profile.profile_picture, 'صورة_الانستغرام.jpg', txt, m);
    m.react("✅");
    
  } catch (e2) {
    try {     
      let res = await fg.igStalk(args[0])
      let te = `👤 *معلومات حساب إنستغرام*:
*• الاسم:* ${res.name} 
*• اسم المستخدم:* ${res.username}
*• المتابعون:* ${res.followersH}
*• يتبع:* ${res.followingH}
*• السيرة:* ${res.description}
*• المشاركات:* ${res.postsH}
*• الرابط* : https://instagram.com/${res.username.replace(/^@/, '')}`
      
      await conn.sendFile(m.chat, res.profilePic, 'انستغرام.png', te, m)
      m.react("✅");     
      
    } catch (e) {
      await m.react(`❌`) 
      m.reply(`\`\`\`⚠️ حدث خطأ ⚠️\`\`\`\n\n> *قم بالإبلاغ عن هذا الخطأ لمطور البوت باستخدام الأمر:* #report\n\n>>> ${e} <<<< `)       
      console.log(e)
    }
  }
}

handler.help = ['igstalk']
handler.tags = ['تحميل']
handler.command = ['igstalk', 'igsearch', 'instagramsearch', 'بحثانستغرام'] 
handler.register = true
handler.limit = 1
export default handler
