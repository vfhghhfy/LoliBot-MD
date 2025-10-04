import moment from 'moment-timezone'
import { xpRange } from '../lib/levelling.js'
import fs from "fs"

const cooldowns = new Map()
const COOLDOWN_DURATION = 180000 // ⏰ 3 دقائق

const tags = {
  main: '💠 *الـرئـيـسـيـة*',
  jadibot: '🤖 *بـوتـات فـرعـيـة*',
  downloader: '📥 *الـتـحـمـيـلات*',
  fun: '😂 *تـرفـيـه*',
  game: '🎮 *ألـعـاب*',
  xp: '⚡ *الـتـجـربـة*',
  anime: '🎌 *أنـمـي*',
  tools: '🧠 *الأدوات*',
  group: '👥 *المـجـمـوعـات*',
  info: '📑 *الـمـعـلـومـات*',
  owner: '👑 *الـمـالـك*',
}

const defaultMenu = {
  before: `
╭━━━〔 💎 *بوت دزاري* 💎 〕━━━╮
┃ ✨ *الوقت:* %time
┃ 📅 *التاريخ:* %date
┃ 👤 *المستخدم:* %name
┃ 🧭 *المستوى:* %level
┃ 💫 *الخبرة:* %exp XP
╰━━━━━━━━━━━━━━━━━━━━╯

*⚙️ القوائم المتاحة ↓*
`.trimStart(),
  header: `
╭──〔 %category 〕──╮`.trimStart(),
  body: '│ ✦ *%cmd*',
  footer: '╰──────────────────╯\n',
  after: `
╭━━━〔 👑 *معلومات إضافية* 👑 〕━━━╮
┃ 👨‍💻 *المطور:* @+967778668253
┃ 💬 *بوت واتساب رسمي*
┃ 🌐 *الدولة:* 🇾🇪 اليمن
┃ ⏰ *التوقيت المحلي:* %time
╰━━━━━━━━━━━━━━━━━━━━╯
`.trimStart()
}

const handler = async (m, { conn }) => {
  if (cooldowns.has(m.sender)) {
    return conn.reply(m.chat, '⏳ *يرجى الانتظار 3 دقائق قبل إعادة استخدام الأمر.*', m)
  }

  cooldowns.set(m.sender, true)
  setTimeout(() => cooldowns.delete(m.sender), COOLDOWN_DURATION)

  // 💬 تأثير الكتابة (Typing effect)
  const typingMessage = await conn.sendMessage(m.chat, { text: "💬 *جارٍ تحضير قائمتك...*" }, { quoted: m })
  await new Promise(resolve => setTimeout(resolve, 1500))
  await conn.sendMessage(m.chat, { text: "⌛ *جاري تحميل الأوامر...*" }, { quoted: typingMessage })
  await new Promise(resolve => setTimeout(resolve, 1500))

  // معلومات المستخدم
  const user = global.db.data.users[m.sender]
  const { exp, level } = xpRange(user.exp, user.level)
  const name = await conn.getName(m.sender)
  const fecha = moment.tz('Asia/Aden').format('DD/MM/YYYY')
  const hora = moment.tz('Asia/Aden').format('HH:mm:ss')

  const replace = {
    '%': '%',
    time: hora,
    date: fecha,
    name,
    level: user.level,
    exp: user.exp - exp,
  }

  let menu = defaultMenu.before
  for (const tag in tags) {
    const category = tags[tag]
    const commands = Object.keys(global.plugins)
      .filter(k => global.plugins[k].help && global.plugins[k].tags && global.plugins[k].tags.includes(tag))
      .map(k => global.plugins[k].help.map(cmd => defaultMenu.body.replace(/%cmd/g, cmd)).join('\n'))
      .join('\n')

    if (!commands) continue
    menu += '\n' + defaultMenu.header.replace(/%category/g, category)
    menu += '\n' + commands
    menu += '\n' + defaultMenu.footer
  }
  menu += defaultMenu.after

  menu = menu.replace(
    new RegExp(`%(${Object.keys(replace).join('|')})`, 'g'),
    (_, key) => replace[key]
  )

  // حذف رسائل التحميل قبل إرسال القائمة
  await conn.sendMessage(m.chat, { delete: typingMessage.key }).catch(() => {})

  // إرسال القائمة الجميلة ✨
  await conn.sendMessage(m.chat, { text: menu, mentions: [m.sender] })
  await conn.sendMessage(m.chat, { react: { text: '💎', key: m.key } })
}

handler.help = ['menu', 'help', 'مساعدة']
handler.tags = ['main']
handler.command = /^(menu|help|اوامر|القائمة|الاوامر)$/i

export default handler
