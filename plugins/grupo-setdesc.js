let handler = async (m, { conn, args }) => {
    if (!args[0]) return m.reply(`🎯 *يُرجَى إدْخَالُ الْوَصْفِ الْجَدِيدِ*
    
📝 *الاسْتِخْدَامُ:*
!ضبط_الوصف [الوصف الجديد]

✨ *مِثَالٌ:*
!ضبط_الوصف مَجْمُوعَةٌ لِلتَّعَاوُنِ وَالتَّوَاصُلِ الْإِيجَابِيِّ`);

    const newDescription = args.join(" ");
    
    if (newDescription.length < 5) return m.reply(`❌ *الوَصْفُ قَصِيرٌ جِدًّا*
    
📏 يَجِبُ أَنْ يَكُونَ الْوَصْفُ 5 أَحْرُفٍ عَلَى الْأَقَلِّ`);

    if (newDescription.length > 500) return m.reply(`❌ *الوَصْفُ طَوِيلٌ جِدًّا*
    
📏 الْحَدُّ الْأَقْصَى لِلوَصْفِ هُوَ 500 حَرْفٍ`);

    try {
        const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://telegra.ph/file/2a1d71ab744b55b28f1ae.jpg');
        
        await conn.groupUpdateDescription(m.chat, newDescription);
        
        const successMessage = `🎉 *تَمَّ تَغْيِيرُ وَصْفِ الْمَجْمُوعَةِ*
        
╔════════════════════╗
   📝 وَصْفٌ جَدِيدٌ
╚════════════════════╝

📋 *الْوَصْفُ الْجَدِيدُ:*
${newDescription}

✨ تـمّ تـعـديل وَصْفِ الْمَجْمُوعَةِ بِنَجَاحٍ`;

        await conn.reply(m.chat, successMessage, m, {
            contextInfo: {
                externalAdReply: {
                    title: "📝 تـعـديل وَصْفِ الـمـجـمـوعـة",
                    body: "✨ تـمّ الـتـغـيـيـر بـنـجـاح",
                    mediaType: 1,
                    thumbnail: pp,
                    sourceUrl: null
                }
            }
        });
        
        // ردود فعل متعددة بالإيموجي
        await m.react("📝");
        await m.react("✨");
        await m.react("✅");
        
    } catch (error) {
        console.error(error);
        await m.reply(`❌ *حَدَثَ خَطَأٌ فِي تَغْيِيرِ الْوَصْفِ*
        
⚠️ يُرْجَى التَّأَكُّدُ مِنْ أَنَّ الْبُوتَ مُشْرِفٌ وَيُمْكِنُهُ تَغْيِيرُ وَصْفِ الْمَجْمُوعَةِ`);
        await m.react("❌");
    }
}

// 🎪 الأوامر العربية المزخرفة
handler.help = ['setdesc', 'setdesk', 'newdesc', 'ضبط_الوصف', 'تغيير_الوصف', 'وصف_جديد'];
handler.tags = ['group', 'المجموعة', '📝'];
handler.command = /^(setdesk|setdesc|newdesc|descripción|descripcion|ضبط_الوصف|تغيير_الوصف|وصف_جديد)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.register = true;

export default handler;
