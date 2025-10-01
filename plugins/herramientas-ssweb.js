import fetch from 'node-fetch'

let handler = async (m, { conn, command, args }) => {
  if (!args[0]) return m.reply(`⚠️ **يرجى إدخال رابط لأخذ لقطة للشاشة، مثال:** https://example.com`)
  
  await m.react('⌛')
  
  try {
    let ss = await (await fetch(`https://api.dorratz.com/ssweb?url=${args[0]}`)).buffer()
    conn.sendFile(m.chat, ss, 'screenshot.png', '✅ تم أخذ لقطة الشاشة بنجاح', m)
    await m.react('✅')
  } catch {
    handler.limit = false
    await m.react('❌')
  }
}

// الأوامر العربية المضافة
handler.help = [
  'لقطة', 
  'سكرين', 
  'لقطةشاشة', 
  'ss', 
  'ssweb'
].map(v => v + ' *<رابط>*')

handler.tags = ['أدوات', 'tools']
handler.command = /^(لقطة|سكرين|لقطةشاشة|ss(web)?f?)$/i
handler.register = true 
handler.limit = 1

export default handler
