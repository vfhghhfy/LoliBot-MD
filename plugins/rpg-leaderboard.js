import fetch from 'node-fetch'
const cooldowns = new Map()
const COOLDOWN_DURATION = 180000 // 3 دقائق

let handler = async (m, { conn, args }) => {
  const chatId = m.chat
  const now = Date.now()
  const chatData = cooldowns.get(chatId) || { lastUsed: 0, rankingMessage: null }
  const timeLeft = COOLDOWN_DURATION - (now - chatData.lastUsed)

  if (timeLeft > 0) {
    const secondsLeft = Math.ceil(timeLeft / 1000)
    const minutes = Math.floor(secondsLeft / 60)
    const remainingSeconds = secondsLeft % 60
    const timeMessage = minutes > 0
      ? `${minutes} دقيقة${minutes !== 1 ? '' : ''}${remainingSeconds > 0 ? ` و ${remainingSeconds} ثانية` : ''}`
      : `${remainingSeconds} ثانية`

    await conn.reply(
      m.chat,
      `⚠️ مرحبًا @${m.sender.split('@')[0]}، لقد تم عرض الترتيب مؤخرًا 🙄\n🕒 يمكنك عرضه مرة أخرى بعد *${timeMessage}* لتجنّب الإزعاج.\n📜 قم بالتمرير للأعلى لرؤية لوحة الترتيب السابقة.`,
      chatData.rankingMessage || m
    )
    return
  }

  const res = await m.db.query('SELECT id, nombre, exp, limite, money, banco FROM usuarios')
  const users = res.rows.map(u => ({ ...u, jid: u.id }))
  const sortedExp = [...users].sort((a, b) => b.exp - a.exp)
  const sortedLim = [...users].sort((a, b) => b.limite - a.limite)
  const sortedMoney = [...users].sort((a, b) => b.money - a.money)
  const sortedBanc = [...users].sort((a, b) => b.banco - a.banco)

  const len = args[0] ? Math.min(100, Math.max(parseInt(args[0]), 10)) : Math.min(10, sortedExp.length)

  const format = (list, prop, icon) =>
    list
      .slice(0, len)
      .map(({ jid, [prop]: value, nombre }, i) =>
        `${i + 1}. @${jid.split('@')[0]} *${formatNumber(value)}* (${value}) ${icon}`
      )
      .join('\n')

  const text = `
🏆 *لــوحــة الــتــصــنــيــف (Leaderboard)*

💠 *أفضل ${len} من حيث الخبرة 🎯*
👤 ترتيبك: *${sortedExp.findIndex(u => u.jid === m.sender) + 1}* من *${sortedExp.length} مستخدم*
${format(sortedExp, 'exp', '⚡')}

──────────────────────

💠 *أفضل ${len} من حيث الألماس 💎*
👤 ترتيبك: *${sortedLim.findIndex(u => u.jid === m.sender) + 1}* من *${sortedLim.length} مستخدم*
${format(sortedLim, 'limite', '💎')}

──────────────────────

💠 *أفضل ${len} من حيث العملات 🪙*
👤 ترتيبك: *${sortedMoney.findIndex(u => u.jid === m.sender) + 1}* من *${sortedMoney.length} مستخدم*
${format(sortedMoney, 'money', '🪙')}

──────────────────────

💠 *أغنى ${len} مستخدم 💵* _(الأكثر مالًا في البنك)_
👤 ترتيبك: *${sortedBanc.findIndex(u => u.jid === m.sender) + 1}* من *${sortedBanc.length} مستخدم*
${format(sortedBanc, 'banco', '💵')}
`.trim()

  const rankingMessage = await m.reply(text, null, { mentions: conn.parseMention(text) })
  cooldowns.set(chatId, { lastUsed: now, rankingMessage })
}

handler.help = ['leaderboard', 'lb', 'الترتيب', 'التصنيف', 'الأعلى']
handler.tags = ['econ']
handler.command = ['leaderboard', 'lb', 'الترتيب', 'التصنيف', 'الأعلى']
handler.register = true
handler.exp = 3500

export default handler

function formatNumber(num) {
  return num >= 1e6
    ? (num / 1e6).toFixed(1) + 'M'
    : num >= 1e3
    ? (num / 1e3).toFixed(1) + 'k'
    : num.toString()
}
