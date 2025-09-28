import { db } from '../lib/postgres.js';

// تعريف النمط النصي للكشف عن أي رابط
const linkRegex = /https?:\/\/\S+/i;

export async function before(m, { conn }) {
    // التأكد أن الرسالة في مجموعة ونصها موجود
    if (!m.isGroup || !m.originalText) return;
    
    const userTag = `@${m.sender.split('@')[0]}`;
    const bang = m.key.id;
    let delet = m.key.participantAlt || m.key.participant || m.sender;

    try {
        // جلب إعدادات منع الروابط العامة من قاعدة البيانات
        const res = await db.query('SELECT antilink2 FROM group_settings WHERE group_id = $1', [m.chat]);
        const config = res.rows[0];
        // الخروج إذا لم يتم تفعيل خاصية منع الروابط
        if (!config || !config.antilink2) return;
    } catch (e) {
        console.error(e);
        return;
    }

    // التحقق من وجود أي رابط في النص
    const isGroupLink = linkRegex.test(m.originalText);
    if (!isGroupLink) return;
    
    // الحصول على معلومات المجموعة
    const metadata = await conn.groupMetadata(m.chat);
    const botId = conn.user?.id?.replace(/:\d+@/, "@");
    
    // التحقق من صلاحية البوت كمسؤول
    const isBotAdmin = metadata.participants.some(p => {
        const pid = p.id?.replace(/:\d+/, "");
        return (pid === botId || pid === (conn.user?.lid || "").replace(/:\d+/, "")) && p.admin;
    });

    // التحقق من صلاحية المرسل كمسؤول
    const senderVariants = [m.sender, m.lid].filter(Boolean).map(j => j.replace(/:\d+/, ""));
    const isSenderAdmin = metadata.participants.some(p => {
        const pid = p.id?.replace(/:\d+/, "");
        return senderVariants.includes(pid) && p.admin;
    });

    // تجاهل إذا كان المرسل مسؤولاً أو الرسالة من البوت
    if (isSenderAdmin || m.fromMe) return;
    
    // استثناء رابط الدعوة الخاص بالمجموعة الحالية
    if (conn.groupInviteCode) {
        try {
            const code = await conn.groupInviteCode(m.chat);
            if (m.originalText.includes(`https://chat.whatsapp.com/${code}`)) return;
        } catch {}
    }

    // إذا لم يكن البوت مسؤولاً في المجموعة
    if (!isBotAdmin) return await conn.sendMessage(m.chat, { 
        text: `*「 كشف رابط محظور 」*\n\n${userTag}، قمت بمشاركة رابط ولكن لا يمكنني إزالتك لأنني لست مسؤولاً في المجموعة.`, 
        mentions: [m.sender]
    }, { quoted: m });
    
    // إرسال تحذير للمستخدم
    await conn.sendMessage(m.chat, { 
        text: `*「 كشف رابط محظور 」*\n\n${userTag}، لقد قمت بمخالفة قواعد المجموعة وسيتم إزالتك.`, 
        mentions: [m.sender]
    }, { quoted: m });
    
    // محاولة حذف الرسالة وإزالة المستخدم
    try {
        await conn.sendMessage(m.chat, { 
            delete: { 
                remoteJid: m.chat, 
                fromMe: false, 
                id: bang, 
                participant: delet 
            }
        });
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    } catch (err) {
        console.error(err);
    }
}
