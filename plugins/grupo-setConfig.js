import { db } from '../lib/postgres.js'

const handler = async (m, { args, command, conn, text }) => {
    if (!text) {
        const tipo = command === 'setwelcome' || command === 'ضبط_الترحيب' ? 'الترحيب' 
                   : command === 'setbye' || command === 'ضبط_الوداع' ? 'الوداع' 
                   : command === 'setpromote' || command === 'ضبط_الترقية' ? 'الترقية' 
                   : 'سحب الإدارة'

        const variables = ['@user → ذكر المستخدم',
        ...(command !== 'setpromote' && command !== 'setdemote' && command !== 'ضبط_الترقية' && command !== 'ضبط_سحب_الادارة' ? ['@group → اسم المجموعة'] : []),
        ...(command === 'setwelcome' || command === 'ضبط_الترحيب' ? ['@desc → وصف المجموعة'] : []),
        ...(command === 'setpromote' || command === 'setdemote' || command === 'ضبط_الترقية' || command === 'ضبط_سحب_الادارة' ? ['@author → من نفذ الإجراء'] : [])
        ].join('\n• ')

        const opciones = (command === 'setwelcome' || command === 'setbye' || command === 'ضبط_الترحيب' || command === 'ضبط_الوداع') ? `*خيارات إضافية:*
• --صورة → لإرسال الرسالة مع صورة
• --بدون_صورة → لإرسال نص فقط` : ''

        const ejemplo = command === 'setwelcome' || command === 'ضبط_الترحيب' ? `مرحباً @user، أهلاً بك في @group. اقرأ القواعد: @desc`
        : command === 'setbye' || command === 'ضبط_الوداع' ? `وداعاً @user، شكراً لك على وجودك في @group.`
        : command === 'setpromote' || command === 'ضبط_الترقية' ? `@user تمت ترقيته بواسطة @author.`
        : `@user تم سحب إدارته بواسطة @author.`

        return m.reply(`🎨 *تخصيص رسالة ${tipo} للمجموعة:*

*يمكنك استخدام المتغيرات التالية:*
• ${variables}\n${opciones}

*مثال للاستخدام:*
➤ /${command} ${ejemplo} --صورة`)
    }
    
    const hasFoto = text.includes('--صورة') || text.includes('--foto')
    const hasNoFoto = text.includes('--بدون_صورة') || text.includes('--nofoto')
    const cleanText = text.replace('--صورة', '').replace('--foto', '').replace('--بدون_صورة', '').replace('--nofoto', '').trim()
    
    await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [m.chat])

    if (command === 'setwelcome' || command === 'ضبط_الترحيب') {
        await db.query(`UPDATE group_settings SET swelcome = $1${hasFoto ? ', photowelcome = true' : ''}${hasNoFoto ? ', photowelcome = false' : ''} WHERE group_id = $2`, [cleanText, m.chat])
        return m.reply(`✅ تم حفظ رسالة الترحيب${hasFoto ? ' مع صورة' : hasNoFoto ? ' بدون صورة' : ''}.`)
    }

    if (command === 'setbye' || command === 'ضبط_الوداع') {
        await db.query(`UPDATE group_settings SET sbye = $1${hasFoto ? ', photobye = true' : ''}${hasNoFoto ? ', photobye = false' : ''} WHERE group_id = $2`, [cleanText, m.chat])
        return m.reply(`✅ تم حفظ رسالة الوداع${hasFoto ? ' مع صورة' : hasNoFoto ? ' بدون صورة' : ''}.`)
    }
    
    if (command === 'setpromote' || command === 'ضبط_الترقية') {
        await db.query(`UPDATE group_settings SET spromote = $1 WHERE group_id = $2`, [cleanText, m.chat])
        return m.reply("✅ تم حفظ رسالة الترقية.")
    }

    if (command === 'setdemote' || command === 'ضبط_سحب_الادارة') {
        await db.query(`UPDATE group_settings SET sdemote = $1 WHERE group_id = $2`, [cleanText, m.chat])
        return m.reply("✅ تم حفظ رسالة سحب الإدارة.")
    }
}

// 🎪 الأوامر العربية المزخرفة
handler.help = ['setwelcome <texto>', 'setbye <texto>', 'ضبط_الترحيب <نص>', 'ضبط_الوداع <نص>']
handler.tags = ['group', 'المجموعة', '🎨']
handler.command = ['setwelcome', 'setbye', 'setpromote', 'setdemote', 'ضبط_الترحيب', 'ضبط_الوداع', 'ضبط_الترقية', 'ضبط_سحب_الادارة']
handler.group = true
handler.admin = true
handler.register = true

export default handler
