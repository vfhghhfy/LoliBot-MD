// 🎯 كود التحويل بين المستخدمين (مترجم للعربية)
// الأصل من https://github.com/elrebelde21

import { db } from '../lib/postgres.js'

const items = [
  'limite', 'exp', 'joincount', 'money', 'potion', 'trash', 'wood', 'rock', 'string',
  'petFood', 'emerald', 'diamond', 'gold', 'iron', 'common', 'uncoommon',
  'mythic', 'legendary', 'pet'
]

let confirmation = {}

async function handler(m, { conn, args, usedPrefix, command }) {
  if (confirmation[m.sender]) return m.reply('⚠️ أنت تقوم حاليًا بعملية تحويل، انتظر حتى تنتهي السابقة.')

  const userRes = await db.query('SELECT * FROM usuarios WHERE id = $1', [m.sender])
  let user = userRes.rows[0]
  if (!user) return

  const item = items.filter(v => v in user && typeof user[v] == 'number')

  let menu = `💱 *نظام التحويل بين المستخدمين*

استخدم:
> *${usedPrefix + command} <النوع> <الكمية> @العضو*

📘 مثال:
> *${usedPrefix + command} exp 30 @user*

┏━━━『 💰 *العناصر المتاحة* 』
┃ 💎 *الماس* = limite
┃ 🪙 *عملات لولي* = money
┃ ⚡ *الخبرة (XP)* = exp
┗━━━━━━━━━━━`.trim()

  const type = (args[0] || '').toLowerCase()
  if (!item.includes(type)) return m.reply(menu, m.chat, { mentions: conn.parseMention(menu) })

  const count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, (isNumber(args[1]) ? parseInt(args[1]) : 1))) * 1
  let who = m.mentionedJid?.[0] || (args[2] ? (args[2].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : '')
  if (!who) return m.reply('⚠️ يرجى *منشن المستخدم* الذي تريد تحويل الموارد إليه.')

  const userToRes = await db.query('SELECT * FROM usuarios WHERE id = $1', [who])
  let userTo = userToRes.rows[0]
  if (!userTo) return m.reply(`❌ المستخدم *@${(who || '').replace(/@s\.whatsapp\.net/g, '')}* غير مسجل في قاعدة البيانات.`, null, { mentions: [who] })

  if (user[type] * 1 < count) return m.reply(`⚠️ ليس لديك كمية كافية من *${type.toUpperCase()}* لإتمام العملية.`)

  let confirm = `⚠️ *تأكيد التحويل المطلوب*

> 🔹 *${count} ${type}* إلى *@${(who || '').replace(/@s\.whatsapp\.net/g, '')}*

هل ترغب بالمتابعة؟
⏰ لديك 60 ثانية للرد.

🟢 اكتب: *نعم* لتأكيد العملية.
🔴 اكتب: *لا* لإلغائها.`.trim()

  await conn.reply(m.chat, confirm, m, { mentions: [who] })

  confirmation[m.sender] = {
    sender: m.sender,
    to: who,
    message: m,
    type,
    count,
    timeout: setTimeout(() => {
      m.reply('⏰ *انتهى الوقت! تم إلغاء التحويل.*')
      delete confirmation[m.sender]
    }, 60 * 1000)
  }
}

handler.before = async m => {
  if (!(m.sender in confirmation)) return
  if (!m.originalText) return

  let { timeout, sender, message, to, type, count } = confirmation[m.sender]
  if (m.id === message.id) return

  const userRes = await db.query('SELECT * FROM usuarios WHERE id = $1', [sender])
  const userToRes = await db.query('SELECT * FROM usuarios WHERE id = $1', [to])
  let user = userRes.rows[0]
  let userTo = userToRes.rows[0]
  if (!user || !userTo) return m.reply('❌ خطأ: المستخدمين غير صالحين.')

  if (/^(لا|no)$/i.test(m.originalText)) {
    clearTimeout(timeout)
    delete confirmation[sender]
    return m.reply('❌ *تم إلغاء العملية بنجاح.*')
  }

  if (/^(نعم|si)$/i.test(m.originalText)) {
    if (user[type] < count) {
      clearTimeout(timeout)
      delete confirmation[sender]
      return m.reply(`⚠️ لا تملك كمية كافية من *${type}* لإتمام التحويل.`)
    }

    user[type] -= count
    userTo[type] += count

    await db.query(`UPDATE usuarios SET ${type} = $1 WHERE id = $2`, [user[type], sender])
    await db.query(`UPDATE usuarios SET ${type} = $1 WHERE id = $2`, [userTo[type], to])

    m.reply(`✅ *تم التحويل بنجاح!*\n\nتم إرسال *${count} ${type}* إلى *@${(to || '').replace(/@s\.whatsapp\.net/g, '')}*`, null, { mentions: [to] })
    clearTimeout(timeout)
    delete confirmation[sender]
  }
}

handler.help = ['transfer <النوع> <الكمية> @العضو']
handler.tags = ['econ']
handler.command = ['transfer', 'payxp', 'darxp', 'dar', 'enviar', 'transferir', 'تحويل', 'ارسال']
handler.disabled = false
handler.register = true

export default handler

function isNumber(x) {
  return !isNaN(x)
      }
