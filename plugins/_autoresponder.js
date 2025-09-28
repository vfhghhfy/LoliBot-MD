import fetch from 'node-fetch';
import { blackboxAi, exoml, perplexity } from '../lib/scraper.js';
import { db } from '../lib/postgres.js';

const MAX_TURNS = 12; // الحد الأقصى لعدد الدورات في المحادثة

export async function before(m, { conn }) {
    // تعريف معرفات البوت
    const botIds = [conn.user?.id, conn.user?.lid].filter(Boolean).map(j => j.split('@')[0].split(':')[0]);

    // جمع المعرفات المذكورة في الرسالة
    const mentioned = [
        ...(m.mentionedJid || []),
        m.msg?.contextInfo?.participant,
        m.msg?.contextInfo?.remoteJid
    ].filter(Boolean);

    // التحقق إذا تم ذكر البوت
    const mention = mentioned.some(j => {
        const num = j?.split('@')[0]?.split(':')[0];
        return botIds.includes(num);
    });

    // الكلمات المحفزة للرد التلقائي
    const triggerWords = /\b(بوت|سيمي|اليكسا|لولي بوت)\b/i;
    if (!mention && !triggerWords.test(m.originalText)) return true;

    // الأوامر التي يجب تجاهل الرد عليها
    const no_cmd = /(حجرة|ورقة|مقص|قائمة|حالة|بوتات?|إنشاء بوت|بوت مساعد|فيديو|صوت|خبرة|ألماس|عملات? لولي)/i;
    if (no_cmd.test(m.text)) return true;

    // تحديث حالة الكتابة
    await conn.sendPresenceUpdate("composing", m.chat);
    
    const chatId = m.chat;
    const query = m.text;
    let memory = [];
    let systemPrompt = '';
    let ttl = 86400; // افتراضي: يوم واحد بالثواني

    try {
        // جلب إعدادات الرد التلقائي من قاعدة البيانات
        const { rows } = await db.query('SELECT sautorespond, memory_ttl FROM group_settings WHERE group_id = $1', [chatId]);
        systemPrompt = rows[0]?.sautorespond || '';
        ttl = rows[0]?.memory_ttl ?? 86400;
    } catch (e) {
        console.error("[❌] خطأ في جلب الإعدادات:", e.message);
    }

    // إذا لم يكن هناك إعداد مخصص، جلب الإعداد الافتراضي
    if (!systemPrompt) {
        systemPrompt = await fetch('https://raw.githubusercontent.com/elrebelde21/LoliBot-MD/main/src/text-chatgpt.txt').then(v => v.text());
    }

    try {
        // جلب سجل المحادثة من الذاكرة
        const res = await db.query('SELECT history, updated_at FROM chat_memory WHERE chat_id = $1', [chatId]);
        const { history = [], updated_at } = res.rows[0] || {};
        
        // التحقق من انتهاء صلاحية الذاكرة
        const expired = !ttl || (updated_at && Date.now() - new Date(updated_at) > ttl * 1000);
        memory = expired ? [] : history;
    } catch (e) {
        console.error("❌ لا يمكن جلب الذاكرة من قاعدة البيانات:", e.message);
    }

    // تهيئة الذاكرة إذا كانت فارغة أو غير متوافقة
    if (!memory.length || memory[0]?.role !== 'system' || memory[0]?.content !== systemPrompt) {
        memory = [{ role: 'system', content: systemPrompt }];
    }

    // إضافة رسالة المستخدم إلى الذاكرة
    memory.push({ role: 'user', content: query });
    
    // الحفاظ على حجم الذاكرة ضمن الحد المسموح
    if (memory.length > MAX_TURNS * 2 + 1) {
        memory = [memory[0], ...memory.slice(-MAX_TURNS * 2)];
    }

    let result = '';
    try {
        // محاولة الحصول على رد من ExoML
        result = await exoml.generate(memory, systemPrompt, 'llama-4-scout');
    } catch (err) {
        console.error("❌ خطأ في ExoML، استخدام البديل:", err);
        // استخدام البديل إذا فشل المصدر الرئيسي
        const bb = await blackboxAi(query);
        result = bb?.data?.response || "❌ لم يتم الحصول على رد.";
    }

    // التأكد من وجود رد صالح
    if (!result || result.trim().length < 2) result = "🤖 ...";

    // إضافة رد المساعد إلى الذاكرة
    memory.push({ role: 'assistant', content: result });
    
    try {
        // حفظ الذاكرة المحدثة في قاعدة البيانات
        await db.query(`INSERT INTO chat_memory (chat_id, history, updated_at)
              VALUES ($1, $2, NOW())
              ON CONFLICT (chat_id) DO UPDATE SET history = $2, updated_at = NOW()
            `, [chatId, JSON.stringify(memory)]);
    } catch (e) {
        console.error("❌ لا يمكن حفظ الذاكرة:", e.message);
    }

    // إرسال الرد ووضع علامة مقروءة
    await conn.reply(m.chat, result, m);
    await conn.readMessages([m.key]);

    return false;
}
