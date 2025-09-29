const handler = async (m, {conn}) => {
    const revoke = await conn.groupRevokeInvite(m.chat);
    
    const teks = `🌀 *تَجْدِيدُ الرَّابِطِ* 🌀

╔════════════════════╗
   🔄 تـمّ تـجـدِيـد الـرَّابِط
╚════════════════════╝

✨ *تـمّ تـجـدِيـد رابِط الـمـجـمـوعـة بــنـجـاح!*

🔗 *الـرَّابِط الـجـدِيـد:*
${'https://chat.whatsapp.com/' + revoke}

📝 *مـلاحـظـة:*
• الـرَّابِط الـقـدِيـم لـن يـعـمـل بــعـدَ الآن
• يـجـب مُـشـارَكـة الـرَّابِط الـجـدِيـد مـع الأعـضـاء
• الـرَّابِط يـعـمـل لـجـمـيـع الأعـضـاء الـحـالـيـيـن`;

    await conn.reply(m.chat, teks, m, {
        contextInfo: {
            externalAdReply: {
                title: "🔄 تـجـدِيـد رابِط الـمـجـمـوعـة",
                body: "✨ تـمّ تـجـدِيـد الـرَّابِط بــنـجـاح",
                mediaType: 1,
                thumbnail: await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://telegra.ph/file/39fb047cdf23c790e0146.jpg'),
                sourceUrl: null
            }
        }
    });
    
    // ردود فعل بالإيموجي
    await m.react("🔄");
    await m.react("✨");
    await m.react("🔗");
};

// 🎪 الإعدادات المزخرفة
handler.help = ['resetlink', 'revoke', 'تجديد_الرابط', 'رابط_جديد'];
handler.tags = ['group', 'المجموعة', '🔗'];
handler.command = ['resetlink', 'revoke', 'تجديد_الرابط', 'رابط_جديد', 'تغيير_الرابط'];
handler.botAdmin = true;
handler.admin = true;
handler.group = true;
handler.register = true;

export default handler;
