import { createHash } from 'crypto';
import moment from 'moment-timezone';
import { db } from '../lib/postgres.js';

const Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;

const formatPhoneNumber = (jid) => {
  if (!jid) return null;
  const number = jid.replace('@s.whatsapp.net', '');
  if (!/^\d{8,15}$/.test(number)) return null;
  return `+${number}`;
};

const estados = {};

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  let fkontak = {
    key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" },
    message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD` } },
    participant: "0@s.whatsapp.net"
  };

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;

  const date = moment.tz('Asia/Riyadh').format('DD/MM/YYYY');
  const time = moment.tz('Asia/Riyadh').format('LT');
  let userNationality = null;

  try {
    const phone = formatPhoneNumber(who);
    if (phone) {
      const response = await fetch(`${info.apis}/tools/country?text=${phone}`);
      const data = await response.json();
      userNationality = data.result ? `${data.result.name} ${data.result.emoji}` : null;
    }
  } catch {
    userNationality = null;
  }

  const userResult = await db.query(`SELECT * FROM usuarios WHERE id = $1`, [who]);
  let user = userResult.rows[0] || { registered: false };
  const input = text.trim();
  const step = estados[who]?.step || 0;
  let name2 = m.pushName || 'مستخدم';
  const totalRegResult = await db.query(`SELECT COUNT(*) AS total FROM usuarios WHERE registered = true`);
  const rtotalreg = parseInt(totalRegResult.rows[0].total);

  // 🔹 التسجيل الأساسي
  if (/^(reg|verify|verificar|تسجيل|تحقق)$/i.test(command)) {
    if (user.registered) return m.reply(`✅ *أنت مسجل بالفعل 🤨*`);
    if (estados[who]?.step) return m.reply('⚠️ لديك تسجيل قيد التقدم. أكمل الخطوة السابقة أولاً.');
    if (!Reg.test(text)) return m.reply(`⚠️ *طريقة الاستخدام:*\n${usedPrefix + command} الاسم.العمر\n📌 مثال: ${usedPrefix + command} ${name2}.18`);

    let [_, name, splitter, age] = text.match(Reg);
    if (!name) return m.reply('*❌ يرجى إدخال الاسم.*');
    if (!age) return m.reply('*❌ يرجى إدخال العمر.*');
    if (name.length >= 45) return m.reply('*😅 اسمك طويل جدًا!*');
    age = parseInt(age);
    if (age > 100) return m.reply('👴🏻 *أنت كبير جدًا على هذا 😅*');
    if (age < 5) return m.reply('🚼 *الأطفال لا يمكنهم التسجيل 😳*');

    estados[who] = { step: 1, nombre: name, edad: age, usedPrefix, userNationality };
    return m.reply(`🧑 *الخطوة 2 من التسجيل:* اختر جنسك:\n\n1. ذكر ♂️\n2. أنثى ♀️\n3. آخر 🧬\n\n✳️ *أرسل الرقم المناسب*`);
  }

  // 🔹 رقم السيريال
  if (/^(nserie|myns|sn|رقمي)$/i.test(command)) {
    if (!user.registered) return m.reply(`⚠️ *أنت غير مسجل*\n📌 استخدم:\n${usedPrefix}تسجيل الاسم.العمر`);
    const sn = user.serial_number || createHash('md5').update(m.sender).digest('hex');
    return conn.fakeReply(m.chat, sn, '0@s.whatsapp.net', `⬇️ *رقمك التسلسلي هو:*`, 'status@broadcast');
  }

  // 🔹 حذف التسجيل
  if (/^(unreg|حذف_تسجيل)$/i.test(command)) {
    if (!user.registered) return m.reply(`⚠️ *أنت غير مسجل*\n📌 استخدم:\n${usedPrefix}تسجيل الاسم.العمر`);
    if (!args[0]) return m.reply(`✳️ *أدخل رقمك التسلسلي*\n📌 استخدم ${usedPrefix}رقمي للحصول عليه.`);
    const sn = user.serial_number || createHash('md5').update(m.sender).digest('hex');
    if (args[0] !== sn) return m.reply('⚠️ *رقم تسلسلي غير صحيح*');

    await db.query(`
      UPDATE usuarios SET registered = false, nombre = NULL, edad = NULL, money = money - 400,
      limite = limite - 2, exp = exp - 150, reg_time = NULL, serial_number = NULL WHERE id = $1
    `, [m.sender]);

    return conn.fakeReply(m.chat, `😢 *تم حذف تسجيلك بنجاح.*`, '0@s.whatsapp.net', `إلغاء التسجيل`, 'status@broadcast');
  }

  // 🔹 تعيين الجنس
  if (/^(setgenero|تعيين_جنس)$/i.test(command)) {
    const genero = (args[0] || '').toLowerCase();
    if (!['hombre', 'mujer', 'otro', 'ذكر', 'أنثى', 'آخر'].includes(genero))
      return m.reply(`✳️ *الاستخدام الصحيح:*\n${usedPrefix}تعيين_جنس <ذكر|أنثى|آخر>\n📌 مثال: ${usedPrefix}تعيين_جنس ذكر`);
    if (!user.registered) return m.reply('⚠️ *يجب أن تكون مسجلًا أولًا.*');
    await db.query('UPDATE usuarios SET gender = $1 WHERE id = $2', [genero, who]);
    return m.reply(`✅ *تم حفظ الجنس:* ${genero}`);
  }

  // 🔹 تعيين تاريخ الميلاد
  if (/^(setbirthday|تاريخ_ميلاد)$/i.test(command)) {
    let birthday = args.join(' ').trim();
    if (!birthday) return m.reply(`✳️ *الاستخدام:*\n${usedPrefix}تاريخ_ميلاد 30/10/2000`);
    if (birthday.toLowerCase() === 'حذف') {
      await db.query('UPDATE usuarios SET birthday = NULL WHERE id = $1', [who]);
      return m.reply('✅ *تم حذف تاريخ الميلاد بنجاح.*');
    }
    try {
      const fecha = moment(birthday, ['DD/MM/YYYY'], true);
      if (!fecha.isValid()) throw new Error('formato');
      await db.query('UPDATE usuarios SET birthday = $1 WHERE id = $2', [fecha.format('YYYY-MM-DD'), who]);
      return m.reply(`✅ *تم حفظ تاريخ الميلاد:* ${birthday}`);
    } catch {
      return m.reply('❌ *صيغة غير صحيحة.* مثال: 25/07/2009');
    }
  }
};

// 🔹 مراحل التسجيل (المتابعة التلقائية)
handler.before = async (m, { conn, usedPrefix }) => {
  const who = m.sender;
  const step = estados[who]?.step;
  const input = (m.text || '').trim();
  const totalRegResult = await db.query(`SELECT COUNT(*) AS total FROM usuarios WHERE registered = true`);
  const rtotalreg = parseInt(totalRegResult.rows[0].total);
  if (!step) return;

  if (!m.text.startsWith(usedPrefix)) {
    if (step === 1) {
      let lower = input.toLowerCase();
      let genero =
        lower === '1' || lower === 'ذكر' || lower === 'hombre' ? 'ذكر' :
        lower === '2' || lower === 'أنثى' || lower === 'mujer' ? 'أنثى' :
        lower === '3' || lower === 'آخر' || lower === 'otro' ? 'آخر' : null;
      if (!genero) return m.reply('⚠️ أجب بـ 1 أو 2 أو 3 أو اكتب "ذكر" / "أنثى" / "آخر"');
      estados[who].genero = genero;
      estados[who].step = 2;
      return m.reply(`🎂 *الخطوة 3:* أدخل تاريخ ميلادك (اختياري)\n📅 مثال: 30/10/2000\n✳️ أو اكتب "تخطي" لتجاوزه.`);
    }

    if (step === 2) {
      let cumple = null;
      let cumpleTexto = null;
      if (input.toLowerCase() !== 'تخطي') {
        try {
          const fecha = moment(input, ['DD/MM/YYYY'], true);
          if (!fecha.isValid()) throw new Error('invalid');
          cumple = fecha.format('YYYY-MM-DD');
          cumpleTexto = input;
        } catch {
          return m.reply('❌ صيغة خاطئة. مثال: 27/5/2009');
        }
      }

      const pref = estados[who]?.usedPrefix || '.';
      const userNationality = estados[who]?.userNationality || '';
      const { nombre, edad, genero } = estados[who];
      const serial = createHash('md5').update(who).digest('hex');
      const reg_time = new Date();

      await db.query(`
        INSERT INTO usuarios (id, nombre, edad, gender, birthday, money, limite, exp, reg_time, registered, serial_number)
        VALUES ($1,$2,$3,$4,$5,400,2,150,$6,true,$7)
        ON CONFLICT (id) DO UPDATE
        SET nombre = $2, edad = $3, gender = $4, birthday = $5,
            money = usuarios.money + 400,
            limite = usuarios.limite + 2,
            exp = usuarios.exp + 150,
            reg_time = $6, registered = true, serial_number = $7
      `, [who, nombre + '✓', edad, genero, cumple, reg_time, serial]);

      delete estados[who];

      return await conn.sendMessage(m.chat, {
        text: `[ ✅ تم التسجيل بنجاح ]

👤 *الاسم:* ${nombre}
🎂 *العمر:* ${edad} سنة
⚧️ *الجنس:* ${genero}${cumpleTexto ? `\n📅 *الميلاد:* ${cumpleTexto}` : ''}
🕒 *الوقت:* ${time}
📆 *التاريخ:* ${date}${userNationality ? `\n🌍 *الدولة:* ${userNationality}` : ''}
☎️ *الرقم:* wa.me/${who.split('@')[0]}
🔑 *الرقم التسلسلي:*
${serial}

🎁 *المكافأة:*
💎 +2 ألماس
🪙 +400 كوينز
⭐ +150 خبرة

📜 *استخدم ${pref}قائمة لرؤية الأوامر.*
👥 *عدد المسجلين الكلي:* ${toNum(rtotalreg + 1)}`
      });
    }
  }
};

handler.help = ['تسجيل <الاسم.العمر>', 'تحقق <الاسم.العمر>', 'رقمي', 'حذف_تسجيل <السيريال>', 'تعيين_جنس', 'تاريخ_ميلاد'];
handler.tags = ['rg'];
handler.command = /^(setbirthday|setgenero|nserie|unreg|sn|myns|verify|verificar|registrar|reg|تسجيل|تحقق|رقمي|حذف_تسجيل|تعيين_جنس|تاريخ_ميلاد)$/i;

export default handler;

function toNum(number) {
  if (number >= 1000 && number < 1000000) return (number / 1000).toFixed(1) + 'k';
  else if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M';
  else return number.toString();
  }
