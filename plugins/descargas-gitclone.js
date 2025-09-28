import fetch from 'node-fetch';
const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
const userCaptions = new Map();
const userRequests = {};

let handler = async (m, { args, usedPrefix, command, conn }) => {
  if (!args[0]) throw `*⚠️ يرجى إدخال رابط من GitHub*\n• *مثال:* ${usedPrefix + command} https://github.com/elrebelde21/LoliBot-MD`
  
  if (!regex.test(args[0])) return m.reply(`⚠️ هذا ليس رابط GitHub صحيح يا صديقي 🤡`)
  
  if (userRequests[m.sender]) {
    conn.reply(m.chat, `⏳ *يا @${m.sender.split('@')[0]} انتظر...* هناك طلب قيد المعالجة بالفعل. يرجى الانتظار حتى ينتهي قبل تقديم طلب آخر...`, userCaptions.get(m.sender) || m)
    return;
  }
  
  userRequests[m.sender] = true;
  
  try {   
    const downloadGit = await conn.reply(m.chat, `*⌛ اهدأ ✋، أنا أقوم بإرسال الملف 🚀*\n*إذا لم يصلك الملف فذلك لأن المستودع ثقيل جداً*`, m, {
      contextInfo: { 
        externalAdReply: { 
          mediaUrl: null, 
          mediaType: 1, 
          description: null, 
          title: info.wm, 
          body: ' 💫 سوبر بوت واتساب 🥳 ', 
          previewType: 0, 
          thumbnail: m.pp, 
          sourceUrl: info.nna
        }
      }
    });   
    
    userCaptions.set(m.sender, downloadGit);
    
    let [_, user, repo] = args[0].match(regex) || [];
    repo = repo.replace(/.git$/, '');
    let url = `https://api.github.com/repos/${user}/${repo}/zipball`;
    let filename = (await fetch(url, { method: 'HEAD' })).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1];
    
    await conn.sendFile(m.chat, url, filename, null, m);
  } catch (e) { 
    m.reply(`\`\`\`⚠️ حدث خطأ ⚠️\`\`\`\n\n> *قم بالإبلاغ عن هذا الخطأ لمطور البوت باستخدام الأمر:* #report\n\n>>> ${e} <<<< `);       
    console.log(e);
    handler.limit = 0; // ❌ لا يخصم من الرصيد إذا فشل الأمر
  } finally {
    delete userRequests[m.sender];
  }
};

handler.help = ['gitclone <رابط>'];
handler.tags = ['تحميل'];
handler.command = /gitclone|clonarepo|clonarrepo|repoclonar|جيب_هاب|جيت/i;
handler.register = true;
handler.limit = 2;
handler.level = 1;

export default handler;
