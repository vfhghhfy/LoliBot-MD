const handler = async (m, {conn, text, usedPrefix, command}) => {
    const teks = text ? text : m.quoted && m.quoted.text ? m.quoted.text : '';
    
    if (!teks) return m.reply(`*⚠️ ما الذي تبحث عنه؟ أدخل اسم الأغنية للبحث عن الكلمات، مثال:* ${usedPrefix + command} أوزونا تي فاس`);
    
    try {
        // المحاولة الأولى: استخدام API الأول
        const res = await fetch(`https://api.fgmods.xyz/api/other/lyrics?text=${text}&apikey=${info.fgmods.key}`)
        const data = await res.json();
        
        const textoLetra = `*🎤 العنوان:* ${data.result.title}\n*👤 الفنان:* ${data.result.artist}\n*🎶 الرابط:* ${data.result.url || 'غير متوفر'}\n\n*📃🎵 الكلمات:*\n${data.result.lyrics}`;
        const img = data.result.image;
        
        conn.sendFile(m.chat, img, 'error.jpg', textoLetra, m);
        
    } catch {
        try {
            // المحاولة الثانية: استخدام API بديل
            const res = await fetch(`${info.apis}/search/letra?query=${text}`);
            const data = await res.json();
            
            if (data.status !== "200" || !data.data) {
                return conn.reply(m.chat, 'لم يتم العثور على كلمات الأغنية المحددة.', m);
            }

            const textoLetra = `*🎤 العنوان:* ${data.data.title || 'غير معروف'}\n*👤 الفنان:* ${data.data.artist || 'غير معروف'}\n*🔗 رابط الفنان:* ${data.data.artistUrl || 'غير متوفر'}\n*🎶 الرابط:* ${data.data.url || 'غير متوفر'}\n\n*📃🎵 الكلمات:*\n${data.data.lyrics || 'الكلمات غير متوفرة'}`;
            const img = data.data.image;
            
            conn.sendFile(m.chat, img, 'error.jpg', textoLetra, m);
            
        } catch (e) {
            m.reply(`\`\`\`⚠️ حدث خطأ ⚠️\`\`\`\n\n> *أبلغ عن هذا الخطأ للمطور باستخدام الأمر:* #report\n\n>>> ${e} <<<<`);
            console.log(e);
        }
    }
}

// تعريف الأوامر والخصائص
handler.help = ['lirik', 'letra'].map((v) => v + ' <اسم الأغنية>');
handler.tags = ['محركات البحث'];
handler.command = /^(lirik|lyrics|lyric|letra)$/i;
handler.register = true;

export default handler;
