import fg from 'api-dylux';

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    
    // 🔍 التحقق من إدخال النص
    if (!text) {
        return m.reply(`
╔═══════════════════════
║ ❌ *خطأ في الإدخال*
╠═══════════════════════
║ 📝 يرجى إدخال اسم مستخدم تيك توك
║ 
║ 💡 مثال:
║ ${usedPrefix + command} emilia_mernes
╚═══════════════════════
        `.trim());
    }
    
    m.react("⌛");
    
    try {
        // 🌐 المحاولة الأولى: API الخارجي
        const apiUrl = `https://api.example.com/tools/tiktokstalk?q=${encodeURIComponent(args[0])}`;
        const apiResponse = await fetch(apiUrl);
        const delius = await apiResponse.json();
        
        if (!delius?.result?.users) throw new Error('API غير متوفر');
        
        const profile = delius.result.users;
        const stats = delius.result.stats;
        
        const txt = `
╔═══════════════════════
║ 📱 *معلومات حساب تيك توك*
╠═══════════════════════
║ 👤 *الاسم:* ${profile.nickname}
║ 🆔 *المستخدم:* ${profile.username}
║ ✅ *مؤكد:* ${profile.verified ? 'نعم' : 'لا'}
║ 
║ 📊 *الإحصائيات:*
║ 👥 *المتابعون:* ${stats.followerCount?.toLocaleString() || '0'}
║ 🔄 *يتبع:* ${stats.followingCount?.toLocaleString() || '0'}
║ ❤️ *الإعجابات:* ${stats.heartCount?.toLocaleString() || '0'}
║ 🎬 *الفيديوهات:* ${stats.videoCount?.toLocaleString() || '0'}
║ 
║ 📝 *البايو:* 
║ ${profile.signature || 'لا يوجد وصف'}
║ 
║ 🔗 *الرابط:* 
║ ${profile.url || `https://tiktok.com/@${profile.username}`}
╚═══════════════════════
        `.trim();

        await conn.sendFile(m.chat, profile.avatarLarger, 'tt.png', txt, m);
        m.react("✅");
        
    } catch (e2) {
        // 🔄 المحاولة الثانية: api-dylux
        try {
            let res = await fg.ttStalk(args[0]);
            
            const txt = `
╔═══════════════════════
║ 📱 *معلومات حساب تيك توك*
╠═══════════════════════
║ 👤 *الاسم:* ${res.name}
║ 🆔 *المستخدم:* ${res.username}
║ 
║ 📊 *الإحصائيات:*
║ 👥 *المتابعون:* ${res.followers}
║ 🔄 *يتبع:* ${res.following}
║ 
║ 📝 *الوصف:* 
║ ${res.desc || 'لا يوجد وصف'}
║ 
║ 🔗 *الرابط:* 
║ https://tiktok.com/${res.username}
╚═══════════════════════
            `.trim();
            
            await conn.sendFile(m.chat, res.profile, 'tt.png', txt, m);
            m.react("✅");
            
        } catch (e) {
            // ❌ معالجة الأخطاء
            m.react("❌");
            console.error('TikTok Stalk Error:', e);
            
            await m.reply(`
╔═══════════════════════
║ 🚨 *خطأ في النظام*
╠═══════════════════════
║ 🔍 المستخدم: *${args[0]}*
║ ⚠️ لم أتمكن من العثور على الحساب
║ 
║ 📌 الأسباب المحتملة:
║ • الحساب غير موجود
║ • مشكلة في الشبكة
║ • API غير متوفر
║ 
║ 💡 حاول مرة أخرى لاحقاً
╚═══════════════════════
            `.trim());
        }
    }
};

// 🏷️ معلومات المساعدة
handler.help = ['tiktokstalk <المستخدم>'];
handler.tags = ['📱downloader', '🔍search', '🎵social'];
handler.command = /^(tiktokstalk|حساب-تيك)$/i;
handler.register = true;
handler.limit = 1;
handler.premium = false;

export default handler;
