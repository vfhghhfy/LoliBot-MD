const handler = async (m, { conn, command, args }) => {
  // 📊 جلب بيانات المستخدم من قاعدة البيانات
  const res = await m.db.query('SELECT limite, banco FROM usuarios WHERE id = $1', [m.sender]);
  const user = res.rows[0];
  const limite = user.limite ?? 0;
  const banco = user.banco ?? 0;

  // 🏦 أوامر الإيداع
  if (command === 'dep' || command === 'depositar' || command === 'ايداع' || command === 'تحويل') {
    if (!args[0]) return m.reply(`[ ⚠️ ] *أدخل الكمية التي تريد إيداعها في حسابك البنكي 🏦*`);

    // إيداع الكل
    if (/all/i.test(args[0])) {
      if (limite < 1) return m.reply(`💀 محفظتك فارغة، لا تملك أي ألماس.`);
      await m.db.query(`UPDATE usuarios SET limite = 0, banco = banco + $1 WHERE id = $2`, [limite, m.sender]);
      return m.reply(`*[ 🏦 ] تم إيداع ${limite} 💎 في البنك بنجاح.*`);
    }

    // تحقق من صحة الرقم
    if (isNaN(args[0])) return m.reply(`[ ⚠️ ] *الكمية يجب أن تكون رقمًا صحيحًا 💎*`);
    const amount = parseInt(args[0]);
    if (amount < 1) return m.reply(`❌ الحد الأدنى هو 1 💎.`);
    if (limite < amount) return m.reply(`💰 لا تملك هذا العدد من الألماس في محفظتك.\nاستخدم الأمر: *#bal* لعرض رصيدك.`);

    // تنفيذ العملية
    await m.db.query(`UPDATE usuarios SET limite = limite - $1, banco = banco + $1 WHERE id = $2`, [amount, m.sender]);
    return m.reply(`*[ 🏦 ] تم إيداع ${amount} 💎 في البنك بنجاح.*`);
  }

  // 💎 أوامر السحب
  if (command === 'retirar' || command === 'toremove' || command === 'سحب' || command === 'سحب_الماس') {
    if (!args[0]) return m.reply(`[ ⚠️ ] *أدخل الكمية التي تريد سحبها من البنك 💎*`);

    // سحب الكل
    if (/all/i.test(args[0])) {
      if (banco < 1) return m.reply(`👻 حسابك البنكي فارغ، لا يوجد رصيد للسحب 🥲`);
      await m.db.query(`UPDATE usuarios SET banco = 0, limite = limite + $1 WHERE id = $2`, [banco, m.sender]);
      return m.reply(`*[ 🏦 ] تم سحب ${banco} 💎 من البنك إلى محفظتك.*`);
    }

    // تحقق من صحة الرقم
    if (isNaN(args[0])) return m.reply(`⚠️ يجب إدخال رقم صالح.`);
    const amount = parseInt(args[0]);
    if (amount < 1) return m.reply(`❌ الحد الأدنى للسحب هو 1 💎.`);
    if (banco < amount) return m.reply(`💎 ليس لديك هذا المبلغ في البنك.\nاستخدم الأمر: *#bal* لعرض رصيدك.`);

    // تنفيذ العملية
    await m.db.query(`UPDATE usuarios SET banco = banco - $1, limite = limite + $1 WHERE id = $2`, [amount, m.sender]);
    return m.reply(`*[ 🏦 ] تم سحب ${amount} 💎 من البنك إلى محفظتك بنجاح.*`);
  }
};

// 📘 أوامر المساعدة
handler.help = ['dep', 'depositar', 'retirar', 'toremove', 'ايداع', 'سحب'];
handler.tags = ['اقتصاد', 'مال'];
handler.command = /^(dep|depositar|retirar|toremove|ايداع|تحويل|سحب|سحب_الماس)$/i;
handler.register = true;

export default handler;
