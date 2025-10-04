import { db, getSubbotConfig } from '../lib/postgres.js'

const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i

let handler = async (m, { conn, text, isOwner }) => {
  // محاولة التقاط أي رابط من النص أو الرسائل المقتبسة
  let quotedText = m.quoted?.text || ""
  let extText = m.quoted?.message?.extendedTextMessage?.text || ""
  let allText = `${quotedText}\n${extText}\n${text}`
  let link = allText.match(linkRegex)?.[0]
  let [_, code] = link ? link.match(linkRegex) : []

  if (!code) throw `🤔 أين الرابط؟ يرجى إدخال رابط مجموعة صالح لينضم البوت إليها.\n\n📝 *طريقة الاستخدام:*\nاكتب: #انضم <رابط> [المدة]\n- إن لم تحدد المدة، سينضم البوت لمدة 30 دقيقة (للمستخدمين) أو يوم واحد (للأصحاب).\n\n📌 *أمثلة:*\n- #انضم ${info.nn}\n- #انضم ${info.nn2} 60 دقيقة (ساعة واحدة)\n- #انضم ${info.nn} 2 يوم (يومان)\n- #انضم ${info.nn} 1 شهر (30 يومًا)`

  let waMeMatch = allText.match(/wa\.me\/(\d{8,})/)
  let solicitante = waMeMatch ? waMeMatch[1] : m.sender.split('@')[0]

  // جلب إعدادات البوت الفرعي
  const botConfig = await getSubbotConfig(conn.user.id)
  const prestar = botConfig.prestar === undefined ? true : botConfig.prestar
  const timeMatch = text.match(/(\d+)\s*(دقيقة|دقايق|minuto|hora|ساعة|día|يوم|mes|شهر)/i)

  let time, unit
  if (!prestar && isOwner) {
    time = timeMatch ? parseInt(timeMatch[1]) : 1
    unit = timeMatch ? timeMatch[2].toLowerCase() : 'يوم'
  } else {
    time = timeMatch ? parseInt(timeMatch[1]) : 30
    unit = timeMatch ? timeMatch[2].toLowerCase() : 'دقيقة'
  }

  // تحويل الوقت إلى ميلي ثانية
  let timeInMs
  if (unit.includes('دقيقة') || unit.includes('minuto')) {
    timeInMs = time * 60 * 1000
  } else if (unit.includes('hora') || unit.includes('ساعة')) {
    timeInMs = time * 60 * 60 * 1000
  } else if (unit.includes('día') || unit.includes('يوم')) {
    timeInMs = time * 24 * 60 * 60 * 1000
  } else if (unit.includes('mes') || unit.includes('شهر')) {
    timeInMs = time * 30 * 24 * 60 * 60 * 1000
  }

  // إذا لم يُسمح بالبقاء إلا بموافقة المالك
  if (!prestar && !isOwner) {
    await m.reply(`📩 تم إرسال رابط مجموعتك إلى المالك للمراجعة.\n━━━━━━━━━━━━━━━\n⚠️ *قد يتم رفض الطلب في الحالات التالية:*\n1️⃣ البوت مشغول أو مكتظ.\n2️⃣ تمت إزالة البوت مسبقًا من مجموعتك.\n3️⃣ المجموعة لا تلتزم بسياسات الاستخدام.\n4️⃣ المجموعة تحتوي أقل من 80 عضوًا.\n5️⃣ تم تغيير رابط المجموعة.\n6️⃣ قرار الرفض من المالك مباشرة.\n━━━━━━━━━━━━━━━\n⌛ *قد تستغرق الموافقة عدة ساعات، الرجاء التحلي بالصبر.*`)
    let ownerJid = "573226873710@s.whatsapp.net"
    if (ownerJid !== conn.user.jid) {
      await conn.sendMessage(ownerJid, {
        text: `*📬 طلب انضمام بوت إلى مجموعة جديدة*\n\n👤 طالب الانضمام:\nwa.me/${m.sender.split('@')[0]}\n🔗 رابط المجموعة:\nhttp://${link}\n\n⏳ المدة المطلوبة: ${time} ${unit}${time > 1 ? 's' : ''}`,
        contextInfo: { mentionedJid: [m.sender] }
      })
    }
    return
  }

  // إذا كان الانضمام مسموحًا (من المالك أو خاصية prestar مفعّلة)
  if (prestar || isOwner) {
    if (!isOwner) {
      const costPerHour = 100
      const cost = Math.ceil((timeInMs / (60 * 60 * 1000)) * costPerHour)
      let { rows } = await db.query('SELECT limite FROM usuarios WHERE id = $1', [m.sender])
      let limite = rows[0]?.limite ?? 0
      if (limite < cost) 
        return m.reply(`❌ ليس لديك عدد كافٍ من الجواهر.\nتحتاج إلى *${cost} جوهرة* لضم البوت إلى المجموعة.`)
      await db.query('UPDATE usuarios SET limite = limite - $1 WHERE id = $2', [cost, m.sender])
      await m.reply(`⌛ يرجى الانتظار 3 ثوانٍ، سيتم انضمام البوت قريبًا.\n\n> تم خصم *${cost} جوهرة* من حسابك.`)
    }

    // محاولة الانضمام إلى المجموعة
    let res
    try {
      res = await conn.groupAcceptInvite(code)
    } catch (e) {
      console.error("خطأ أثناء محاولة الانضمام إلى المجموعة:", e)
      return m.reply("❌ لم أستطع الانضمام إلى المجموعة. تحقق من الرابط وحاول مجددًا.")
    }

    await new Promise(r => setTimeout(r, 3000))
    let groupMeta = await conn.groupMetadata(res)
    let groupName = groupMeta.subject || "هذه المجموعة"

    // رسالة الترحيب في المجموعة الجديدة
    let mes = `👋🏻 مرحبًا بالجميع!\n\nأنا *${conn.user.name}*.\nتمت دعوتي بواسطة *@${solicitante}*.\nلرؤية قائمة الأوامر اكتب: *#قائمة*\n\nسيغادر البوت تلقائيًا بعد:\n${time} ${unit}${time > 1 ? 's' : ''}`
    await conn.sendMessage(res, { text: mes, contextInfo: { mentionedJid: [`${solicitante}@s.whatsapp.net`] } })

    // حفظ وقت انتهاء الانضمام في قاعدة البيانات
    await db.query(
      'INSERT INTO group_settings (group_id, expired) VALUES ($1, $2) ON CONFLICT (group_id) DO UPDATE SET expired = $2',
      [res, Date.now() + timeInMs]
    )

    await m.reply(`✅ تم انضمام البوت إلى المجموعة بنجاح لمدة *${time} ${unit}${time > 1 ? 's' : ''}*`)
  }
}

handler.help = ['join [chat.whatsapp.com] [المدة]']
handler.tags = ['المالك']

// الأوامر المتاحة باللغتين (العربية + الإسبانية + الإنجليزية)
handler.command = /^(unete|join|nuevogrupo|unir|unite|unirse|entra|entrar|انضم|انضمام|ادخل)$/i

handler.register = true
export default handler
