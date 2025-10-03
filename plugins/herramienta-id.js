let handler = async (m, { conn, text, isOwner }) => {
  let USER_ID = m.user.lid 
  
  // رد وهمي لإظهار المعرف (LID)
  conn.fakeReply(
    m.chat, 
    USER_ID, 
    '0@s.whatsapp.net', 
    `👇 *هنا رقمك المخفي (LID)* 👇\n\n🔑 ${USER_ID}`, 
    'status@broadcast'
  )
  // أو لو تبي رد عادي بدل الوهمي:
  // m.reply(`🔑 رقمك المخفي (LID): ${USER_ID}`)
}

handler.help = ['mylid', 'معرفي', 'لِد']
handler.tags = ['tools']
handler.command = /^(mylid|معرفي|لِد)$/i  // يدعم أوامر بالعربي والإنجليزي

export default handler
