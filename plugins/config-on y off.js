import { db } from '../lib/postgres.js'
import { getSubbotConfig } from '../lib/postgres.js'

const handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner }) => {
    const isEnable = /true|enable|(turn)?on|1/i.test(command)
    const type = (args[0] || '').toLowerCase()
    const chatId = m.chat
    const botId = conn.user?.id
    const cleanId = botId.replace(/:\d+/, '');
    const isSubbot = botId !== 'main'
    let isAll = false, isUser = false
    
    let res = await db.query('SELECT * FROM group_settings WHERE group_id = $1', [chatId]);
    let chat = res.rows[0] || {};
    const getStatus = (flag) => m.isGroup ? (chat[flag] ? '✅' : '❌') : '⚠️';

    let menu = `*『 ⧼⧼⧼ الإعدادات ⧽⧽⧽ 』*\n\n`;
    menu += `> *اختر خياراً من القائمة*\n> *لبدء التهيئة*\n\n`;
    menu += `● *رموز الإعدادات:*\n✅ ⇢ *مفعل*\n❌ ⇢ *معطل*\n⚠️ ⇢ *هذه الدردشة ليست مجموعة*\n\n`;
    
    menu += `*『 إعدادات المشرفين 』*\n\n`;
    menu += `🎉 الترحيب ${getStatus('welcome')}\n• رسالة ترحيب بالأعضاء الجدد\n• ${usedPrefix + command} welcome\n\n`;
    menu += `📣 كشف التغييرات ${getStatus('detect')}\n• التنبيه عن تغييرات المجموعة\n• ${usedPrefix + command} detect\n\n`;
    menu += `🔗 منع روابط الواتساب ${getStatus('antilink')}\n• كشف روابط المجموعات\n• ${usedPrefix + command} antilink\n\n`;
    menu += `🌐 منع جميع الروابط ${getStatus('antilink2')}\n• كشف أي رابط\n• ${usedPrefix + command} antilink2\n\n`;
    menu += `🕵️ منع الأرقام الوهمية ${getStatus('antifake')}\n• حظر أرقام من دول أخرى\n• ${usedPrefix + command} antifake\n\n`;
    menu += `🔞 المحتوى المخصص للكبار ${getStatus('modohorny')}\n• محتوى +18 في الملصقات والصور المتحركة\n• ${usedPrefix + command} modohorny\n\n`
    menu += `🔒 وضع المشرفين فقط ${getStatus('modoadmin')}\n• فقط المشرفون يمكنهم استخدام الأوامر\n• ${usedPrefix + command} modoadmin\n\n`;
      
    menu += `\n*『 إعدادات المالك 』*\n\n`;
    menu += `🚫 منع الخاص ${isSubbot ? (getSubbotConfig(botId).antiPrivate ? '✅' : '❌') : '⚠️'}\n• منع الاستخدام في المحادثة الخاصة\n• ${usedPrefix + command} antiprivate\n\n`;
    menu += `📵 منع المكالمات ${isSubbot ? (getSubbotConfig(botId).anticall ? '✅' : '❌') : '⚠️'}\n• حظر المكالمات\n• ${usedPrefix + command} anticall`;
      
    switch (type) {
        case 'welcome': case 'bienvenida': case 'ترحيب':
            if (!m.isGroup) throw '⚠️ هذا الأمر يمكن استخدامه فقط داخل المجموعة.'
            if (!isAdmin) throw "⚠️ فقط المشرفون يمكنهم استخدام هذا الأمر.";
            await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [chatId])
            await db.query(`UPDATE group_settings SET welcome = $1 WHERE group_id = $2`, [isEnable, chatId])
            break

        case 'detect': case 'avisos': case 'كشف':
            if (!m.isGroup) throw '⚠️ هذا الأمر يمكن استخدامه فقط داخل المجموعة.'
            if (!isAdmin) throw "⚠️ فقط المشرفون يمكنهم استخدام هذا الأمر.";
            await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [chatId])
            await db.query(`UPDATE group_settings SET detect = $1 WHERE group_id = $2`, [isEnable, chatId])
            break

        case 'antilink': case 'antienlace': case 'منع_الروابط':
            if (!m.isGroup) throw '⚠️ هذا الأمر يمكن استخدامه فقط داخل المجموعة.'
            if (!isAdmin) throw "⚠️ فقط المشرفون يمكنهم استخدام هذا الأمر.";
            await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [chatId])
            await db.query(`UPDATE group_settings SET antilink = $1 WHERE group_id = $2`, [isEnable, chatId])
            break
              
        case 'antilink2': case 'منع_جميع_الروابط':
            if (!m.isGroup) throw '⚠️ هذا الأمر يمكن استخدامه فقط داخل المجموعة.'
            if (!isAdmin) throw "⚠️ فقط المشرفون يمكنهم استخدام هذا الأمر.";
            await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [chatId])
            await db.query(`UPDATE group_settings SET antilink2 = $1 WHERE group_id = $2`, [isEnable, chatId])
            break
                    
        case 'antiporn': case 'antiporno': case 'antinwfs': case 'منع_البورنو':
            if (!m.isGroup) throw '⚠️ هذا الأمر يمكن استخدامه فقط داخل المجموعة.'
            if (!isAdmin) throw "⚠️ فقط المشرفون يمكنهم استخدام هذا الأمر.";
            await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [chatId])
            await db.query(`UPDATE group_settings SET antiporn = $1 WHERE group_id = $2`, [isEnable, chatId])
            break
                    
        case 'audios': case 'ردود_صوتية':
            if (!m.isGroup) throw '⚠️ هذا الأمر يمكن استخدامه فقط داخل المجموعة.'
            if (!isAdmin) throw "⚠️ فقط المشرفون يمكنهم استخدام هذا الأمر.";
            await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [chatId])
            await db.query(`UPDATE group_settings SET audios = $1 WHERE group_id = $2`, [isEnable, chatId])
            break
                    
        case 'antifake': case 'منع_الأرقام_الوهمية':
            if (!m.isGroup) throw '⚠️ هذا الأمر يمكن استخدامه فقط داخل المجموعة.'
            if (!isAdmin) throw "⚠️ فقط المشرفون يمكنهم استخدام هذا الأمر.";
            await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [chatId])
            await db.query(`UPDATE group_settings SET antifake = $1 WHERE group_id = $2`, [isEnable, chatId])
            break
              
        case 'nsfw': case "modohorny": case "modocaliente": case "محتوى_كبار":
            if (!m.isGroup) throw '⚠️ هذا الأمر يمكن استخدامه فقط داخل المجموعة.'
            if (!isAdmin) throw "⚠️ فقط المشرفون يمكنهم استخدام هذا الأمر.";
            await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [chatId])
            await db.query(`UPDATE group_settings SET modohorny = $1 WHERE group_id = $2`, [isEnable, chatId])
            break
              
        case 'modoadmin': case 'onlyadmin': case 'مشرفين_فقط':
            if (!m.isGroup) throw '⚠️ هذا الأمر يمكن استخدامه فقط داخل المجموعة.'
            if (!isAdmin) throw "⚠️ فقط المشرفون يمكنهم استخدام هذا الأمر.";
            await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [chatId])
            await db.query(`UPDATE group_settings SET modoadmin = $1 WHERE group_id = $2`, [isEnable, chatId])
            break

        case 'antiprivate': case 'antiprivado': case 'منع_الخاص':
            if (!isSubbot && !isOwner) return m.reply('❌ فقط المالك أو البوتات الفرعية يمكنهم تغيير هذا.');
            await db.query(`INSERT INTO subbots (id, anti_private)
                VALUES ($1, $2)
                ON CONFLICT (id) DO UPDATE SET anti_private = $2`, [cleanId, isEnable]);
            isAll = true;
            break;

        case 'anticall': case 'antillamada': case 'منع_المكالمات':
            if (!isSubbot && !isOwner) return m.reply('❌ فقط المالك أو البوتات الفرعية يمكنهم تغيير هذا.');
            await db.query(`INSERT INTO subbots (id, anti_call)
                VALUES ($1, $2)
                ON CONFLICT (id) DO UPDATE SET anti_call = $2`, [cleanId, isEnable]);
            isAll = true;
            break;
            
        default:
            return m.reply(menu.trim());
    }
    
    await m.reply(`🗂️ تم *${isEnable ? 'تفعيل' : 'تعطيل'}* الخيار *${type}* لـ ${isAll ? 'البوت بالكامل' : isUser ? 'هذا المستخدم' : 'هذه المجموعة'} بنجاح.`)
}

handler.help = ['enable <خيار>', 'disable <خيار>']
handler.tags = ['إعدادات']
handler.command = /^((en|dis)able|(tru|fals)e|(turn)?o(n|ff)|[01])$/i
handler.register = true
//handler.group = true 
//handler.admin = true
export default handler
