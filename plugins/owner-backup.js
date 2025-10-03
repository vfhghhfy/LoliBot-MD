import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  try {
    const d = new Date()
    const date = d.toLocaleDateString('es', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const jid = conn.user?.id || ''
    const idClean = jid.replace(/:\d+/, '').split('@')[0]
    const isMainBot = jid === global.conn?.user?.id
    const sessionPath = isMainBot 
      ? './BotSession/creds.json' 
      : `./jadibot/${idClean}/creds.json`
    
    if (!fs.existsSync(sessionPath)) 
      return await m.reply(`❌ No se encontró el archivo *creds.json* en:\n${sessionPath}\n\n❌ لم يتم العثور على ملف *creds.json* في:\n${sessionPath}`)

    const creds = fs.readFileSync(sessionPath)
    await m.reply(`_📂 *Respaldo de sesión de ${idClean}* (${date})_\n\n_📂 *نسخة احتياطية من جلسة ${idClean}* (${date})_`)
    
    await conn.sendMessage(
      m.sender, 
      { document: creds, mimetype: 'application/json', fileName: `creds.json` }, 
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    await m.react('❌')
    await m.reply('❌ Error al generar el respaldo de la sesión.\n❌ خطأ أثناء إنشاء النسخة الاحتياطية للجلسة.')
  }
}

handler.help = ['backup', 'نسخة']
handler.tags = ['owner']
handler.command = /^(backup|respaldo|copia|نسخة|باكاب|حفظجلسة)$/i
handler.owner = true

export default handler
