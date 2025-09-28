import { canLevelUp } from '../lib/levelling.js'

const multiplier = 650

export async function before(m, { conn }) {
    // جلب إعدادات الترقية التلقائية للمجموعة
    const chatres = await m.db.query('SELECT autolevelup FROM group_settings WHERE group_id = $1', [m.chat])
    const chat = chatres.rows[0]
    if (!chat?.autolevelup) return
    
    // جلب بيانات المستخدم من قاعدة البيانات
    const res = await m.db.query('SELECT exp, level, role FROM usuarios WHERE id = $1', [m.sender])
    const user = res.rows[0]

    const before = user.level
    let currentLevel = user.level
    
    // حساب المستوى الجديد بناءً على الخبرة
    while (canLevelUp(currentLevel, user.exp, multiplier)) {
        currentLevel++
    }

    // التحقق إذا كان المستخدم قد ارتقى مستوى
    if (currentLevel > before) {
        const newRole = getRole(currentLevel).name
        
        // تحديث بيانات المستخدم في قاعدة البيانات
        await m.db.query('UPDATE usuarios SET level = $1, role = $2 WHERE id = $3', [currentLevel, newRole, m.sender])
        user.level = currentLevel
        user.role = newRole
        
        // إرسال رسالة تهنئة للمستخدم
        conn.reply(m.chat, [
            `*「 تهانينا! ترقية مستوى 🆙🥳 」*\n\nمبارك عليك ترقية المستوى استمر هكذا 👏\n\n*• المستوى:* ${before} ⟿ ${user.level}\n*• الرتبة:* ${user.role}\n\n_*لمشاهدة خبرتك في الوقت الحقيقي استخدم الأمر #level*_`,
            `@${m.sender.split`@`[0]} أوه لقد وصلت إلى المستوى التالي\n*• المستوى:* ${before} ⟿ ${user.level}\n\n_*لمعرفة المتصدرين استخدم الأمر #lb*_`,
            `إحتراف @${m.sender.split`@`[0]} لقد وصلت إلى مستوى جديد 🙌\n\n*• المستوى الجديد:* ${user.level}\n*• المستوى السابق:* ${before}`
        ].getRandom(), m, {
            contextInfo: {
                externalAdReply: {
                    mediaUrl: null,
                    mediaType: 1,
                    description: null,
                    title: info.wm,
                    body: ' 💫 سوبر بوت الواتساب 🥳 ',
                    previewType: 0,
                    thumbnail: m.pp,
                    sourceUrl: info.md
                }
            }
        })
        
        // رسائل إضافية للبث (معلقة حالياً)
        let niv = `*${m.pushName || 'مجهول'}* يحصل على مستوى جديد 🥳\n\n*• المستوى السابق:* ${before}\n*• المستوى الحالي:* ${user.level}\n*• الرتبة:* ${user.role}\n*• البوت:* ${info.wm}`
        
        let nivell = `*${m.pushName || 'مجهول'}* لقد ارتقيت إلى مستوى جديد 🥳\n\n> _*• المستوى:* ${before} ⟿ ${user.level}_`
        
        let nivelll = `🥳 ${m.pushName || 'مجهول'} إحتراف لقد وصل إلى مستوى جديد 🥳\n\n*• المستوى:* ${before} ⟿ ${user.level}\n*• الرتبة:* ${user.role}\n*• البوت:* ${info.wm}`
        
        /*await global.conn.sendMessage("120363297379773397@newsletter", { 
            text: [niv, nivell, nivelll].getRandom(), 
            contextInfo: {
                externalAdReply: {
                    title: "【 🔔 إشعار عام 🔔 】",
                    body: 'لقد ارتقيت مستوى 🥳!',
                    thumbnailUrl: m.pp,
                    sourceUrl: info.nna,
                    mediaType: 1,
                    showAdAttribution: false,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: null }).catch(err => console.error(err))*/
    }
}

// دالة لتحديد الرتبة بناءً على المستوى
export function getRole(level) {
    const ranks = ['مبتدى(ء)', 'متعلم', 'مستكشف(ة)', 'خبير(ة)', 'حديد', 'فضة', 'ذهب', 'أسطورة', 'نجمي', 'ماسي', 'الطوباز', 'النخبة العالمية']
    const subLevels = ['V', 'IV', 'III', 'II', 'I']
    const roles = []

    let lvl = 0
    for (let rank of ranks) {
        for (let sub of subLevels) {
            roles.push({ level: lvl, name: `${rank} ${sub}` })
            lvl++
        }
    }

    return roles.reverse().find(r => level >= r.level) || { level, name: 'مبتدى(ء) V' }
}
