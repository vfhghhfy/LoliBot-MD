//import {googleIt} from '@bochilteam/scraper';
import axios from 'axios';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, command, args, usedPrefix }) => {
    // التحقق من وجود نص البحث
    if (!text) return m.reply(`⚠️ ما الذي تبحث عنه؟ 🤔 اكتب ما تريد البحث عنه\n• مثال: ${usedPrefix + command} لولي`)
    m.react("⌛") 
    
    try {
        // المحاولة الأولى: استخدام API الأول
        const res = await fetch(`${info.apis}/search/googlesearch?query=${text}`);
        const data = await res.json();
        
        if (data.status && data.data && data.data.length > 0) {
            let teks = `\`🔍 نتائج البحث عن:\` ${text}\n\n`;
            
            // بناء نص النتائج
            for (let result of data.data) {
                teks += `*${result.title}*\n_${result.url}_\n_${result.description}_\n\n─────────────────\n\n`;
            }
            
            // التقاط لقطة شاشة للنتائج
            const ss = `https://image.thum.io/get/fullpage/https://google.com/search?q=${encodeURIComponent(text)}`;
            conn.sendFile(m.chat, ss, 'result.png', teks, m);
            m.react("✅")                 
        }
    } catch {
        try {
            // المحاولة الثانية: استخدام API بديل
            const res = await fetch(`https://api.alyachan.dev/api/google?q=${text}&apikey=Gata-Dios`);
            const data = await res.json();

            if (data.status && data.data && data.data.length > 0) {
                let teks = `🔍 *نتائج البحث عن:* ${text}\n\n`;
                
                // بناء نص النتائج مع تنسيق مختلف
                for (let result of data.data) {
                    teks += `📌 *${result.title}*\n🔗 _${result.formattedUrl || result.url}_\n📖 _${result.snippet || result.description}_\n\n─────────────────\n\n`;
                }
                
                // إرسال لقطة الشاشة مع النتائج
                const ss = `https://image.thum.io/get/fullpage/https://google.com/search?q=${encodeURIComponent(text)}`;
                conn.sendFile(m.chat, ss, 'result.png', teks, m);
            }
        } catch (e) {
            // إعادة تعيين الحد وإظهار الخطأ
            handler.limit = 0;
            console.log(e);
            m.react("❌")  
        }
    }
}

// تعريف الأوامر والخصائص
handler.help = ['google', 'googlef'].map(v => v + ' <بحث>')
handler.tags = ['محركات البحث']
handler.command = /^googlef?$/i
handler.register = true
handler.limit = 1; // تحديد استخدام الأمر مرة واحدة لكل مستخدم

export default handler
