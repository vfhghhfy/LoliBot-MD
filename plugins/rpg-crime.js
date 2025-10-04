// 💥 الكود الأصلي من elrebelde21 : https://github.com/elrebelde21
// 🧠 الترجمة والواجهة العربية بواسطة GPT-5

import { xpRange } from '../lib/levelling.js'

const cooldown = 3600000; // ⏱️ مدة الانتظار: ساعة واحدة
const handler = async (m, { conn, metadata }) => {
  const now = Date.now();
  const userRes = await m.db.query('SELECT exp, limite, money, crime FROM usuarios WHERE id = $1', [m.sender]);
  const user = userRes.rows[0];
  if (!user) return m.reply('❌ المستخدم غير موجود في قاعدة البيانات.');

  const timePassed = now - (user.crime || 0);
  if (timePassed < cooldown)
    return m.reply(`🚓 الشرطة تراقبك، عد بعد: *${msToTime(cooldown - timePassed)}*`);

  const participants = metadata.participants.map(v => v.id);
  const randomTarget = participants[Math.floor(Math.random() * participants.length)];
  const exp = Math.floor(Math.random() * 7000);
  const diamond = Math.floor(Math.random() * 30);
  const money = Math.floor(Math.random() * 9000);
  const type = Math.floor(Math.random() * 5);

  let text = '';
  switch (type) {
    case 0:
      text = `💰 ${pickRandom(successRob)}\n🪙 حصلت على ${exp} نقطة خبرة (XP)!`;
      await m.db.query('UPDATE usuarios SET exp = exp + $1, crime = $2 WHERE id = $3', [exp, now, m.sender]);
      break;
    case 1:
      text = `🚨 ${pickRandom(failRob)}\n❌ خسرت ${exp} نقطة خبرة (XP).`;
      await m.db.query('UPDATE usuarios SET exp = GREATEST(exp - $1, 0), crime = $2 WHERE id = $3', [exp, now, m.sender]);
      break;
    case 2:
      text = `💰 ${pickRandom(successRob)}\n\n💎 ${diamond} ألماس\n🪙 ${money} عملة`;
      await m.db.query('UPDATE usuarios SET limite = limite + $1, money = money + $2, crime = $3 WHERE id = $4', [diamond, money, now, m.sender]);
      break;
    case 3:
      text = `🚨 ${pickRandom(failRob)}\n\n💎 خسرت ${diamond} ألماس\n🪙 وخسرت ${money} عملة`;
      await m.db.query('UPDATE usuarios SET limite = GREATEST(limite - $1, 0), money = GREATEST(money - $2, 0), crime = $3 WHERE id = $4', [diamond, money, now, m.sender]);
      break;
    case 4:
      text = `💰 سرقت من @${randomTarget.split('@')[0]} مقدار ${exp} XP 😈`;
      await m.db.query('UPDATE usuarios SET exp = exp + $1, crime = $2 WHERE id = $3', [exp, now, m.sender]);
      await m.db.query('UPDATE usuarios SET exp = GREATEST(exp - $1, 0) WHERE id = $2', [500, randomTarget]);
      break;
  }

  return conn.sendMessage(m.chat, { text, mentions: [m.sender, randomTarget] }, { quoted: m });
};

handler.help = ['crime', 'جريمة', 'سرقة', 'اسطو'];
handler.tags = ['اقتصاد'];
handler.command = /^(crime|crimen|جريمة|سرقة|اسطو)$/i;
handler.register = true;
handler.group = true;

export default handler;

// 🕒 تنسيق الوقت المقروء
function msToTime(duration) {
  const minutes = Math.floor((duration / 1000 / 60) % 60);
  const hours = Math.floor((duration / 1000 / 60 / 60) % 24);
  return `${hours.toString().padStart(2, '0')} ساعة و ${minutes.toString().padStart(2, '0')} دقيقة`;
}

// 🔀 اختيار عشوائي من القائمة
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// ✅ قصص النجاح في السرقة
let successRob = [
  'نجحت في سرقة بنك 🏦 وحصلت على غنيمة ضخمة!',
  'قمت بمفاوضة زعيم المافيا وحصلت على مكافأة مجزية 💵',
  'تسللت إلى المتحف وسرقت لوحة نادرة 🎨',
  'استطعت سرقة شاحنة أموال أثناء الليل 💰',
  'قمت بابتزاز رجل أعمال ثري وحصلت على مبلغ محترم 💵',
  'سرقت من الرئيس بنفسك 😱👏',
  'احتلت مكان مدير البنك وسحبت الأموال 💸',
  'تمكنت من التسلل إلى قصر فخم وسرقت مجوهرات 💎',
  'اخترقت نظام البنك وسرقت بعض الأرصدة 🖥️💳',
  'نفذت عملية سرقة مثالية دون أن يلاحظك أحد 🔥',
  'نصبت فخًا لمليونير وسرقت منه ثروة ضخمة 💰',
  'سرقت تاجر أسلحة خطير دون أن يكتشفك أحد 😈',
  'تمكنت من خداع الشرطة أثناء هروبك الذكي 🚗💨',
  'سرقت من المافيا دون أن يعلموا 💣',
  'انتحلت شخصية طيار وسرقت حقيبة مليئة بالنقود 💼💵',
  'اقتحمت بنكًا إلكترونيًا وسرقت عملات رقمية 💻💸',
  'سرقت مجوهرات ملكية أثناء حفلة راقية 👑💎',
];

// 🚨 قصص الفشل في السرقة
let failRob = [
  'الشرطة أمسكت بك 🙀👮‍♂️ وخسرت جزءًا من أموالك!',
  'خذلك شريكك في الجريمة وسلمك للشرطة 😤',
  'حاولت سرقة متجر صغير لكن الكاميرات كشفتك 📸',
  'انطلقت صفارات الإنذار قبل أن تهرب 🚨',
  'أمسك بك صاحب المكان متلبسًا 😭',
  'وقعت في فخ الشرطة أثناء محاولتك الهروب 🚓',
  'تم الإبلاغ عنك وتمت مصادرة أموالك 💸',
  'حاولت اختراق بنك إلكتروني لكنهم تتبعوا عنوانك 💻🚔',
  'خانك أحد أفراد العصابة وأبلغ عنك 👀',
  'انتهى بك المطاف في السجن 🧑‍⚖️ خذ قسطًا من الراحة 😂',
];
