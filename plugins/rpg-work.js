import { db } from '../lib/postgres.js'

const handler = async (m, { conn }) => {
  const cooldown = 600_000 //⏱️ 10 دقائق
  const now = Date.now()
  const res = await m.db.query('SELECT exp, lastwork FROM usuarios WHERE id = $1', [m.sender])
  const user = res.rows[0]
  const lastWork = Number(user?.lastwork) || 0
  const remaining = Math.max(0, lastWork + cooldown - now)

  if (remaining > 0)
    return conn.reply(m.chat, `⏳ يجب أن تنتظر ${msToTime(remaining)} قبل أن تعمل مجددًا.`, m)

  const xpGanado = Math.floor(Math.random() * 6500)
  await m.db.query(
    `UPDATE usuarios SET exp = exp + $1, lastwork = $2 WHERE id = $3`,
    [xpGanado, now, m.sender]
  )

  await conn.reply(
    m.chat,
    `🛠 ${pickRandom(work)} *${formatNumber(xpGanado)} نقطة خبرة (XP)*`,
    m
  )
}

handler.help = ['عمل', 'work', 'اشتغل', 'شغل']
handler.tags = ['اقتصاد', 'econ']
handler.command = /^(work|trabajar|chambear|w|chamba|عمل|اشتغل|شغل)$/i
handler.register = true

export default handler

function msToTime(duration) {
  const totalSeconds = Math.floor(duration / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes} دقيقة و ${seconds} ثانية`
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function formatNumber(num) {
  return num.toLocaleString('ar-EG').replace(/,/g, '.')
}

const work = [
  'أنت خيميائي بارع تقوم بتقطير جرعات سحرية غامضة وتكسب:',
  'تصبح صياد كنوز شجاعًا وتجد ثروات عظيمة فتحصل على:',
  'تساعد في تنظيم مجموعة البوت وتربح:',
  'تعمل كحارس في مملكة سحرية وتحصل على:',
  'تكتشف تقنية جديدة وتنال:',
  'تصلح أجهزة قديمة وتكسب:',
  'تدرب وحشًا أسطوريًا وتربح:',
  'تعزف لحنًا جميلًا وتكسب:',
  'تنظف الساحة العامة وتحصل على:',
  'تساعد أحد الأصدقاء وتكسب:',
  'تصمم تطبيقًا ناجحًا وتربح:',
  'تقاتل الأعداء في معركة بطولية وتكسب:',
  'تعثر على كنز مفقود وتكسب:',
  'تعمل طباخًا في قصر الملك وتحصل على:',
  'تكتب كتابًا عن السحر وتربح:',
  'تسافر عبر الزمن وتكسب:',
  'تحقق فوزًا في بطولة الألعاب وتربح:',
  'تصلح درعًا مكسورًا وتحصل على:',
  'تستكشف كوكبًا جديدًا وتكسب:',
  'تفتح متجرًا ناجحًا وتربح:',
]
