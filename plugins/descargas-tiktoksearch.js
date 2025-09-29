// ==================================================
// 🎵 TIKTOK SEARCH BOT - إعدادات متقدمة 🎵
// ==================================================

import axios from 'axios';

// 🎭 كائن تتبع الطلبات - منع التكرار
const userRequests = {};

// 🌟 الهاندلر الرئيسي
const handler = async (m, { conn, usedPrefix, command, text }) => {
    
    // 🔍 التحقق من الإدخال
    if (!text) {
        throw `
╔═══════════════════════
║ 🚫 *خطأ في الإدخال*
╠═══════════════════════
║ ⚠️ يرجى إدخال اسم الفيديو
║ 
║ 📌 مثال:
║ ${usedPrefix + command} emilia_mernes
╚═══════════════════════
        `.trim();
    }
    
    // ⏳ التحقق من الطلبات النشطة
    if (userRequests[m.sender]) {
        return m.reply(`
╔═══════════════════════
║ ⏰ *طلب قيد المعالجة*
╠═══════════════════════
║ 📥 جاري معالجة طلبك السابق
║ 🕒 يرجى الانتظار...
╚═══════════════════════
        `.trim());
    }
    
    // 🎯 بدء المعالجة
    userRequests[m.sender] = true;
    m.react("🔍");
    
    // 📊 إشعار البدء
    await m.reply(`
╔═══════════════════════
║ 🔎 *بدء البحث*
╠═══════════════════════
║ 📝 الكلمة: *${text}*
║ ⏳ جاري البحث...
╚═══════════════════════
    `.trim());

    try {
        // 🌐 جلب البيانات من API
        let { data: response } = await axios.get(`${info.apis}/search/tiktoksearch?query=${encodeURIComponent(text)}`);
        
        // ❌ التحقق من النتائج
        if (!response?.meta?.length) {
            return m.reply(`
╔═══════════════════════
║ ❌ *لا توجد نتائج*
╠═══════════════════════
║ 🔍 البحث: *${text}*
║ 📭 لم يتم العثور على فيديوهات
║ 💡 حاول بكلمات أخرى
╚═══════════════════════
            `.trim());
        }
        
        // 🎲 معالجة النتائج
        let searchResults = response.meta;
        shuffleArray(searchResults);
        let selectedResults = searchResults.slice(0, 5);
        
        // 🎬 تحضير الوسائط
        const medias = selectedResults.map((result, index) => ({
            type: "video", 
            data: { 
                url: result.hd,
                caption: `🎵 الفيديو ${index + 1} - ${text}`
            }
        }));
        
        // 📤 إرسال النتائج
        await conn.sendAlbumMessage(m.chat, medias, `
╔═══════════════════════
║ ✅ *تم العثور على النتائج*
╠═══════════════════════
║ 🔍 البحث: *${text}*
║ 📊 العدد: ${selectedResults.length} فيديو
║ 🎲 النتائج عشوائية
╚═══════════════════════
        `.trim(), m);
        
        m.react("✅");
        
    } catch (error) {
        // 🚨 معالجة الأخطاء
        m.react("❌");
        console.error('🎵 TikTok Search Error:', error);
        
        await m.reply(`
╔═══════════════════════
║ 🚨 *خطأ في النظام*
╠═══════════════════════
║ 🔍 البحث: *${text}*
║ ⚠️ حدث خطأ غير متوقع
║ 📞 يرجى المحاولة لاحقاً
╚═══════════════════════
        `.trim());
        
    } finally {
        // 🧹 تنظيف الموارد
        delete userRequests[m.sender];
    }
};

// 🎪 معلومات المساعدة
handler.help = ['tiktoksearch <نص>', 'ttsearch <نص>'];
handler.tags = ['🎵downloader', '🎭media', '📱social'];
handler.command = ['tiktoksearch', 'ttsearch', 'بحث-تيكتوك', 'مممم'];
handler.register = true;
handler.limit = 4;
handler.premium = false;

export default handler;

// 🎲 دالة الخلط العشوائي
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ==================================================
// 🎨 تم التزويق بواسطة محترف
// 📅 ${new Date().toLocaleDateString('ar-EG')}
// ==================================================
