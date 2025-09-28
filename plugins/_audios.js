import { db, getSubbotConfig } from '../lib/postgres.js';
import fs from 'fs';
import path from 'path';

const audiosPath = path.resolve('./src/audios.json');

// دالة لقراءة ملف الإعدادات الديناميكي للردود الصوتية
function getAudios() {
  try {
    return JSON.parse(fs.readFileSync(audiosPath));
  } catch (e) {
    console.error('[❌] خطأ في قراءة ملف audios.json:', e);
    return {};
  }
}

export async function before(m, { conn }) {
  // التحقق من الشروط الأساسية للرسالة
  if (!m || m.fromMe || !m.originalText || m.originalText.length > 500) return;
  
  const botId = conn?.user?.id?.replace(/:\d+/, "");
  const config = await getSubbotConfig(botId);
  const prefixes = Array.isArray(config?.prefix) ? config.prefix : ['.', '/', '#'];
  const texto = m.originalText.trim();

  // تجاهل إذا كان النص يبدأ ببادئة أمر
  if (prefixes.some(p => texto.startsWith(p))) return;
  
  try {
    // التحقق من تفعيل خاصية الردود الصوتية في المجموعة
    const res = await db.query('SELECT audios FROM group_settings WHERE group_id = $1', [m.chat]);
    if (!res.rows[0]?.audios) return;
  } catch (e) {
    console.error('[❌] خطأ في استعلام إعدادات الصوت:', e);
    return;
  }

  const lowerTexto = texto.toLowerCase();
  const chatId = m.chat.trim();
  const audios = getAudios();
  
  // مصادر البحث عن الردود: إعدادات المجموعة ثم الإعدادات العامة
  const sources = [audios[chatId], audios.global].filter(Boolean);

  // البحث عن تطابق للنص مع الأنماط النصية المحددة
  for (const source of sources) {
    const clave = Object.keys(source).find(k => {
      try {
        const regex = new RegExp(source[k].regex, 'i');
        const matches = lowerTexto.match(regex);
        // التأكد من تطابق النص بالكامل مع النمط النصي
        return matches?.[0]?.length === lowerTexto.length;
      } catch {
        return false;
      }
    });

    if (!clave) continue;

    const audio = source[clave];
    try {
      // تحديث حالة البوت لتظهر أنه يسجل صوتاً
      await conn.sendPresenceUpdate('recording', m.chat);
      
      const listaAudios = Array.isArray(audio.audios) ? audio.audios : [audio.audio];
      const elegido = listaAudios[Math.floor(Math.random() * listaAudios.length)];

      // إرسال الرد الصوتي المناسب
      await conn.sendMessage(m.chat, { 
        audio: elegido.startsWith('data:audio/') 
          ? Buffer.from(elegido.split(',')[1], 'base64') 
          : elegido.startsWith('./') || elegido.startsWith('/') 
            ? { url: path.resolve(elegido) } 
            : { url: elegido }, 
        mimetype: 'audio/mpeg', 
        ptt: true 
      }, { quoted: m });
      
      break; // الخروج بعد إرسال الرد الصوتي الأول المتطابق
    } catch (err) {
      console.error('[❌] خطأ في إرسال الرد الصوتي التلقائي:', err);
    }
  }
}
