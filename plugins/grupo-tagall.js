import { db } from '../lib/postgres.js';

let handler = async (m, { conn, text, participants, metadata, args, command }) => {

    // 🎯 أمر منشن جميع الأعضاء
    if (/^(tagall|invocar|invocacion|todos|invocación|منشن_الجميع|استدعاء|إشعار)$/i.test(command)) {
        
        // التحقق من وجود رسالة
        if (!text) {
            return conn.sendMessage(m.chat, { 
                text: `❌ *يرجى إدخال رسالة للإشعار*\n\n📝 مثال:\n${usedPrefix}${command} مرحبا جميعاً 👋` 
            }, { quoted: m });
        }

        let pesan = args.join` `;
        let oi = `📢 *الرسالة:* ${pesan}`;
        let teks = `╔════════════════╗
                     ║   📣 إشعار المجموعة   ║
                     ╚════════════════╝\n
✨ ${oi}\n
📌 *الإشارات:*\n`;
        
        let menciones = [];
        let successCount = 0;

        for (let mem of participants) {
            let numero = null;
            
            if (mem.id.endsWith('@lid')) {
                if (mem.participantAlt && mem.participantAlt.endsWith('@s.whatsapp.net')) {
                    numero = mem.participantAlt.split('@')[0];
                    menciones.push(mem.participantAlt);
                    successCount++;
                } else {
                    try {
                        const res = await db.query('SELECT num FROM usuarios WHERE lid = $1', [mem.id]);
                        numero = res.rows[0]?.num || null;
                        if (numero) {
                            menciones.push(mem.id);
                            successCount++;
                        }
                    } catch (dbError) {
                        console.error('خطأ في قاعدة البيانات:', dbError);
                    }
                }
            } else if (/^\d+@s\.whatsapp\.net$/.test(mem.id)) {
                numero = mem.id.split('@')[0];
                menciones.push(mem.id);
                successCount++;
            }

            if (numero) {
                teks += `📍 @${numero}\n`;
            }
        }

        // إضافة إحصائيات
        teks += `\n📊 *الإحصائيات:*\n`;
        teks += `✅ تمت الإشارة إلى: ${successCount} عضو\n`;
        teks += `📋 إجمالي الأعضاء: ${participants.length}`;

        try {
            await conn.sendMessage(m.chat, { 
                text: teks, 
                mentions: menciones 
            }, { quoted: m });
        } catch (sendError) {
            console.error('خطأ في الإرسال:', sendError);
            await conn.sendMessage(m.chat, { 
                text: '❌ حدث خطأ أثناء إرسال الإشعار' 
            }, { quoted: m });
        }
    }

    // 📊 أمر عداد الإحصائيات
    if (command == 'contador' || command == 'عداد' || command == 'إحصائيات') {
        
        try {
            const result = await db.query(`
                SELECT user_id, message_count 
                FROM messages 
                WHERE group_id = $1
            `, [m.chat]);
            
            let memberData = participants.map(mem => {
                const userId = mem.id;
                const userData = result.rows.find(row => row.user_id === userId) || { message_count: 0 };
                return { 
                    id: userId, 
                    alt: mem.participantAlt, 
                    messages: userData.message_count 
                };
            });

            // ترتيب الأعضاء حسب النشاط
            memberData.sort((a, b) => b.messages - a.messages);
            
            let activeCount = memberData.filter(mem => mem.messages > 0).length;
            let inactiveCount = memberData.filter(mem => mem.messages === 0).length;
            let totalMessages = memberData.reduce((sum, mem) => sum + mem.messages, 0);

            let teks = `╔══════════════════════╗
                         ║     📊 إحصائيات المجموعة    ║
                         ╚══════════════════════╝\n\n`;

            teks += `📁 *معلومات المجموعة:*\n`;
            teks += `   🏷️  الإسم: ${metadata.subject || 'بدون اسم'}\n`;
            teks += `   👥  إجمالي الأعضاء: ${participants.length}\n`;
            teks += `   💬  إجمالي الرسائل: ${totalMessages}\n\n`;

            teks += `📈 *نشاط المجموعة:*\n`;
            teks += `   ✅  الأعضاء النشطين: ${activeCount}\n`;
            teks += `   ❌  الأعضاء غير النشطين: ${inactiveCount}\n`;
            teks += `   📊  نسبة النشاط: ${Math.round((activeCount / participants.length) * 100)}%\n\n`;

            teks += `🏆 *أكثر الأعضاء نشاطاً:*\n`;

            let topMembers = memberData.slice(0, 10); // أفضل 10 أعضاء
            let mentionsList = [];

            for (let [index, mem] of topMembers.entries()) {
                let numero = null;
                let emoji = '🔹';
                
                if (index === 0) emoji = '🥇';
                else if (index === 1) emoji = '🥈';
                else if (index === 2) emoji = '🥉';

                if (mem.id.endsWith('@lid')) {
                    if (mem.alt && mem.alt.endsWith('@s.whatsapp.net')) {
                        numero = mem.alt.split('@')[0];
                        mentionsList.push(mem.alt);
                    } else {
                        try {
                            const res = await db.query('SELECT num FROM usuarios WHERE lid = $1', [mem.id]);
                            numero = res.rows[0]?.num || 'مستخدم';
                        } catch (dbError) {
                            console.error('خطأ في قاعدة البيانات:', dbError);
                            numero = 'مستخدم';
                        }
                    }
                } else if (/^\d+@s\.whatsapp\.net$/.test(mem.id)) {
                    numero = mem.id.split('@')[0];
                    mentionsList.push(mem.id);
                }

                if (numero) {
                    teks += `   ${emoji} @${numero} - ${mem.messages} رسالة\n`;
                }
            }

            // إضافة باقي الأعضاء إذا كانوا أكثر من 10
            if (memberData.length > 10) {
                teks += `\n   ... وباقي ${memberData.length - 10} عضو`;
            }

            await conn.sendMessage(m.chat, { 
                text: teks, 
                mentions: mentionsList 
            }, { quoted: m });

        } catch (error) {
            console.error('❌ خطأ في أمر العداد:', error);
            await conn.sendMessage(m.chat, { 
                text: '❌ حدث خطأ في جلب إحصائيات المجموعة' 
            }, { quoted: m });
        }
    }
};

// 🛠️ إعدادات الHandler
handler.help = [
    'tagall <رسالة> - منشن جميع الأعضاء',
    'invocar <رسالة> - استدعاء المجموعة', 
    'contador - إحصائيات النشاط'
];

handler.tags = ['group', 'admin'];
handler.command = /^(tagall|invocar|invocacion|todos|invocación|contador|منشن_الجميع|استدعاء|إشعار|عداد|إحصائيات)$/i;
handler.admin = true;
handler.group = true;
// handler.botAdmin = true;

export default handler;
