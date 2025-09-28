import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { spawn } from "child_process"
import gTTS from "node-gtts"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const TMP_DIR = path.join(__dirname, "../tmp")
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args.length && !m.quoted?.text) return m.reply(`*طريقة الاستخدام:* ${usedPrefix + command} <صوت|لغة> <نص>\n\n*الأصوات:* مجهول, روبوت, عميق, حاد, طفل, شيطان\n*اللغات:* ar, en, es, fr, إلخ.\n\nأمثلة:\n${usedPrefix + command} مجهول مرحبا\n${usedPrefix + command} en hello`)
  
  m.react("🎙️")
  conn.sendPresenceUpdate('recording', m.chat)
   
  const first = args[0].toLowerCase()
  const voces = ["مجهول", "روبوت", "عميق", "حاد", "طفل", "شيطان"]
  let effect = null, lang = "ar", text = ""

  if (voces.includes(first)) {
    effect = first
    text = args.slice(1).join(" ")
  } else if (/^[a-z]{2}$/.test(first)) {
    lang = first
    text = args.slice(1).join(" ")
  } else {
    text = args.join(" ")
  }

  if (!text) return m.reply("⚠️ يرجى كتابة نص لتحويله إلى صوت.")
  
  try {
    const wav = await synthTTS(text, lang)
    const ogg = await applyEffect(wav, effect)
    const buffer = fs.readFileSync(ogg)
    await conn.sendMessage(m.chat, { audio: buffer, mimetype: "audio/ogg; codecs=opus", ptt: true }, { quoted: m })
    fs.unlinkSync(wav); fs.unlinkSync(ogg)
  } catch (e) {
    m.reply("❌ خطأ: " + e.message)
  }
}

handler.help = ["tts <صوت|لغة> <نص>"]
handler.tags = ["أدوات"]
handler.command = /^(ج?تس)$/i
handler.register = true;

export default handler

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", args)
    let stderr = ""
    ff.stderr.on("data", (d) => (stderr += d.toString()))
    ff.on("close", (code) => {
      if (code === 0) resolve(true)
      else reject(new Error("خطأ في ffmpeg:\n" + stderr))
    })
  })
}

async function synthTTS(text, lang = "ar") {
  const outPath = path.join(TMP_DIR, `${Date.now()}-raw.wav`)
  const tts = gTTS(lang)
  await new Promise((res, rej) => {
    tts.save(outPath, text, (err) => (err ? rej(err) : res()))
  })
  return outPath
}

async function applyEffect(inputWav, style = null) {
  const outPath = path.join(TMP_DIR, `${Date.now()}-out.ogg`)
  const styleFilters = {
    مجهول: "asetrate=44100*0.75,lowpass=f=1400,highpass=f=180",
    روبوت: "chorus=0.6:0.9:55:0.4:0.25:2",
    عميق: "asetrate=44100*0.80",
    حاد: "asetrate=44100*1.20",
    طفل: "asetrate=44100*1.25,treble=g=5",
    شيطان: "asetrate=44100*0.65,areverb=70:70:100",
  }
  const af = style && styleFilters[style] ? styleFilters[style] : "anull"
  const args = [
    "-y",
    "-i", inputWav,
    "-af", af,
    "-ac", "1",
    "-ar", "48000",
    "-c:a", "libopus",
    "-b:a", "48k",
    outPath,
  ]
  await runFFmpeg(args)
  return outPath
}
