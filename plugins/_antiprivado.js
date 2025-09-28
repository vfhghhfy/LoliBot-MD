import { db } from '../lib/postgres.js'
import { getSubbotConfig } from '../lib/postgres.js'
import chalk from 'chalk'

// قائمة الأوامر المسموح بها في الخاص
const comandosPermitidos = ['code', 'serbot', 'jadibot', 'bots', 'piedra', 'tijera', 'papel']

export async function before(m, { conn, isOwner }) {
    const botId = conn.user?.id || globalThis.conn.user.id 
    const config = await getSubbotConfig(botId)
    const chatId = m.chat || m.key?.remoteJid || ''
    const sender = m.sender
    const texto = m.originalText?.toLowerCase().trim() || m.text?.toLowerCase().trim() || ''

    // تجاهل إذا كانت المجموعة أو الرسالة من المالك أو من البوت نفسه
    if (m.isGroup || m.fromMe || isOwner) {
        return
    }

    // الخروج إذا لم يتم تفعيل خاصية منع الخاص
    if (!config.anti_private) return
    
    // الحصول على البادئات المسموحة
    const prefixes = Array.isArray(config.prefix) ? config.prefix : [config.prefix || '/']

    // تحديد البادئة المستخدمة
    let usedPrefix = ''
    for (const prefix of prefixes) {
        if (texto.startsWith(prefix)) {
            usedPrefix = prefix
            break
        }
    }

    // استخراج الأمر من النص
    const withoutPrefix = texto.slice(usedPrefix.length).trim()
    const [commandName, ...args] = withoutPrefix.split(/\s+/)
    const command = commandName ? commandName.toLowerCase() : ''

    // السماح بالأوامر المسموح بها
    if (comandosPermitidos.includes(command)) {
        return
    }

    try {
        // التحقق من حالة التحذير للمستخدم
        let res = await db.query(`SELECT warn_pv FROM usuarios WHERE id = $1`, [sender])
        let warned = res.rows[0]?.warn_pv || false

        // إذا كان المستخدم جديداً ولم يتم تحذيره من قبل
        if (!res.rowCount) {
            await db.query(`INSERT INTO usuarios (id, warn_pv) VALUES ($1, true)`, [sender])
            await m.reply(`مرحباً، ممنوع استخدام الأوامر في المحادثة الخاصة...\n\n*\`🔰 إذا كنت تريد إنشاء بوت فرعي، استخدم الأوامر التالية:\`*\n/serbot\n/code\n\n> _*لاستخدام وظائفي، انضم إلى المجموعة الرسمية 👇*_\n${[info.nn, info.nn2, info.nn3, info.nn4, info.nn5, info.nn6].getRandom()}`)
            return false
        }

        // إذا كان المستخدم موجوداً ولكن لم يتم تحذيره بعد
        if (!warned) {
            await db.query(`UPDATE usuarios SET warn_pv = true WHERE id = $1`, [sender])
            await m.reply(`مرحباً، ممنوع استخدام الأوامر في المحادثة الخاصة...\n\n*\`🔰 إذا كنت تريد إنشاء بوت فرعي، استخدم الأوامر التالية:\`*\n/serbot\n/code\n\n> _*لاستخدام وظائفي، انضم إلى المجموعة الرسمية 👇*_\n${[info.nn, info.nn2, info.nn3, info.nn4, info.nn5, info.nn6].getRandom()}`)
            return false
        }

        return false
    } catch (e) {
        return false
    }
}
