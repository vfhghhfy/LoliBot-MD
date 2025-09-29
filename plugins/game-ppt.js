const cooldown = 30_000;
const retos = new Map();
const jugadas = new Map();
const cooldowns = new Map();
const jugadasValidas = ['piedra', 'papel', 'tijera', 'حجر', 'ورقة', 'مقص'];

let handler = async (m, { conn, args, usedPrefix, command }) => {
const now = Date.now();
const userId = m.sender;
const cooldownRestante = (cooldowns.get(userId) || 0) + cooldown - now;
if (cooldownRestante > 0) return conn.fakeReply(m.chat, `*🕓 تمهل، انتظر ${msToTime(cooldownRestante)} قبل استخدام أمر آخر*`, m.sender, `لا تُزعج`, 'status@broadcast');

const res = await m.db.query('SELECT exp FROM usuarios WHERE id = $1', [userId]);
const user = res.rows[0];;
const opponent = m.mentionedJid?.[0];
const input = args[0]?.toLowerCase();

// تحويل الأوامر العربية
const inputTraducido = traducirJugada(input);

if (!opponent && jugadasValidas.includes(inputTraducido)) {
cooldowns.set(userId, now);
const botJugada = jugadasValidas[Math.floor(Math.random() * 3)];
const resultado = evaluar(inputTraducido, botJugada);
const xp = Math.floor(Math.random() * 2000) + 500;

let text = '';
let result = "";
if (resultado === 'gana') {
await m.db.query('UPDATE usuarios SET exp = exp + $1 WHERE id = $2', [xp, userId]);
text += `✅ *فزت* وربحت *${formatNumber(xp)} XP*`;
result = 'فزت! 🎉';
} else if (resultado === 'pierde') {
const nuevaXP = Math.max(0, user.exp - xp);
await m.db.query('UPDATE usuarios SET exp = $1 WHERE id = $2', [nuevaXP, userId]);
text += `❌ *خسرت*. خسرت *${formatNumber(xp)} XP*`;
result = 'خسرت! 🤡';
} else {
result = 'تعادل! 🤝';
text += `🤝 *تعادل*. لم تربح أو تخسر XP.`;
}

return m.reply(`\`「 ${result} 」\`\n\n👉 البوت: ${traducirABot(botJugada)}\n👉 أنت: ${traducirABot(inputTraducido)}\n` + text);
}

if (opponent) {
if (retos.has(opponent)) return m.reply('⚠️ هذا المستخدم لديه تحدٍ معلق بالفعل.');
retos.set(opponent, {
retador: userId,
chat: m.chat,
timeout: setTimeout(() => {
retos.delete(opponent);
conn.reply(m.chat, `⏳ انتهى الوقت، تم إلغاء التحدي بسبب عدم استجابة @${opponent.split('@')[0]}`, m, { mentions: [opponent] });
}, 60000)
});

return conn.reply(m.chat, `🎮👾 تحدّي - حجر، ورقة، مقص 👾🎮\n\n@${m.sender.split`@`[0]} يتحدى @${opponent.split('@')[0]}.\n\n> _*اكتب (قبول) للقبول*_\n> _*اكتب (رفض) للرفض*_`, m, { mentions: [opponent] });
}

m.reply(`حجر 🗿، ورقة 📄، مقص ✂️\n\n👾 اللعب ضد البوت:\n• ${usedPrefix + command} حجر\n• ${usedPrefix + command} ورقة\n• ${usedPrefix + command} مقص\n\n🕹 اللعب ضد مستخدم:\n${usedPrefix + command} @0`);
};

handler.before = async (m, { conn }) => {
const text = m.originalText?.toLowerCase();
const userId = m.sender;

// تحويل الأوامر العربية
const textTraducido = traducirComando(text);

if (['قبول', 'رفض', 'aceptar', 'rechazar'].includes(textTraducido) && retos.has(userId)) {
const { retador, chat, timeout } = retos.get(userId);
clearTimeout(timeout);
retos.delete(userId);

if (textTraducido === 'رفض' || textTraducido === 'rechazar') {
return conn.reply(chat, `⚠️ @${userId.split('@')[0]} رفض التحدي.`, m, { mentions: [userId, retador] });
}

jugadas.set(chat, {
jugadores: [retador, userId],
eleccion: {},
timeout: setTimeout(() => {
jugadas.delete(chat);
conn.reply(chat, `⏰ انتهت المباراة بسبب عدم النشاط.`, m);
}, 60000)
});

conn.reply(chat, `✅ تم قبول التحدي. سيتم إرسال الخيارات خاص إلى @${retador.split('@')[0]} و @${userId.split('@')[0]}.`, m, { mentions: [retador, userId] });

await conn.sendMessage(retador, { text: '✊🖐✌️ اكتب *حجر*، *ورقة* أو *مقص* لاختيار حركتك.' });
await conn.sendMessage(userId, { text: '✊🖐✌️ اكتب *حجر*، *ورقة* أو *مقص* لاختيار حركتك.' });
return;
}

// تحويل حركات اللعب العربية
const jugadaTraducida = traducirJugada(text);

if (jugadasValidas.includes(jugadaTraducida)) {
for (const [chat, partida] of jugadas) {
const { jugadores, eleccion, timeout } = partida;
if (!jugadores.includes(userId)) continue;

eleccion[userId] = jugadaTraducida;
await conn.sendMessage(userId, { text: '✅ تم استلام اختيارك. عد إلى المجموعة وانتظر النتيجة.' });

if (Object.keys(eleccion).length < 2) return;
clearTimeout(timeout);
jugadas.delete(chat);

const [j1, j2] = jugadores;
const jugada1 = eleccion[j1];
const jugada2 = eleccion[j2];
const resultado = evaluar(jugada1, jugada2);
const xp = Math.floor(Math.random() * 2000) + 500;
let mensaje = `✊🖐✌️ *حجر، ورقة، مقص*\n\n@${j1.split('@')[0]} اختار: *${traducirABot(jugada1)}*\n@${j2.split('@')[0]} اختار: *${traducirABot(jugada2)}*\n\n`;

if (resultado === 'empate') {
mensaje += '🤝 تعادل! لا أحد يربح أو يخسر XP.';
} else {
const ganador = resultado === 'gana' ? j1 : j2;
const perdedor = ganador === j1 ? j2 : j1;
await m.db.query('UPDATE usuarios SET exp = exp + $1 WHERE id = $2', [xp * 2, ganador]);
await m.db.query('UPDATE usuarios SET exp = exp - $1 WHERE id = $2', [xp, perdedor]);
mensaje += `🎉 @${ganador.split('@')[0]} يربح *${formatNumber(xp * 2)} XP*\n💀 @${perdedor.split('@')[0]} يخسر *${formatNumber(xp)} XP*`;
}

return conn.sendMessage(chat, { text: mensaje, mentions: [j1, j2] });
}}
};

// الأوامر العربية المضافة
handler.help = ['ppt piedra|papel|tijera', 'ppt @usuario', 'حجر ورقة مقص', 'تحدي @user'];
handler.tags = ['game', 'الألعاب', 'تحدي'];
handler.command = ['ppt', 'suit', 'pvp', 'suitpvp', 'حجر', 'ورقة', 'مقص', 'تحدي', 'تحدي'];
handler.register = true;

export default handler;

function evaluar(a, b) {
  if (a === b) return 'empate';
  if ((a === 'piedra' && b === 'tijera') || (a === 'tijera' && b === 'papel') || (a === 'papel' && b === 'piedra')) return 'gana';
  return 'pierde';
}

function formatNumber(n) {
  return n.toLocaleString('en').replace(/,/g, '.');
}

function msToTime(ms) {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  return `${m ? `${m}د ` : ''}${s}ث`;
}

// دالة لترجمة الأوامر العربية
function traducirComando(texto) {
  const traducciones = {
    'قبول': 'aceptar',
    'رفض': 'rechazar',
    'حجر': 'piedra',
    'ورقة': 'papel', 
    'مقص': 'tijera',
    'نعم': 'aceptar',
    'لا': 'rechazar'
  };
  return traducciones[texto] || texto;
}

// دالة لترججة حركات اللعب
function traducirJugada(jugada) {
  const traducciones = {
    'حجر': 'piedra',
    'ورقة': 'papel',
    'مقص': 'tijera',
    'ح': 'piedra',
    'و': 'papel',
    'م': 'tijera'
  };
  return traducciones[jugada] || jugada;
}

// دالة لترججة النتائج للعرض
function traducirABot(jugada) {
  const traducciones = {
    'piedra': 'حجر 🗿',
    'papel': 'ورقة 📄',
    'tijera': 'مقص ✂️'
  };
  return traducciones[jugada] || jugada;
}
