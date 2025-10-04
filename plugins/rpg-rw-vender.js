// الكود الأصلي من: https://github.com/elrebelde21
// ترجمة كاملة إلى العربية بواسطة GPT-5

const pendingSales = new Map();
const cooldownTime = 3600000; // ⏱️ ساعة واحدة

// 🧮 حساب الحد الأقصى للسعر بناءً على التصويتات
function calculateMaxPrice(basePrice, votes) {
  if (votes === 0) return Math.round(basePrice * 1.05);
  const maxIncreasePercentage = 0.3;
  const maxPrice = basePrice * (1 + maxIncreasePercentage * votes);
  return Math.round(maxPrice);
}

// 💰 حساب الحد الأدنى للسعر
function calculateMinPrice(basePrice) {
  return Math.round(basePrice * 0.95);
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.db) return;

  try {
    const { rows: userCharacters } = await m.db.query(
      'SELECT * FROM characters WHERE claimed_by = $1',
      [m.sender]
    );

    // 🧾 إذا لم يُدخل المستخدم الاسم والسعر
    if (args.length < 2) {
      if (userCharacters.length === 0)
        return conn.reply(
          m.chat,
          '⚠️ ليس لديك أي شخصيات حالياً. قم بالمطالبة بشخصية أولاً.',
          m
        );

      let characterList = '🧍 قائمة شخصياتك:\n';
      userCharacters.forEach((character, index) => {
        characterList += `${index + 1}. ${character.name} - ${character.price} exp\n`;
      });

      return conn.reply(
        m.chat,
        `⚠️ طريقة الاستخدام:\n\n• لبيع شخصية لشخص معين:\n${usedPrefix + command} <اسم_الشخصية> <السعر> @الوسم\n\n• لعرضها في السوق:\nمثال: ${usedPrefix + command} goku 9500\n\n${characterList}`,
        m
      );
    }

    // 👥 التحقق من الوسم والسعر
    const mentioned = m.mentionedJid[0] || null;
    const mentionIndex = args.findIndex(arg => arg.startsWith('@'));
    let price = args[args.length - 1];
    if (mentioned && mentionIndex !== -1) {
      price = args[args.length - 2];
    }

    price = parseInt(price);
    if (isNaN(price) || price <= 0)
      return conn.reply(
        m.chat,
        '⚠️ الرجاء تحديد سعر صحيح للشخصية.',
        m
      );

    const nameParts = args.slice(0, mentioned ? -2 : -1);
    const characterName = nameParts.join(' ').trim();
    if (!characterName)
      return conn.reply(
        m.chat,
        '⚠️ لم يتم العثور على اسم الشخصية. تحقق من الاسم وحاول مرة أخرى.',
        m
      );

    // 🔍 البحث عن الشخصية التي يملكها المستخدم
    const characterToSell = userCharacters.find(
      c => c.name.toLowerCase() === characterName.toLowerCase()
    );

    if (!characterToSell)
      return conn.reply(m.chat, '⚠️ لم يتم العثور على الشخصية التي تحاول بيعها.', m);

    if (characterToSell.for_sale)
      return conn.reply(
        m.chat,
        '⚠️ هذه الشخصية معروضة بالفعل في السوق. استخدم الأمر `.rw-retirar` أو `اسحب` لإزالتها قبل إعادة عرضها.',
        m
      );

    // ⏳ التحقق من فترة التهدئة بعد السحب
    if (characterToSell.last_removed_time) {
      const timeSinceRemoval = Date.now() - characterToSell.last_removed_time;
      if (timeSinceRemoval < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - timeSinceRemoval) / 60000);
        return conn.reply(
          m.chat,
          `⚠️ يجب أن تنتظر ${remainingTime} دقيقة قبل إعادة عرض *${characterToSell.name}*.`,
          m
        );
      }
    }

    // 💸 التحقق من حدود الأسعار
    const minPrice = calculateMinPrice(characterToSell.price);
    const maxPrice = calculateMaxPrice(characterToSell.price, characterToSell.votes || 0);

    if (price < minPrice)
      return conn.reply(
        m.chat,
        `⚠️ الحد الأدنى المسموح به للسعر هو ${minPrice} exp.`,
        m
      );

    if (price > maxPrice)
      return conn.reply(
        m.chat,
        `⚠️ الحد الأعلى المسموح به للسعر هو ${maxPrice} exp.`,
        m
      );

    // 🎯 إذا كانت عملية البيع موجهة لمستخدم آخر (هدية)
    if (mentioned) {
      if (pendingSales.has(mentioned))
        return conn.reply(
          m.chat,
          '⚠️ هذا المستخدم لديه عرض بيع قيد الانتظار. يرجى الانتظار.',
          m
        );

      pendingSales.set(mentioned, {
        seller: m.sender,
        buyer: mentioned,
        character: characterToSell,
        price,
        timer: setTimeout(() => {
          pendingSales.delete(mentioned);
          conn.reply(
            m.chat,
            `⏰ @${mentioned.split('@')[0]} لم يرد على عرض *${characterToSell.name}*. تم إلغاء العملية.`,
            m,
            { mentions: [mentioned] }
          );
        }, 60000),
      });

      return conn.reply(
        m.chat,
        `📜 يا @${mentioned.split('@')[0]}, المستخدم @${m.sender.split('@')[0]} يريد بيعك *${characterToSell.name}* مقابل ${price} exp.\n\nرد بـ:\n- *قبول* للشراء ✅\n- *رفض* للإلغاء ❌`,
        m,
        { mentions: [mentioned, m.sender] }
      );
    } else {
      // 🏪 عرض الشخصية في السوق
      const previousPrice = characterToSell.price;
      await m.db.query(
        'UPDATE characters SET price = $1, for_sale = true, seller = $2, previous_price = $3 WHERE id = $4',
        [price, m.sender, previousPrice, characterToSell.id]
      );
      return conn.reply(
        m.chat,
        `✅ تم عرض الشخصية *${characterToSell.name}* في السوق بسعر ${price} exp.`,
        m
      );
    }
  } catch (e) {
    console.error(e);
    return conn.reply(
      m.chat,
      '⚠️ حدث خطأ أثناء تنفيذ عملية البيع. حاول مرة أخرى.',
      m
    );
  }
};

// 💬 التحقق من الردود (قبول / رفض)
handler.before = async (m, { conn }) => {
  const buyerId = m.sender;
  const sale = pendingSales.get(buyerId);
  if (!sale) return;
  if (!m.db) return;

  const response = m.originalText.toLowerCase();

  if (response === 'aceptar' || response === 'قبول') {
    const { seller, buyer, character, price } = sale;
    try {
      const { rows } = await m.db.query('SELECT exp FROM usuarios WHERE id = $1', [buyer]);
      const buyerData = rows[0];

      if (!buyerData || buyerData.exp < price) {
        pendingSales.delete(buyerId);
        clearTimeout(sale.timer);
        return conn.reply(
          m.chat,
          '⚠️ ليس لديك عدد كافٍ من النقاط (exp) لشراء هذه الشخصية.',
          m
        );
      }

      const sellerExp = Math.round(price * 0.75);
      await m.db.query('UPDATE usuarios SET exp = exp - $1 WHERE id = $2', [price, buyer]);
      await m.db.query('UPDATE usuarios SET exp = exp + $1 WHERE id = $2', [sellerExp, seller]);
      await m.db.query(
        'UPDATE characters SET claimed_by = $1, price = $2, for_sale = false, seller = null WHERE id = $3',
        [buyer, price, character.id]
      );

      clearTimeout(sale.timer);
      pendingSales.delete(buyerId);

      return conn.reply(
        m.chat,
        `✅ @${buyer.split('@')[0]} اشترى *${character.name}* من @${seller.split('@')[0]} مقابل ${price} exp.`,
        m,
        { mentions: [buyer, seller] }
      );
    } catch (e) {
      clearTimeout(sale.timer);
      pendingSales.delete(buyerId);
      return conn.reply(m.chat, '⚠️ حدث خطأ أثناء معالجة الشراء.', m);
    }
  } else if (response === 'rechazar' || response === 'رفض') {
    clearTimeout(sale.timer);
    pendingSales.delete(buyerId);
    return conn.reply(
      m.chat,
      `❌ لقد رفضت عرض شراء *${sale.character.name}*.`,
      m
    );
  }
};

// ⚙️ معلومات الأوامر
handler.help = ['rw-vender', 'بيع', 'اعرض'];
handler.tags = ['gacha'];
handler.command = /^(rw-vender|بيع|اعرض)$/i;
handler.register = true;

export default handler;
