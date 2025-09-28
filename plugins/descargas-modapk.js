import axios from 'axios';

// 🎨 الألوان والزخارف للنصوص
const styles = {
    bold: (text) => `*${text}*`,
    italic: (text) => `_${text}_`,
    mono: (text) => `\`\`\`${text}\`\`\``,
    quote: (text) => `> ${text}`,
    sparkle: (text) => `✨ ${text} ✨`,
    rocket: (text) => `🚀 ${text} 🚀`,
    warning: (text) => `⚠️ ${text} ⚠️`,
    success: (text) => `✅ ${text} ✅`,
    error: (text) => `❌ ${text} ❌`
};

// 🎭 تصميم البوكسات والحدود
const boxes = {
    header: (text) => `╔═══✦〖 ${text} 〗✦═══╗`,
    body: (text) => `║ ${text}`,
    footer: `╚═══════════════╝`,
    divider: `├─────────────────┤`,
    doubleLine: `╠═══════════════╣`,
    singleLine: `╟───────────────╢`
};

const userMessages = new Map();
const userRequests = {};

const handler = async (m, { conn, usedPrefix, command, text }) => {
    const apkpureApi = 'https://apkpure.com/api/v2/search?q=';
    const apkpureDownloadApi = 'https://apkpure.com/api/v2/download?id=';
    
    // 🎯 التحقق من وجود النص
    if (!text) {
        const errorMessage = `
${boxes.header('خطـأ في الإدخـال')}
${boxes.body('⚠️ يرجى كتابة اسم التطبيق الذي تريد تحميله')}
${boxes.body('')}
${boxes.body('📝 مثال للاستخدام:')}
${boxes.body(styles.mono(`${usedPrefix + command} واتساب`))}
${boxes.footer}`;
        
        return m.reply(styles.bold(errorMessage));
    }
    
    // 🚫 التحقق من الطلبات المتزامنة
    if (userRequests[m.sender]) {
        const busyMessage = `
${boxes.header('طلب تحت المعالجة')}
${boxes.body(`🕒 يا ${styles.bold(`@${m.sender.split('@')[0]}`)}، لديك طلب قيد التنفيذ`)}
${boxes.body('')}
${boxes.body('📥 انتظر حتى انتهاء التحميل الحالي')}
${boxes.body('قبل تقديم طلب جديد...')}
${boxes.footer}`;
        
        return await conn.reply(m.chat, styles.bold(busyMessage), userMessages.get(m.sender) || m);
    }
    
    userRequests[m.sender] = true;
    m.react("🎯");

    try {
        // 🔄 محاولات التحميل من واجهات متعددة
        const downloadAttempts = [
            async () => {
                const res = await fetch(`https://api.dorratz.com/v2/apk-dl?text=${text}`);
                const data = await res.json();
                if (!data.name) throw new Error('لا توجد بيانات من واجهة dorratz');
                return { 
                    name: data.name, 
                    package: data.package, 
                    lastUpdate: data.lastUpdate, 
                    size: data.size, 
                    icon: data.icon, 
                    dllink: data.dllink 
                };
            },
            async () => {
                const res = await fetch(`${info.apis}/download/apk?query=${text}`);
                const data = await res.json();
                const apkData = data.data;
                return { 
                    name: apkData.name, 
                    developer: apkData.developer, 
                    publish: apkData.publish, 
                    size: apkData.size, 
                    icon: apkData.image, 
                    dllink: apkData.download 
                };
            }
        ];

        let apkData = null;
        
        // 🔁 تجربة جميع الواجهات
        for (const [index, attempt] of downloadAttempts.entries()) {
            try {
                m.react(["🔄", "⚡", "🔍"][index]);
                apkData = await attempt();
                if (apkData) break;
            } catch (err) {
                console.error(`🔄 خطأ في المحاولة ${index + 1}: ${err.message}`);
                continue;
            }
        }

        if (!apkData) throw new Error('❌ تعذر العثور على التطبيق');

        // 🎨 تصميم رسالة المعلومات
        const response = `
${boxes.header('معلومات التطبيق 📱')}
${boxes.body(`🎯 ${styles.bold('الاسم:')} ${apkData.name}`)}
${boxes.divider}
${apkData.developer ? 
    boxes.body(`👨‍💻 ${styles.bold('المطور:')} ${apkData.developer}`) : 
    boxes.body(`📦 ${styles.bold('الحزمة:')} ${apkData.package}`)}
${boxes.body(`📅 ${styles.bold('آخر تحديث:')} ${apkData.developer ? apkData.publish : apkData.lastUpdate}`)}
${boxes.body(`💾 ${styles.bold('الحجم:')} ${styles.sparkle(apkData.size)}`)}
${boxes.doubleLine}
${boxes.body(styles.quote('⏳ جاري تجهيز التطبيق...'))}
${boxes.footer}`;

        // 📤 إرسال المعلومات والصورة
        const responseMessage = await conn.sendFile(m.chat, apkData.icon, 'apk.jpg', styles.bold(response), m);
        userMessages.set(m.sender, responseMessage);

        // ⚠️ فحص حجم التطبيق
        const apkSize = apkData.size.toLowerCase();
        if (apkSize.includes('gb') || (apkSize.includes('mb') && parseFloat(apkSize) > 999)) {
            const sizeWarning = `
${boxes.header('تحذير الحجم ⚠️')}
${boxes.body('📦 التطبيق كبير جداً وقد يستغرق')}
${boxes.body('وقتاً طويلاً في التحميل')}
${boxes.body('')}
${boxes.body('💡 ننصح بالاتصال بشبكة Wi-Fi')}
${boxes.footer}`;
            
            await m.reply(styles.bold(sizeWarning));
        }

        // 🎉 إرسال التطبيق
        m.react("📤");
        await conn.sendMessage(m.chat, { 
            document: { url: apkData.dllink }, 
            mimetype: 'application/vnd.android.package-archive', 
            fileName: `${apkData.name}.apk`, 
            caption: null 
        }, { quoted: m });
        
        m.react("🎉");

    } catch (e) {
        // 🚨 معالجة الأخطاء
        const errorMessage = `
${boxes.header('خطـأ في التحميـل 🚨')}
${boxes.body('❌ تعذر العثور على التطبيق')}
${boxes.body('')}
${boxes.body('💡 حاول استخدام اسم آخر')}
${boxes.body('أو تحقق من تهجئة الاسم')}
${boxes.footer}`;
        
        await m.reply(styles.bold(errorMessage));
        m.react('🚨');
        console.log('🔄 الخطأ:', e);
        handler.limit = false;
    } finally {
        delete userRequests[m.sender];
    }
};

// 🏷️ معلومات الأوامر
handler.help = ['apk', 'apkmod'].map(cmd => styles.sparkle(cmd));
handler.tags = ['downloader'].map(tag => styles.italic(tag));
handler.command = /^(apkmod|apk|modapk|dapk2|aptoide|تطبيق)$/i;
handler.register = true;
handler.limit = 2;

export default handler;

// 🔍 وظائف مساعدة
async function searchApk(text) {
    const response = await axios.get(`${apkpureApi}${encodeURIComponent(text)}`);
    const data = response.data;
    return data.results;
}

async function downloadApk(id) {
    const response = await axios.get(`${apkpureDownloadApi}${id}`);
    const data = response.data;
    return data;
}

// 🌟 تصدير الأنماط للاستخدام الخارجي
export { styles, boxes };
