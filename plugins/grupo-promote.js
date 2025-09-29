const handler = async (m, {conn, usedPrefix, text}) => {
    if (isNaN(text) && !text.match(/@/g)) {
    } else if (isNaN(text)) {
        var number = text.split`@`[1];
    } else if (!isNaN(text)) {
        var number = text;
    }

    if (!text && !m.quoted) return conn.reply(m.chat, `🎭 *يَا سَاحِرْ، مَنْ تُرِيدُ أَنْ تَرْفَعَ؟*
    
🪄 ضَعْ عَلَامَةً عَلَى الشَّخْصِ أَوْ رُدَّ عَلَى رِسَالَتِهِ
✨ لَسْتُ عَرَّافًا لأَعْرِفَ مَنْ تَقْصِدُ!`, m);
    
    if (number.length > 13 || (number.length < 11 && number.length > 0)) return conn.reply(m.chat, `🌀 *رَقَمٌ غَيْرُ صَحِيحٍ!*
    
📱 الرَّقَمُ الَّذِي أَدْخَلْتَهُ خَاطِئٌ
🎯 أَدْخِلْ رَقَمًا صَحِيحًا أَوْ ضَعْ عَلَامَةً @مَنْشِن`, m);
    
    try {
        if (text) {
            var user = number + '@s.whatsapp.net';
        } else if (m.quoted.sender) {
            var user = m.quoted.sender;
        } else if (m.mentionedJid) {
            var user = number + '@s.whatsapp.net';
        }
    } catch (e) {
    } finally {
        await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
        
        const username = user.split('@')[0];
        const teks = `🌠 *تَرْقِيَةٌ نَاجِحَةٌ!*
        
╔════════════════╗
   🎖️  تـمّ الـرفـع  🎖️
╚════════════════╝

👤 الـمـسـتـخـدم: @${username}
⚡ الـصـفـة: مـشـرف جـديـد
🎯 الـحـالة: تـمّ الـتّـنـفـيـذ

✨ تـمّ تـرْقِـيَـة الـمـسـتـخـدم إلـى مـشـرف بـنـجـاح!`;
        
        await conn.reply(m.chat, teks, m, {
            mentions: [user],
            contextInfo: {
                externalAdReply: {
                    title: "🎊 تـرقـيـة مـشـرف",
                    body: `@${username} - تـمّ الـرفـع`,
                    mediaType: 1,
                    thumbnail: await conn.profilePictureUrl(user, 'image').catch(_ => 'https://telegra.ph/file/39fb047cdf23c790e0146.jpg'),
                    sourceUrl: null
                }
            }
        });
        
        // رد فعل بالإيموجي
        await m.react("🎖️");
        await m.react("⚡");
        await m.react("✨");
    }
};

// ✨ إعدادات الأمر المزخرفة
handler.help = ['*رقم الجوال*', '*@المستخدم*', '*الرد على رسالة*'].map((v) => 'ترقية ' + v);
handler.tags = ['group', 'المجموعة', '🛡️'];
handler.command = /^(promote|daradmin|darpoder|ترقيه|رفع|ترقية)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.fail = null;
handler.register = true;

export default handler;
