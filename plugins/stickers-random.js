import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'

// 🧩 قاموس الأفعال التفاعلية
const actions = {
  lick: { e: '👅', v: 'قام بلحس', nsfw: false, aliases: ['لحس'] },
  bite: { e: '🧛‍♂️', v: 'قام بعضّ', nsfw: false, aliases: ['عض'] },
  blush: { e: '😳', v: 'احمرّ خجلاً بجانب', nsfw: false, aliases: ['خجل'] },
  cuddle: { e: '🥰', v: 'احتضن', nsfw: false, aliases: ['عناق', 'حضن'] },
  handhold: { e: '🤝', v: 'أمسك يد', nsfw: false, aliases: ['مصافحة', 'أمسك'] },
  highfive: { e: '✋', v: 'صفق تصفيقة عالية مع', nsfw: false, aliases: ['تصفيق', 'هاي فايف'] },
  poke: { e: '👉', v: 'نقر على', nsfw: false, aliases: ['نقر'] },
  smile: { e: '😊', v: 'ابتسم لـ', nsfw: false, aliases: ['ابتسم'] },
  wave: { e: '👋', v: 'حيّا', nsfw: false, aliases: ['تلويح', 'وداع'] },
  nom: { e: '🍪', v: 'أعطى قطعة حلوى لـ', nsfw: false, aliases: ['حلوى'] },
  dance: { e: '💃', v: 'رقص مع', nsfw: false, aliases: ['رقص'] },
  wink: { e: '😉', v: 'غمز لـ', nsfw: false, aliases: ['غمزة'] },
  happy: { e: '😁', v: 'سعيد مع', nsfw: false, aliases: ['سعيد'] },
  smug: { e: '😏', v: 'نظر بتعالٍ إلى', nsfw: false, aliases: ['متفاخر'] },
  blowjob: { e: '😳', v: 'قام بفعل غير لائق مع', nsfw: true, aliases: ['oral'] }
}

// 🧠 تجهيز أوامر الأفعال + المرادفات
const actionByCommand = Object.entries(actions).reduce((map, [k, v]) => {
  map[k] = { ...v, main: k }
  if (v.aliases) for (const a of v.aliases) map[a] = { ...v, main: k }
  return map
}, {})

let handler = async (m, { conn, command }) => {
  try {
    // 👥 تحديد الشخص المستهدف
    if (m.quoted?.sender) m.mentionedJid.push(m.quoted.sender)
    if (!m.mentionedJid.length) m.mentionedJid.push(m.sender)

    const getName = async jid =>
      (await conn.getName(jid).catch(() => null)) || `+${jid.split('@')[0]}`
    const senderName = await getName(m.sender)
    const mentionedNames = await Promise.all(
      m.mentionedJid.map(async u =>
        u === m.sender ? 'شخص ما' : await getName(u)
      )
    )

    // 🎭 تحديد نوع الفعل
    const act =
      actionByCommand[command.toLowerCase()] || {
        e: '✨',
        v: 'قام بسحر مع',
        nsfw: false,
        main: command.toLowerCase()
      }

    const texto = `${act.e} ${senderName} ${act.v} ${mentionedNames.join(', ')}`
    const tipo = act.nsfw ? 'nsfw' : 'sfw'
    const endpoint = act.main

    // 🔗 جلب الصورة أو الجيف من واجهة waifu.pics
    const { url } = await fetch(
      `https://api.waifu.pics/${tipo}/${endpoint}`
    ).then(r => r.json())

    let stiker
    try {
      stiker = await sticker(null, url, texto)
    } catch (e) {
      console.error('⚠️ خطأ أثناء إنشاء الملصق:', e)
    }

    // 🧷 إرسال الملصق أو الجيف
    if (stiker) {
      await conn.sendFile(
        m.chat,
        stiker,
        'sticker.webp',
        '',
        m,
        true,
        {
          contextInfo: {
            forwardingScore: 200,
            isForwarded: false,
            externalAdReply: {
              showAdAttribution: false,
              title: texto,
              body: '',
              mediaType: 2,
              sourceUrl: '',
              thumbnail: m.pp
            }
          }
        },
        { quoted: m }
      )
      return
    }

    const gifBuffer = await fetch(url).then(r => r.buffer())
    await conn.sendMessage(
      m.chat,
      {
        video: gifBuffer,
        gifPlayback: true,
        caption: texto,
        mentions: m.mentionedJid
      },
      { quoted: m }
    )
  } catch (e) {
    console.error(`[❌ خطأ في ${command}]`, e)
    await conn.reply(m.chat, `❌ حدث خطأ أثناء تنفيذ أمر *${command}*.`, m)
  }
}

// 🧾 المساعدة والوسوم
handler.help = Object.keys(actions).flatMap(k => [
  k,
  ...(actions[k].aliases || [])
])
handler.tags = ['sticker']

// 📜 الأوامر المتاحة بالإنجليزية والعربية
handler.command = new RegExp(
  `^(${Object.keys(actionByCommand).join('|')})$`,
  'i'
)

handler.register = true
export default handler
