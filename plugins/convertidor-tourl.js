import uploadFile, { quax, RESTfulAPI, catbox, uguu, filechan, pixeldrain, gofile, krakenfiles, telegraph } from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import fetch from "node-fetch";
import FormData from "form-data";

const handler = async (m, { args, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || "";

  if (!mime) throw `*\`⚠️ وأين الصورة/الفيديو؟\`*

*• مثال استخدام ${usedPrefix + command}:*

➔ قم بالرد على صورة، ملصق، أو فيديو قصير بالأمر: *${usedPrefix + command}*

سيقوم تلقائياً برفع الملف إلى خوادم مثل *qu.ax*، *catbox*، *cdn-skyultraplus*، إلخ.

🌐 *\`هل تريد اختيار خادم محدد؟\`*
> يمكنك استخدام:

➔ *${usedPrefix + command} quax*  
➔ *${usedPrefix + command} catbox*  
➔ *${usedPrefix + command} sky*
➔ *${usedPrefix + command} uguu*  
➔ *${usedPrefix + command} restfulapi*  
➔ *${usedPrefix + command} gofile*  
➔ *${usedPrefix + command} telegraph*  

📝 *ملاحظات:*
- *يجب أن يكون الملف صورة، ملصق، أو فيديو قصير.*  
- *روابط qu.ax و catbox لا تنتهي.*
- *خادم SkyUltraPlus لا ينتهي صلاحيته وهو أسرع (مدفوع) للحصول على مزيد من المعلومات هنا:* https://cdn.skyultraplus.com`;

  const media = await q.download();
  if (!media) throw "❌ تعذر تحميل الملف.";
  
  const option = (args[0] || "").toLowerCase();
  const services = { 
    quax, 
    restfulapi: RESTfulAPI, 
    catbox, 
    uguu, 
    filechan, 
    pixeldrain, 
    gofile, 
    krakenfiles, 
    telegraph 
  };
  
  try {
    if (option === "sky") {
      let ext = mime.split("/")[1] || "jpg";
      if (ext === "jpeg") ext = "jpg";
      
      const form = new FormData();
      form.append("name", "ملف_البوت");
      form.append("file", media, {
        filename: `رفع.${ext}`,
        contentType: mime,
      });

      const res = await fetch("https://cdn.skyultraplus.com/upload.php", {
        method: "POST",
        headers: {
          ...form.getHeaders(),
          "X-API-KEY": "4aef4a55e558",
        },
        body: form,
      });
      
      const json = await res.json().catch(() => ({}));
      if (!json.ok) throw `الحالة: ${res.status}\nخطأ: ${JSON.stringify(json)}`;
      
      const link = json.file?.url || json.url;
      return m.reply(link);
    }
    
    if (option && services[option]) {
      const link = await services[option](media);
      return m.reply(link);
    }

    const isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime);
    const link = await (isTele ? uploadImage : uploadFile)(media);
    return m.reply(link);
    
  } catch (e) {
    console.error(e);
    throw '❌ خطأ في رفع الملف. جرب خياراً آخر:\n' + 
          Object.keys(services).concat(["sky"]).map(v => `➔ ${usedPrefix}${command} ${v}`).join('\n');
  }
};

handler.help = ['tourl <اختياري_الخادم>'];
handler.tags = ['أدوات'];
handler.command = /^(upload|رفع|رابط)$/i;
handler.register = true;

export default handler;
