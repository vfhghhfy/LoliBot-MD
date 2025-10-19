import axios from 'axios';

let memory = {};

const handler = async (m, { conn, command, text }) => {
  const userId = m.sender;

  if (command === 'حذف_ذاكرة_دزاري') {
    delete memory[userId];
    return m.reply('🔥 تم حذف ذاكرة اوسامو دزاري! لن يتذكر أي شيء الآن.');
  }

  if (!text) {
    return m.reply('> *🎭 مرحبًا، أنا دزاري، كيف يمكنني مساعدتك؟ 🤖*\n\n> *مثال على الأسئلة التي يمكنك طرحها:* \n\n> *.دزاري من هو آخر رسول؟* \n> *.دزاري كيف حالك؟!* \n\n> *💡 دزاري في الخدمة! 👏🏻*');
  }

  await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

  if (!memory[userId]) {
    memory[userId] = [];
  }

  memory[userId].push({ role: 'user', content: text });

  try {
    const systemMessage = `أنت أوسامو دزاري من أنمي Bungo Stray Dogs. أنت:
- عباقري ذو ذكاء خارق
- تحب فكرة الانتحار المزدوج مع امرأة جميلة
- ساخر ومرح في نفس الوقت  
- عضو في وكالة الكلاب الضالة
- لديك قدرة "لا ضوء في الأعماق"
- تتحدث بطريقة جذابة وغامضة
- ومطورك هو دزاري المز  
- وتفاعل با ايموجي جميل وكيوت
وتحب الانتحار كثير`;

    const conversationHistory = memory[userId].slice(-5).map(entry => `${entry.role}: ${entry.content}`).join('\n');
    const query = `${systemMessage}\n\nالمحادثة السابقة:\n${conversationHistory}\n\nالنص الجديد:\n${text}`;

    const res = await axios.get(`https://alakreb.vercel.app/api/ai/gpt?q=${encodeURIComponent(query)}`, { timeout: 10000 });
    const answer = res.data?.message || 'هذا ليس مهمًا بالنسبة لي. حاول مرة أخرى بسؤال أكثر جدية!';

    await conn.sendMessage(m.chat, {
      text: "\n" 
            + answer + 
            "\n\n> © Dazai",
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: '𝐃𝐀𝐙𝐀𝐈',
          body: 'دزاري',
          thumbnailUrl: 'https://files.catbox.moe/nhyvvx.jpg',
          sourceUrl: 'https://whatsapp.com/channel/0029VapxAcz4SpkEe0XN6X3V'
        },
      },
    }, { quoted: m });

    memory[userId].push({ role: 'assistant', content: answer });
  } catch (e) {
    console.error(e);
    m.reply('⚠️ حدث خطأ أثناء معالجة طلبك. حاول مرة أخرى لاحقًا!');
  }
};

handler.help = ['حذف_ذاكرة_دزاري'];
handler.tags = ['AI'];
handler.command = /^(دزاري|حذف_ذاكرة_بوت)$/i;

export default handler;
