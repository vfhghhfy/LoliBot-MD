const handler = async (m, { conn, args, command, usedPrefix }) => {
const cooldown = 30_000;
const now = Date.now();
const res = await m.db.query('SELECT exp, wait FROM usuarios WHERE id = $1', [m.sender]);
const user = res.rows[0];
const lastWait = Number(user?.wait) || 0;
const remaining = lastWait + cooldown - now;

if (remaining > 0) return conn.fakeReply(m.chat, `*🕓 تمهل يا بطل 🤚، انتظر ${msToTime(remaining)} قبل استخدام الأمر مرة أخرى*`, m.sender, `لا تُزعج`, 'status@broadcast');
if (args.length < 2) return conn.reply(m.chat, `⚠️ تنسيق غير صحيح. استخدم: ${usedPrefix + command} <لون> <مبلغ>\n\nمثال: ${usedPrefix + command} أحمر 100`, m);
const color = args[0].toLowerCase();
const betAmount = parseInt(args[1]);

// تحويل الألوان العربية
const colorTraducido = traducirColor(color);
if (!['red', 'black', 'green', 'أحمر', 'أسود', 'أخضر'].includes(colorTraducido)) return conn.reply(m.chat, '🎯 لون غير صالح. استخدم: "أحمر"، "أسود" أو "أخضر".', m);
if (isNaN(betAmount) || betAmount <= 0) return conn.reply(m.chat, '❌ يجب أن يكون المبلغ رقمًا موجبًا.', m);
if (user.exp < betAmount) return conn.reply(m.chat, `❌ ليس لديك خبرة كافية للمراهنة. لديك *${formatExp(user.exp)} XP*`, m);

const resultColor = getRandomColor();
const isWin = resultColor === colorTraducido;
let winAmount = 0;

if (isWin) {
winAmount = colorTraducido === 'green' ? betAmount * 14 : betAmount * 2;
}

const newExp = user.exp - betAmount + winAmount;
await m.db.query(`UPDATE usuarios SET exp = $1, wait = $2 WHERE id = $3`, [newExp, now, m.sender]);

// تحويل النتيجة للعربية للعرض
const resultColorTraducido = traducirColorParaMostrar(resultColor);
const colorApostadoTraducido = traducirColorParaMostrar(colorTraducido);

return conn.reply(m.chat, `😱 سقطت الروليت على *${resultColorTraducido}*\n${isWin ? `🎉 ربحت *${formatExp(winAmount)} XP*!` : `💀 خسرت *${formatExp(betAmount)} XP*`}`, m);
};

// الأوامر العربية المضافة
handler.help = ['rt <color> <cantidad>', 'روليت <لون> <مبلغ>', 'روله <لون> <مبلغ>'];
handler.tags = ['game', 'القمار', 'الألعاب'];
handler.command = ['rt', 'روليت', 'روله', 'ruleta'];
handler.register = true;

export default handler;

function getRandomColor() {
  const random = Math.random() * 100;
  if (random < 47.5) return 'red';
  if (random < 95) return 'black';
  return 'green';
}

function formatExp(amount) {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k (${amount.toLocaleString()})`;
  return amount.toLocaleString();
}

function msToTime(duration) {
  if (isNaN(duration) || duration <= 0) return '0ث';
  const totalSeconds = Math.floor(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes > 0 ? minutes + 'د ' : ''}${seconds}ث`;
}

// دالة لترجمة الألوان من العربية
function traducirColor(color) {
  const traducciones = {
    'أحمر': 'red',
    'احمر': 'red',
    'أسود': 'black', 
    'اسود': 'black',
    'أخضر': 'green',
    'اخضر': 'green',
    'red': 'red',
    'black': 'black',
    'green': 'green'
  };
  return traducciones[color] || color;
}

// دالة لترجمة الألوان للعرض
function traducirColorParaMostrar(color) {
  const traducciones = {
    'red': 'أحمر 🔴',
    'black': 'أسود ⚫', 
    'green': 'أخضر 🟢'
  };
  return traducciones[color] || color;
    }
