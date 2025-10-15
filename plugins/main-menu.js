const handler = async (m, { conn }) => {
    let menu = `
✦ ──────────── ✦
      🏮 لينو 🏮
✦ ──────────── ✦

👑 المطور: @967778668253

𓂀 𓆩 ${new Date().toLocaleTimeString('ar-YE')} 𓆪
𓂀 𓆩 ${new Date().toLocaleDateString('ar-YE')} 𓆪
𓂀 𓆩 ${conn.getName(m.sender)} 𓆪
𓂀 𓆩 @${m.sender.split('@')[0]} 𓆪

✦ ──────────── ✦
     🎴 الَأقَسَام 🎴
✦ ──────────── ✦

☄️ 𓂃𓂀 الَرَئِيسِيَة
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 

📥 𓂃𓂀 التَحَمِيلَات
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 

🎮 𓂃𓂀 الأَلْعَاب
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 

👥 𓂃𓂀 المَجْمُوعَات
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 

🛠️ 𓂃𓂀 الأَدَوَات
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 

🤖 𓂃𓂀 الذَكَاء
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 

🎵 𓂃𓂀 الصَوْتِيَات
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 

📸 𓂃𓂀 الصُوَر
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 
• ✦ 

✦ ──────────── ✦
   🏮 عمك دزاري 🏮
✦ ──────────── ✦
`.trim()

    // إرسال الصورة والقائمة معاً
    await conn.sendMessage(m.chat, {
        image: { 
            url: "https://files.catbox.moe/nz2421.jpg" 
        },
        caption: menu,
        mentions: [m.sender, '967778668253@s.whatsapp.net']
    })
    
    // إضافة تفاعل إيموجي للرسالة
    await conn.sendMessage(m.chat, { 
        react: { 
            text: "📜", 
            key: m.key 
        } 
    })
}

handler.help = ['menu', 'help', 'مساعدة']
handler.tags = ['main']
handler.command = /^(menu|help|اوامر|القائمة|الاوامر)$/i

export default handler
