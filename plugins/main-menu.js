import moment from 'moment-timezone'
import { xpRange } from '../lib/levelling.js'
import { db } from '../lib/postgres.js'
import fs from "fs";

const cooldowns = new Map()
const COOLDOWN_DURATION = 180000 // ⏰ 3 دقائق

const tags = {
    main: '🎀  مـعـلـومـات الـبـوت  🎀',
    jadibot: '✨  الـبـوتـات الـفـرعـيـة  ✨',
    downloader: '🚀  الـتـحـمـيـلات  🚀',
    game: '🎮  الـعـاب  🎮',
    gacha: '🎴  نـظـام الـجـاتـشـا  🎴',
    rg: '📝  نـظـام الـتـسـجـيـل  📝',
    group: '👥  إدارة الـمـجـمـوعـة  👥',
    nable: '⚡  تـفـعـيـل/تـعـطـيـل  ⚡',
    nsfw: '🔞  أوامـر +18  🔞',
    buscadores: '🔍  الـبـحـث  🔍',
    sticker: '🖼️  الـمـلـصـقـات  🖼️',
    econ: '💰  نـظـام الـإقـتـصـاد  💰',
    convertidor: '🔄  الـمـحـولـات  🔄',
    logo: '🎨  صـنـع الـشـعـارات  🎨',
    tools: '🛠️  الـأدوات  🛠️',
    randow: '🎲  عـشـوائـي  🎲',
    efec: '🎵  تـأثـيـرات الـصـوت  🎵',
    owner: '👑  الـمـطـور  👑'
}

const defaultMenu = {
    before: `
╭───「 🌸 *مرحباً يا* %name 🌸 」───•
│
│ 📅 *التاريخ:* %fecha
│ ⏰ *الوقت:* %hora 🇸🇦
│ 👤 *المستخدم:* %totalreg
│ ⚡ *وقت التشغيل:* %muptime
│ 💎 *حدودك:* %limit
│ %botOfc
│
│ 📊 *المستخدمون المسجلون:* %toUserReg من %toUsers
│
│ 🎯 *للحصول على آخر التحديثات:*
│ %nna2
│
│ 💬 *يمكنك التحدث مع البوت:*
│ @%BoTag ما هي الـ API؟
│
╰───「 🌸 *%wm* 🌸 」───•

🎀 *الأقسام المتاحة:* 🎀
`.trim(),
    
    header: '\n✨ *❬ %category ❭* ✨\n',
    body: '   🎯 *%cmd* %islimit %isPremium\n',
    footer: '\n╰─────────────────🌸\n',
    after: `
╭───「 📞 *للتواصل* 」───•
│
│ 🌐 *للمساعدة والدعم:*
│ %nna
│
│ 📢 *تابع آخر الأخبار:*
│ %nna2
│
╰───「 🎀 *%wm* 🎀 」───•
    `.trim()
}

const handler = async (m, { conn, usedPrefix: _p, args }) => {
    const chatId = m.key?.remoteJid;
    const now = Date.now();
    const chatData = cooldowns.get(chatId) || { lastUsed: 0, menuMessage: null };
    const timeLeft = COOLDOWN_DURATION - (now - chatData.lastUsed);

    if (timeLeft > 0) {
        try {
            const senderTag = m.sender ? `@${m.sender.split('@')[0]}` : '👤 @مستخدم';
            await conn.reply(chatId, `
╭───「 ⚠️ *تنبيه* ⚠️ 」───•
│
│ 🌸 *يا* ${senderTag}
│ 📜 *القائمة موجودة بالفعل*
│ 
│ ⏳ *سيتم إرسالها كل 3 دقائق*
│ 🚫 *لتجنب السبام*
│ 
│ 👆 *انتقل للأعلى لرؤيتها كاملة*
│
╰───「 🌸 *%wm* 🌸 」───•
            `.trim(), chatData.menuMessage || m);
        } catch (err) {
            return;
        }
        return;
    }

    const name = m.pushName || '🌺 بدون اسم';
    const fecha = moment.tz('Asia/Riyadh').format('DD/MM/YYYY');
    const hora = moment.tz('Asia/Riyadh').format('HH:mm:ss');
    const _uptime = process.uptime() * 1000;
    const muptime = clockString(_uptime);

    let user;
    try {
        const userRes = await db.query(`SELECT * FROM usuarios WHERE id = $1`, [m.sender]);
        user = userRes.rows[0] || { limite: 0, level: 0, exp: 0, role: '🎯 عضو' };
    } catch (err) {
        user = { limite: 0, level: 0, exp: 0, role: '🎯 عضو' };
    }

    let totalreg = 0;
    let rtotalreg = 0;
    try {
        const userCountRes = await db.query(`
            SELECT COUNT(*)::int AS total,
                   COUNT(*) FILTER (WHERE registered = true)::int AS registrados
            FROM usuarios
        `);
        totalreg = userCountRes.rows[0].total;
        rtotalreg = userCountRes.rows[0].registrados;
    } catch (err) {
        // تجاهل الخطأ والمتابعة بالقيم الافتراضية
    }

    const toUsers = toNum(totalreg);
    const toUserReg = toNum(rtotalreg);
    const nombreBot = conn.user?.name || '🎀 البوت';
    const isPrincipal = conn === global.conn;
    const tipo = isPrincipal ? '🎯 البوت الرسمي' : '✨ بوت فرعي';
    
    let botOfc = '';
    let BoTag = "";
    
    if (conn.user?.id && global.conn?.user?.id) {
        const jidNum = conn.user.id.replace(/:\d+/, '').split('@')[0];
        botOfc = (conn.user.id === global.conn.user.id) 
            ? `│ 🤖 *البوت الرسمي:* wa.me/${jidNum}` 
            : `│ 🌸 *أنا بوت فرعي تابع ل:* wa.me/${global.conn.user.id.replace(/:\d+/, '').split('@')[0]}`;
        BoTag = jidNum;
    }

    const multiplier = "750" || 1.5;
    const { min, xp, max } = xpRange(user.level || 0, multiplier);

    const help = Object.values(global.plugins).filter(p => !p.disabled).map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium
    }));

    const categoryRequested = args[0]?.toLowerCase();
    const validTags = categoryRequested && tags[categoryRequested] ? [categoryRequested] : Object.keys(tags);
    
    let text = defaultMenu.before;

    for (const tag of validTags) {
        const comandos = help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help);
        if (!comandos.length) continue;

        text += defaultMenu.header.replace(/%category/g, tags[tag]);
        
        for (const plugin of comandos) {
            for (const helpCmd of plugin.help) {
                text += defaultMenu.body
                    .replace(/%cmd/g, plugin.prefix ? helpCmd : _p + helpCmd)
                    .replace(/%islimit/g, plugin.limit ? '💎' : '')
                    .replace(/%isPremium/g, plugin.premium ? '💰' : '');
            }
        }
        text += defaultMenu.footer;
    }
    
    text += defaultMenu.after;

    const replace = {
        '%': '%', 
        p: _p, 
        name,
        limit: user.limite || 0,
        level: user.level || 0,
        role: user.role || '🎯 عضو',
        totalreg, 
        rtotalreg, 
        toUsers, 
        toUserReg,
        exp: (user.exp || 0) - min,
        maxexp: xp,
        totalexp: user.exp || 0,
        xp4levelup: max - (user.exp || 0),
        fecha, 
        hora, 
        muptime,
        wm: info.wm,
        botOfc: botOfc,
        BoTag: BoTag,
        nna2: info.nna2,
        nna: info.nna
    };

    text = String(text).replace(
        new RegExp(`%(${Object.keys(replace).join('|')})`, 'g'), 
        (_, key) => replace[key] ?? ''
    );

    try {
        let pp = fs.readFileSync('./media/Menu2.jpg');
        const menuMessage = await conn.sendMessage(chatId, { 
            text: text, 
            contextInfo: { 
                forwardedNewsletterMessageInfo: { 
                    newsletterJid: "120363305025805187@newsletter",
                    newsletterName: "🎀 البوت السحري 🎀" 
                }, 
                forwardingScore: 999, 
                isForwarded: true, 
                mentionedJid: await conn.parseMention(text), 
                externalAdReply: { 
                    mediaUrl: [info.nna, info.nna2, info.md].getRandom(), 
                    mediaType: 2, 
                    showAdAttribution: false, 
                    renderLargerThumbnail: false, 
                    title: "🎀 الـقـائـمـة الـرئـيـسـيـة 🎀", 
                    body: `${nombreBot} (${tipo})`, 
                    thumbnailUrl: info.img2, 
                    sourceUrl: "https://skyultraplus.com" 
                }
            }
        }, { quoted: m });
        
        cooldowns.set(chatId, { lastUsed: now, menuMessage: menuMessage })
        m.react('🌸');
        
    } catch (err) {    
        m.react('❌')
        console.error('🎀 خطأ في إرسال القائمة:', err);
    }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help|allmenu|menú|قائمة|الاوامر|المنيو|命令)$/i

export default handler

const clockString = ms => {
    const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

const toNum = n => (n >= 1_000_000) ? (n / 1_000_000).toFixed(1) + 'M'
    : (n >= 1_000) ? (n / 1_000).toFixed(1) + 'k'
    : n.toString()
