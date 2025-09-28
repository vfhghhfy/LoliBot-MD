import { db } from "../lib/postgres.js";

const handler = async (m, { conn, command, isOwner }) => {
    let txt = "";

    // 🔒 قائمة المستخدمين المحظورين في البوت
    if (command === "listablock" || command === "قائمة_الحظر") {
        try {
            const blocklist = await conn.fetchBlocklist() || [];
            txt += `🔒 *قائمة المستخدمين المحظورين*\n\n`;
            txt += `📊 *الإجمالي:* ${blocklist.length}\n\n`;
            txt += `╭───「 🔗 ${info.vs || 'البوت'} 」───┈┈\n`;
            
            if (blocklist.length > 0) {
                blocklist.forEach((jid, index) => {
                    txt += `│❌ @${jid.split("@")[0]}\n`;
                });
            } else {
                txt += `│✅ لا يوجد مستخدمين محظورين حالياً\n`;
            }
            
            txt += `╰─────────────────\n\n`;
            txt += `📞 *يرجى عدم الاتصال لتجنب الحظر، شكراً لتفهمكم.*`;
            
        } catch (e) {
            console.error('خطأ في قائمة الحظر:', e);
            txt += "❌ حدث خطأ في جلب قائمة المحظورين.\n";
        }
        return conn.reply(m.chat, txt, m, { mentions: await conn.parseMention(txt) });
    }

    // 🚫 قائمة المجموعات المحظورة
    if (command === "chatsbaneados" || command === "المجموعات_المحظورة") {
        try {
            const res = await db.query("SELECT group_id, banned_at FROM group_settings WHERE banned = true");
            txt += `╭───「 🚫 المجموعات المحظورة 」───┈┈\n`;
            txt += `│ 📊 الإجمالي: ${res.rowCount}\n`;
            txt += `│──────────────────\n`;
            
            if (res.rows.length > 0) {
                res.rows.forEach((chat, index) => {
                    const banDate = chat.banned_at ? new Date(chat.banned_at).toLocaleDateString('ar-EG') : 'غير معروف';
                    txt += `│❌ ${chat.group_id}\n`;
                    txt += `│   📅 ${banDate}\n`;
                });
            } else {
                txt += `│✅ لا توجد مجموعات محظورة حالياً\n`;
            }
            
            txt += `╰─────────────────\n`;
            
        } catch (e) {
            console.error('خطأ في قائمة المجموعات المحظورة:', e);
            txt += "❌ حدث خطأ في جلب قائمة المجموعات المحظورة.\n";
        }
        return conn.reply(m.chat, txt, m);
    }

    // 👥 قائمة المستخدمين المحظورين من النظام
    if (command === "listaban" || command === "المستخدمين_المحظورين") {
        try {
            const res = await db.query("SELECT id, razon_ban, avisos_ban, banned_at FROM usuarios WHERE banned = true");
            txt += `╭───「 ⚠️ المستخدمين المحظورين 」───┈┈\n`;
            txt += `│ 📊 الإجمالي: ${res.rowCount}\n`;
            txt += `│──────────────────\n`;
            
            if (res.rows.length > 0) {
                res.rows.forEach((user, index) => {
                    const banDate = user.banned_at ? new Date(user.banned_at).toLocaleDateString('ar-EG') : 'غير معروف';
                    txt += `│${index + 1}. @${user.id.split("@")[0]}\n`;
                    
                    if (user.razon_ban) {
                        txt += `│   📝 السبب: ${user.razon_ban}\n`;
                    }
                    
                    if (user.avisos_ban) {
                        txt += `│   ⚠️  الإنذارات: ${user.avisos_ban}/3\n`;
                    }
                    
                    txt += `│   📅 ${banDate}\n`;
                });
            } else {
                txt += `│✅ لا يوجد مستخدمين محظورين حالياً\n`;
            }
            
            txt += `╰─────────────────\n`;
            
        } catch (e) {
            console.error('خطأ في قائمة المستخدمين المحظورين:', e);
            txt += "❌ حدث خطأ في جلب قائمة المستخدمين المحظورين.\n";
        }
        return conn.reply(m.chat, txt, m, { mentions: await conn.parseMention(txt) });
    }

    // 💞 قائمة العلاقات (الزوجية)
    if (command === "listaparejas" || command === "قائمة_العلاقات") {
        try {
            const res = await db.query("SELECT id, marry, married_at FROM usuarios WHERE marry IS NOT NULL AND marry != 'null'");
            txt += `╭───「 💞 قائمة العلاقات 」───┈┈\n`;
            txt += `│ 📊 الإجمالي: ${res.rowCount}\n`;
            txt += `│──────────────────\n`;
            
            if (res.rows.length > 0) {
                res.rows.forEach((user, index) => {
                    const marryDate = user.married_at ? new Date(user.married_at).toLocaleDateString('ar-EG') : 'غير معروف';
                    txt += `│${index + 1}. @${user.id.split("@")[0]}\n`;
                    txt += `│   💑 @${user.marry.split("@")[0]}\n`;
                    txt += `│   📅 ${marryDate}\n`;
                });
            } else {
                txt += `│✅ لا توجد علاقات مسجلة حالياً\n`;
            }
            
            txt += `╰─────────────────\n`;
            
        } catch (e) {
            console.error('خطأ في قائمة العلاقات:', e);
            txt += "❌ حدث خطأ في جلب قائمة العلاقات.\n";
        }
        return conn.reply(m.chat, txt, m, { mentions: await conn.parseMention(txt) });
    }

    // ⚠️ قائمة المستخدمين المحذرين
    if (command === "listaadv" || command === "قائمة_الإنذارات") {
        try {
            const res = await db.query("SELECT id, warn, last_warn FROM usuarios WHERE warn > 0 ORDER BY warn DESC");
            txt += `╭───「 ⚠️ المستخدمين المحذرين 」───┈┈\n`;
            txt += `│ 📊 الإجمالي: ${res.rowCount}\n`;
            txt += `│──────────────────\n`;
            
            if (res.rows.length > 0) {
                res.rows.forEach((user, index) => {
                    const lastWarn = user.last_warn ? new Date(user.last_warn).toLocaleDateString('ar-EG') : 'غير معروف';
                    const warnLevel = user.warn;
                    let warnIcon = '⚠️';
                    
                    if (warnLevel >= 3) warnIcon = '🔴';
                    else if (warnLevel >= 2) warnIcon = '🟡';
                    
                    txt += `│${index + 1}. @${user.id.split("@")[0]}\n`;
                    txt += `│   ${warnIcon} الإنذارات: ${user.warn}/4\n`;
                    txt += `│   📅 آخر إنذار: ${lastWarn}\n`;
                });
            } else {
                txt += `│✅ لا يوجد مستخدمين محذرين حالياً\n`;
            }
            
            txt += `╰─────────────────\n`;
            
        } catch (e) {
            console.error('خطأ في قائمة الإنذارات:', e);
            txt += "❌ حدث خطأ في جلب قائمة المحذرين.\n";
        }
        return conn.reply(m.chat, txt, m, { mentions: await conn.parseMention(txt) });
    }
};

// 🛠️ إعدادات الHandler
handler.help = [
    "listablock - قائمة المحظورين من البوت",
    "listaban - قائمة المستخدمين المحظورين", 
    "listaadv - قائمة المحذرين",
    "chatsbaneados - قائمة المجموعات المحظورة",
    "listaparejas - قائمة العلاقات"
];

handler.tags = ["owner", "نظام"];
handler.command = /^(listablock|listaban|listaadv|chatsbaneados|listaparejas|قائمة_الحظر|المستخدمين_المحظورين|قائمة_الإنذارات|المجموعات_المحظورة|قائمة_العلاقات)$/i;
// handler.owner = true;

export default handler;
