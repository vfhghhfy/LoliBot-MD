import { db } from '../lib/postgres.js'

let handler = async (m, { args }) => {
    const rango = (args[0] || '').trim()
    
    if (!rango) {
        return m.reply(`🎯 *ضَبْطُ وَقْتِ الْمَحْتَوَى الْبَالِغِ*
        
⏰ *الاسْتِخْدَامُ:*
!ضبط_الوقت [الوقت]

🕒 *صِيغَةُ الْوَقْتِ:*
ساعة:دقيقة - ساعة:دقيقة

✨ *أَمْثِلَةٌ:*
!ضبط_الوقت 23:00-06:00
!ضبط_الوقت 22:30-05:45

🌙 *مُلاحَظَةٌ:*
هَذَا الْوَقْتُ لِلسَّمَاحِ بِالْمَحْتَوَى الْبَالِغِ فَقَطْ`);
    }
    
    if (!/^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/.test(rango)) {
        return m.reply(`❌ *صِيغَةُ الْوَقْتِ خَاطِئَةٌ*
        
🕒 *يَجِبُ أَنْ تَكُونَ الصِّيغَةُ:*
ساعة:دقيقة - ساعة:دقيقة

📝 *مِثَالٌ صَحِيحٌ:*
23:00-06:00
22:30-05:45

⚠️ *تَأَكَّدْ مِنْ:*
• استِخْدَام نَقْطَتَيْنِ (:) بَيْنَ السَّاعَةِ وَالدَّقِيقَةِ
• استِخْدَام شَرْطَةٍ (-) بَيْنَ وَقْتَيِ الْبَدْءِ وَالنِّهَايَةِ`);
    }

    try {
        await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [m.chat])
        await db.query(`UPDATE group_settings SET nsfw_horario = $1 WHERE group_id = $2`, [rango, m.chat])
        
        const [startTime, endTime] = rango.split('-');
        const successMessage = `🎉 *تَمَّ ضَبْطُ وَقْتِ الْمَحْتَوَى الْبَالِغِ*
        
╔════════════════════╗
   ⏰ وَقْتٌ جَدِيدٌ
╚════════════════════╝

🕒 *الْوَقْتُ الْمَضْبُوطُ:*
${startTime} - ${endTime}

🌙 *مُلاحَظَاتٌ:*
• سَيُسْمَحُ بِالْمَحْتَوَى الْبَالِغِ فِي هَذَا الْوَقْتِ فَقَطْ
• خَارِجَ هَذَا الْوَقْتِ سَيُحْظَرُ الْمَحْتَوَى الْبَالِغُ
• الْوَقْتُ بِتَوْقِيتِ الْجِهَازِ`;

        await m.reply(successMessage);
        
        // ردود فعل بالإيموجي
        await m.react("⏰");
        await m.react("🌙");
        await m.react("✅");
        
    } catch (error) {
        console.error(error);
        await m.reply(`❌ *حَدَثَ خَطَأٌ فِي ضَبْطِ الْوَقْتِ*
        
⚠️ يُرْجَى الْمُحَاوَلَةُ مَرَّةً أُخْرَى أَوِ التَّأَكُّدُ مِنْ صِلَةِ قَاعِدَةِ الْبَيَانَاتِ`);
        await m.react("❌");
    }
}

// 🎪 الأوامر العربية المزخرفة
handler.help = ['sethorario 23:00-06:00', 'ضبط_الوقت 23:00-06:00', 'وقت_البالغين 23:00-06:00'];
handler.tags = ['admin', 'المشرفون', '⏰'];
handler.command = /^(sethorario|ضبط_الوقت|وقت_البالغين)$/i;
handler.admin = true;
handler.group = true;
handler.register = true;

export default handler
