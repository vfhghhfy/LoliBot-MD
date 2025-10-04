let handler = async (m, { conn }) => {
  // قائمة روابط النرد (صور أو ملصقات)
  let dados = [
    'https://tinyurl.com/gdd01',
    'https://tinyurl.com/gdd02',
    'https://tinyurl.com/gdd003',
    'https://tinyurl.com/gdd004',
    'https://tinyurl.com/gdd05',
    'https://tinyurl.com/gdd006'
  ];

  // اختيار رابط عشوائي من القائمة
  let url = dados[Math.floor(Math.random() * dados.length)];

  // تفاعل الإيموجي 🎲 عند تنفيذ الأمر
  m.react("🎲");

  // إرسال الملصق العشوائي
  conn.sendFile(
    m.chat,
    url,
    'sticker.webp',
    '',
    m,
    true,
    {
      contextInfo: {
        'forwardingScore': 200,
        'isForwarded': false,
        externalAdReply: {
          showAdAttribution: false,
          title: `${m.pushName} 🎯`,
          body: `🎲 تم رمي النرد... هل يحالفك الحظ؟`,
          mediaType: 2,
          sourceUrl: info.wm,
          thumbnail: m.pp
        }
      }
    },
    { quoted: m }
  );
};

handler.help = ['dado', 'dados', 'نرد', 'حظ'];
handler.tags = ['game'];
handler.command = /^(dado|dados|dadu|نرد|نرّد|حظ)$/i;
handler.register = true;

export default handler;
