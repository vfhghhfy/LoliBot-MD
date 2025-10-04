import fetch from 'node-fetch'
import axios from 'axios'
import hispamemes from 'hispamemes'
import { db } from '../lib/postgres.js'

// 🧠 محتوى الأوامر (صور - أنمي - ميمز - شخصيات)
const contenido = {
  waifu: { label: '*💖 وايفو جميلة 💖*', api: 'waifu', nsfwApi: 'waifu', type: 'api', aliases: ['وايفو'] },
  neko: { label: '🐱 نيكو (قطة)', api: 'neko', nsfwApi: 'neko', type: 'api', aliases: ['قطه', 'نيكو', 'نيان'] },
  shinobu: { label: '🍡 شينوبو', api: 'shinobu', type: 'api', aliases: ['شينوبو'] },
  megumin: { label: '💥 ميغومين', api: 'megumin', type: 'api', aliases: ['ميغومين', 'ميغ'] },
  bully: { label: '😈 تنمّر', api: 'bully', type: 'api', aliases: ['تنمر'] },
  cuddle: { label: '🥰 عناق', api: 'cuddle', type: 'api', aliases: ['عناق'] },
  cry: { label: '😭 بكاء', api: 'cry', type: 'api', aliases: ['بكاء'] },
  bonk: { label: '🔨 ضربة', api: 'bonk', type: 'api', aliases: ['ضرب'] },
  wink: { label: '😉 غمزة', api: 'wink', type: 'api', aliases: ['غمزه'] },
  handhold: { label: '🤝 إمساك يد', api: 'handhold', type: 'api', aliases: ['يد', 'إمساك'] },
  nom: { label: '🍪 أكل بسكويت', api: 'nom', type: 'api', aliases: ['أكل', 'بسكويت'] },
  glomp: { label: '💞 قفزة حب', api: 'glomp', type: 'api', aliases: ['قفزة', 'عناق_قوي'] },
  happy: { label: '😁 سعادة', api: 'happy', type: 'api', aliases: ['سعيد', 'فرح'] },
  poke: { label: '👉 نكزة', api: 'poke', type: 'api', aliases: ['نكزة'] },
  dance: { label: '💃 رقص', api: 'dance', type: 'api', aliases: ['رقص'] },
  meme: { label: '🤣 ميم مضحك', isMeme: true, aliases: ['ميم', 'ميمز'] },
  loli: { label: '*😍 لولي جميلة 😍*', type: 'json', url: 'https://raw.githubusercontent.com/elrebelde21/The-LoliBot-MD2/main/src/randow/loli.json', aliases: ['لولي', 'كواي'] },
  navidad: { label: '🎄 عيد الميلاد', type: 'json', url: 'https://raw.githubusercontent.com/elrebelde21/The-LoliBot-MD2/main/src/randow/navidad.json', aliases: ['كريسماس'] },
  messi: { label: '*🇦🇷 ميسي الأسطورة*', type: 'json', url: 'https://raw.githubusercontent.com/elrebelde21/The-LoliBot-MD2/main/src/randow/messi.json', aliases: ['ميسي'] },
  ronaldo: { label: '_*سيووووووو*_ ⚽', type: 'json', url: 'https://raw.githubusercontent.com/elrebelde21/The-LoliBot-MD2/main/src/randow/CristianoRonaldo.json', aliases: ['رونالدو', 'كريستيانو'] }
}

// 🧩 إنشاء خريطة لجميع الأوامر والمرادفات
const aliasMap = {}
for (const [key, item] of Object.entries(contenido)) {
  aliasMap[key.toLowerCase()] = item
  for (const alias of (item.aliases || [])) {
    aliasMap[alias.toLowerCase()] = item
  }
}

// ⚙️ المعالج الرئيسي
let handler = async (m, { conn, command }) => {
  try {
    const item = aliasMap[command.toLowerCase()]
    if (!item) return m.reply('❌ الأمر غير معروف، حاول كتابة اسم آخر.')

    // 🧠 قسم الميمز
    if (item.isMeme) {
      const url = await hispamemes.meme()
      conn.sendFile(m.chat, url, 'error.jpg', `😂🤣 ميم عشوائي`, m)
      return
    }

    // 🖼️ محتوى من ملفات JSON (قوائم صور جاهزة)
    if (item.type === 'json') {
      const res = await axios.get(item.url)
      const imgs = res.data
      const img = imgs[Math.floor(Math.random() * imgs.length)]
      await conn.sendMessage(m.chat, { image: { url: img }, caption: item.label }, { quoted: m })
      return
    }

    // 🌐 صور من API خارجي
    if (item.type === 'api') {
      let apiPath = `https://api.waifu.pics/sfw/${item.api}`
      try {
        const { rows } = await db.query(`SELECT modohorny FROM group_settings WHERE group_id = $1`, [m.chat])
        const isNSFW = rows[0]?.modohorny === true
        if (isNSFW && item.nsfwApi) {
          apiPath = `https://api.waifu.pics/nsfw/${item.nsfwApi}`
        }
      } catch (err) {
        console.error('❌ خطأ أثناء التحقق من إعداد NSFW:', err)
      }

      const res = await fetch(apiPath)
      const { url } = await res.json()
      await conn.sendFile(m.chat, url, 'error.jpg', item.label, m)
      return
    }

    // 🎞️ في حال كان المحتوى فيديو
    if (item.type === 'video') {
      const vid = item.vids[Math.floor(Math.random() * item.vids.length)]
      await conn.sendFile(m.chat, vid, 'error.mp4', item.label, m)
      return
    }

    // 🖼️ في حال كانت صور ثابتة
    if (item.type === 'static') {
      const img = item.imgs[Math.floor(Math.random() * item.imgs.length)]
      await conn.sendMessage(m.chat, {
        image: { url: img },
        caption: item.label
      }, { quoted: m })
      return
    }

  } catch (e) {
    console.error('[❌ خطأ في إرسال الصورة]', e)
    m.reply('❌ حدث خطأ أثناء إرسال الصورة، حاول لاحقًا.')
  }
}

// 📜 دعم الأوامر العربية والإنجليزية
handler.command = new RegExp(`^(${Object.keys(aliasMap).join('|')})$`, 'i')
handler.help = Object.keys(aliasMap)
handler.tags = ['صور', 'عشوائي', 'fun']
handler.register = true

export default handler
