const salasTTT = new Map();
const symbols = ['❌', '⭕'];
const numerosEmoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];

function renderTablero(tablero) {
  return `
     ${tablero.slice(0,3).join('')}
     ${tablero.slice(3,6).join('')}
     ${tablero.slice(6).join('')}`;
}

function verificarGanador(tablero) {
  const combinaciones = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (const [a, b, c] of combinaciones) {
    if (tablero[a] === tablero[b] && tablero[b] === tablero[c]) {
      return tablero[a];
    }
  }
  return tablero.every(x => x === '❌' || x === '⭕') ? 'empate' : null;
}

async function enviarEstado(conn, sala, textoExtra = '') {
  const [j1, j2] = sala.jugadores;
  const simboloJ1 = symbols[0];
  const simboloJ2 = symbols[1];

  const msg = `💖 لعبة إكس أو
🫂 اللاعبون:
*┈┈┈┈┈┈┈┈┈*
${simboloJ1} = @${j1?.split('@')[0]}
${simboloJ2} = @${j2?.split('@')[0] || 'بانتظار الخصم'}
*┈┈┈┈┈┈┈┈┈*${renderTablero(sala.tablero)}
*┈┈┈┈┈┈┈┈┈*
${textoExtra ? `
${textoExtra}` : `دور:
@${sala.turno.split('@')[0]}`}`;

  await conn.sendMessage(sala.chat, { text: msg, mentions: sala.jugadores });
}

let handler = async (m, { conn, args, command }) => {
const customNombre = args[0]?.toLowerCase();

// تحويل الأوامر العربية
const comandoTraducido = traducirComando(command);

if (comandoTraducido === 'tttlist') {
if (salasTTT.size === 0) return m.reply('⚠️ لا توجد غرف نشطة حالياً.');
let text = '🎮 *الغرف النشطة:*';
let count = 1;
for (const [nombre] of salasTTT) {
text += `\n\n${count++}- *${nombre}*\nادخل باستخدام: !اكسو ${nombre}`;
}
return m.reply(text.trim());
}

if (comandoTraducido === 'delttt') {
const salaDel = [...salasTTT.values()].find(s => s.jugadores.includes(m.sender));
if (!salaDel) return m.reply('⚠️ لست في أي غرفة نشطة.');
salasTTT.delete(salaDel.nombre);
return conn.reply(salaDel.chat, `❌ تم حذف الغرفة بواسطة @${m.sender.split('@')[0]}.`, m, { mentions: [m.sender] });
}

if (comandoTraducido === 'ttt') {
if (customNombre) {
let sala = salasTTT.get(customNombre);
if (sala && sala.jugadores.includes(m.sender)) return m.reply('⚠️ أنت بالفعل في هذه الغرفة.');

if (!sala) {
salasTTT.set(customNombre, {
nombre: customNombre,
chat: m.chat,
jugadores: [m.sender],
tablero: [...numerosEmoji],
turno: m.sender
});
return m.reply(`🏃 في انتظار الخصم للغرفة *${customNombre}*.\nاستخدم: !اكسو ${customNombre}`);
}

if (sala.jugadores.length >= 2) return m.reply('⚠️ هذه الغرفة بها لاعبين بالفعل.');
sala.jugadores.push(m.sender);
salasTTT.set(customNombre, sala);
return await enviarEstado(conn, sala);
}

let salaLibre = [...salasTTT.values()].find(s => s.jugadores.length === 1 && !s.nombre.startsWith('sala-'));
if (!salaLibre) {
const nuevaNombre = `p${Date.now()}`;
salasTTT.set(nuevaNombre, {
nombre: nuevaNombre,
chat: m.chat,
jugadores: [m.sender],
tablero: [...numerosEmoji],
turno: m.sender
});
return m.reply(`🏃 في انتظار الخصم...
استخدم: !اكسو للانضمام.`);
}

if (salaLibre.jugadores.includes(m.sender)) return m.reply('⚠️ أنت بالفعل في غرفة.');
salaLibre.jugadores.push(m.sender);
salasTTT.set(salaLibre.nombre, salaLibre);
return await enviarEstado(conn, salaLibre);
}};

handler.before = async (m, { conn }) => {
const numero = parseInt(m.originalText.trim());
if (!numero || numero < 1 || numero > 9) return;

for (const [nombre, sala] of salasTTT) {
if (!sala.jugadores.includes(m.sender)) continue;
if (sala.turno !== m.sender) return;
const idx = numero - 1;
if (sala.tablero[idx] !== symbols[0] && sala.tablero[idx] !== symbols[1]) {
sala.tablero[idx] = sala.jugadores.indexOf(m.sender) === 0 ? symbols[0] : symbols[1];
const ganador = verificarGanador(sala.tablero);

if (ganador) {
let texto = '';
if (ganador === 'empate') {
texto = '🤝 تعادل! لعبة جيدة.';
} else {
const xp = Math.floor(Math.random() * 3000) + 1000;
const ganadorId = sala.jugadores[sala.tablero[idx] === symbols[0] ? 0 : 1];
const perdedorId = sala.jugadores.find(j => j !== ganadorId);
await m.db.query('UPDATE usuarios SET exp = exp + $1 WHERE id = $2', [xp, ganadorId]);
await m.db.query('UPDATE usuarios SET exp = exp - $1 WHERE id = $2', [xp, perdedorId]);
texto = `🎉 @${ganadorId.split('@')[0]} *فاز* وحصل على *${xp} XP*!`;
}
await enviarEstado(conn, sala, texto);
salasTTT.delete(nombre);
return;
}

sala.turno = sala.jugadores.find(j => j !== m.sender);
await enviarEstado(conn, sala);
} else {
m.reply('❌ هذه الخلية محجوزة بالفعل.');
}}
};

// الأوامر العربية المضافة
handler.help = ['ttt', 'ttt nombre', 'delttt', 'tttlist', 'اكسو', 'اكساو', 'قائمة_الغرف', 'حذف_غرفة'];
handler.tags = ['game', 'الألعاب', 'تحدي'];
handler.command = ['ttt', 'ttc', 'tictactoe', 'delttt', 'tttlist', 'deltt', 'deltictactoe', 'اكسو', 'اكساو', 'إكسأو', 'لعبة_إكس_أو', 'قائمة', 'حذف', 'الغرف'];
handler.register = true;

export default handler;

// دالة لترججة الأوامر العربية
function traducirComando(comando) {
  const traducciones = {
    'اكسو': 'ttt',
    'اكساو': 'ttt',
    'إكسأو': 'ttt',
    'لعبة_إكس_أو': 'ttt',
    'قائمة': 'tttlist',
    'الغرف': 'tttlist',
    'قائمة_الغرف': 'tttlist',
    'حذف': 'delttt',
    'حذف_غرفة': 'delttt'
  };
  return traducciones[comando] || comando;
}
