const mathGames = new Map();

const dificultades = {
  noob: { ops: ['+', '-'], min: 1, max: 10, tiempo: 15000, exp: [300, 600] },
  easy: { ops: ['+', '-', '*'], min: 10, max: 30, tiempo: 20000, exp: [600, 1000] },
  medium: { ops: ['+', '-', '*'], min: 30, max: 70, tiempo: 25000, exp: [1000, 1500] },
  hard: { ops: ['+', '-', '*'], min: 70, max: 120, tiempo: 30000, exp: [1500, 2000] },
  extreme: { ops: ['+', '-', '*', '/'], min: 100, max: 250, tiempo: 35000, exp: [2000, 3000] },
  impossible: { ops: ['+', '-', '*', '/'], min: 200, max: 999, tiempo: 40000, exp: [3000, 5000] }
};

let handler = async (m, { conn, args, command }) => {
const dificultad = (args[0] || '').toLowerCase();
if (!dificultad || !dificultades[dificultad]) {
return m.reply(`⚠️ يجب اختيار مستوى صعوبة صالح.

أمثلة:
!رياضيات مبتدئ
!رياضيات سهل  
!رياضيات صعب

مستويات الصعوبة المتاحة:
${Object.keys(dificultades).map(k => `- ${k}`).join('\n')}`);
}

const nivel = dificultades[dificultad];
const a = Math.floor(Math.random() * (nivel.max - nivel.min + 1)) + nivel.min;
const b = Math.floor(Math.random() * (nivel.max - nivel.min + 1)) + nivel.min;
const op = nivel.ops[Math.floor(Math.random() * nivel.ops.length)];
const result = op === '/' ? parseFloat((a / b).toFixed(2)) : eval(`${a}${op}${b}`);
const recompensa = Math.floor(Math.random() * (nivel.exp[1] - nivel.exp[0] + 1)) + nivel.exp[0];
mathGames.set(m.sender, { result, exp: recompensa, intentos: 3 });

setTimeout(() => {
if (mathGames.has(m.sender)) {
mathGames.delete(m.sender);
conn.reply(m.chat, `⌛ انتهى الوقت، الإجابة هي: *${result}*`, m);
}}, nivel.tiempo);
return m.reply(`╭┄〔 *${info.wm}* 〕┄⊱
┆ما هو ناتج: *${a} ${op} ${b} = ?*
┆┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┆🧭 الوقت: * ${nivel.tiempo / 1000} ثانية*
┆┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┆أجب على هذه الرسالة واربح 
┆🏆 *${recompensa}: XP*
╰━━━⊰ 𓃠 ${info.vs} ⊱━━━━დ`);
};

handler.before = async (m, { conn }) => {
if (!mathGames.has(m.sender)) return;
const data = mathGames.get(m.sender);
const { result, exp, intentos } = data;
const entrada = m.originalText.trim();
let correcta = false;
if (String(result).includes('.') || entrada.includes('.')) {
correcta = parseFloat(entrada).toFixed(2) === result.toFixed(2);
} else {
correcta = Number(entrada) === result;
}

if (correcta) {
mathGames.delete(m.sender);
await m.db.query('UPDATE usuarios SET exp = exp + $1 WHERE id = $2', [exp, m.sender]);
return m.reply(`✅ إجابة صحيحة! ربحت *${exp} XP*`);
} else {
data.intentos--;
if (data.intentos <= 0) {
mathGames.delete(m.sender);
return m.reply(`❌ فشلت 3 مرات. الإجابة الصحيحة كانت *${result}*.`);
} else {
mathGames.set(m.sender, data);
return m.reply(`❌ إجابة خاطئة. بقي لديك *${data.intentos}* محاولة/محاولات.`);
}}
};

// الأوامر العربية المضافة
handler.help = ['math [dificultad]', 'رياضيات [مستوى]', 'حساب [مستوى]'];
handler.tags = ['game', 'تعليم', 'الألعاب'];
handler.command = ['math', 'mates', 'matemáticas', 'رياضيات', 'رياضيات', 'مسألة'];
handler.register = true;

export default handler;
