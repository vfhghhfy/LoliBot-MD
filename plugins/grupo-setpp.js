import * as Jimp from "jimp";
import { S_WHATSAPP_NET } from "@whiskeysockets/baileys";

let handler = async (m, { conn }) => {
  try {
    let groupId = m.chat;
    let quotedMsg = m.quoted ? m.quoted : m;
    
    if (!m.quoted) {
        return m.reply(`🎨 *تَغْيِيرُ صُورَةِ الْمَجْمُوعَةِ*
        
🖼️ *يُرجَى الرَّدُّ عَلَى الصُّورَةِ الَّتِي تُرِيدُ وَضْعَهَا كَصُورَةٍ لِلْمَجْمُوعَةِ*
        
✨ *الاسْتِخْدَامُ:*
1. أَرْسِلْ صُورَةً إِلَى الْمَجْمُوعَةِ
2. اُرْدُدْ عَلَى الصُّورَةِ بِالأَمْرِ:
!صورة_المجموعة`);
    }
    
    let media = await quotedMsg.download();

    async function processImage(media) {
      const image = await Jimp.read(media);
      const resizedImage = image.getWidth() > image.getHeight()
        ? image.resize(720, Jimp.AUTO)
        : image.resize(Jimp.AUTO, 720);
      return {
        img: await resizedImage.getBufferAsync(Jimp.MIME_JPEG),
      };
    }

    var { img: processedImage } = await processImage(media);

    conn.query({
      tag: "iq",
      attrs: { target: groupId, to: S_WHATSAPP_NET, type: "set", xmlns: "w:profile:picture" },
      content: [{ tag: "picture", attrs: { type: "image" }, content: processedImage }],
    });

    const successMessage = `🎉 *تَمَّ تَغْيِيرُ صُورَةِ الْمَجْمُوعَةِ*
    
╔════════════════════╗
   🖼️ صُورَةٌ جَدِيدَةٌ
╚════════════════════╝

✨ تـمّ تـغـيـيـر صـورَةِ الـمـجـمـوعـةِ بـنـجـاحٍ

🖼️ الـصـورَةِ الـجـدِيدَةِ سَتَظْهَرُ لِجَمِيعِ الأَعْضَاءِ`;

    await m.reply(successMessage);
    
    // ردود فعل متعددة بالإيموجي
    await m.react("🖼️");
    await m.react("✨");
    await m.react("✅");
    
  } catch (error) {
    console.log(error);
    
    const errorMessage = `❌ *حَدَثَ خَطَأٌ فِي تَغْيِيرِ الصُّورَةِ*
    
⚠️ الأَسْبَابُ الْمُمْكِنَةُ:
• الصُّورَةُ غَيْرُ صَالِحَةٍ
• الْبُوتُ لَيْسَ لَدَيْهِ الصِّلاحِيَّةُ الْكَافِيَةُ
• حَجْمُ الصُّورَةِ كَبِيرٌ جِدًّا
• مُشْكِلَةٌ فِي الْاتِّصَالِ

🔄 يُرْجَى الْمُحَاوَلَةُ مَرَّةً أُخْرَى بِصُورَةٍ أُخْرَى`;
    
    await m.reply(errorMessage);
    await m.react("❌");
  }
};

// 🎪 الأوامر العربية المزخرفة
handler.help = ["setppgc", "صورة_المجموعة", "تغيير_صورة", "صورة_جديدة"];
handler.tags = ["group", "المجموعة", "🖼️"];
handler.command = /^(setpp(group|grup|gc)?|صورة_المجموعة|تغيير_صورة|صورة_جديدة)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.register = true;

export default handler;
