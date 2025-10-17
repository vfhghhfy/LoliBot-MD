//___________________________________
//الكود مشفر لأسباب أمنية بواسطة: https://github.com/elrebelde21
const _0x5c4eee = _0x2ed2;
function _0x2ed2(_0xabffba, _0x38e7ec) {
    const _0x17d7ff = _0x17d7();
    return _0x2ed2 = function(_0x2ed296, _0x3d9ef9) {
        _0x2ed296 = _0x2ed296 - 0x1c2;
        let _0x38acab = _0x17d7ff[_0x2ed296];
        return _0x38acab;
    }, _0x2ed2(_0xabffba, _0x38e7ec);
}(function(_0x377edc, _0x28f7db) {
    const _0x4fadee = _0x2ed2,
        _0x379313 = _0x377edc();
    while (!![]) {
        try {
            const _0x25dd1e = parseInt(_0x4fadee(0x1cc)) / 0x1 * (-parseInt(_0x4fadee(0x1c4)) / 0x2) + -parseInt(_0x4fadee(0x1cd)) / 0x3 * (-parseInt(_0x4fadee(0x1c9)) / 0x4) + -parseInt(_0x4fadee(0x1d3)) / 0x5 * (parseInt(_0x4fadee(0x1c6)) / 0x6) + parseInt(_0x4fadee(0x1ca)) / 0x7 * (parseInt(_0x4fadee(0x1d2)) / 0x8) + parseInt(_0x4fadee(0x1c8)) / 0x9 + parseInt(_0x4fadee(0x1cf)) / 0xa * (-parseInt(_0x4fadee(0x1d1)) / 0xb) + -parseInt(_0x4fadee(0x1d0)) / 0xc;
            if (_0x25dd1e === _0x28f7db) break;
            else _0x379313['push'](_0x379313['shift']());
        } catch (_0x529bab) {
            _0x379313['push'](_0x379313['shift']());
        }
    }
}(_0x17d7, 0xc09b9));
import _0x587d92 from 'node-fetch';
import _0x386c3f from 'crypto';
import _0x554bd8 from 'pg';
const {
    Pool
} = _0x554bd8,
SECRET = 'SkyUltraSuperSecretKey2025',
timestamp = Date['now']()[_0x5c4eee(0x1ce)](),
signature = _0x386c3f['createHmac'](_0x5c4eee(0x1cb), SECRET)[_0x5c4eee(0x1c3)](timestamp)[_0x5c4eee(0x1d5)]('hex'),
res = await _0x587d92(_0x5c4eee(0x1c5), {
    'headers': {
        'Authorization': _0x5c4eee(0x1c7),
        'User-Agent': 'skyultra-bot-client',
        'x-timestamp': timestamp,
        'x-signature': signature
    }
}),
POSTGRES_URI = (await res[_0x5c4eee(0x1c2)]())[_0x5c4eee(0x1d4)]();
export const db = new Pool({
    'connectionString': POSTGRES_URI
});

function _0x17d7() {
    const _0x3f262f = ['sha256', '13857pMyDqD', '4182879ppYWVS', 'toString', '263740pBNHzf', '11613816dQVWFX', '209SHALnX', '5257056WNZGtN', '196240gZUpXF', 'trim', 'digest', 'text', 'update', '192PqAZcc', 'https://db-private.vercel.app/api/pg', '66DmfiDc', 'Bearer\x20skyultra-bot-access-2025', '11801592fDFfdB', '4WZGUWc', '14nVshTZ'];
    _0x17d7 = function() {
        return _0x3f262f;
    };
    return _0x17d7();
}
//__________________________________

// توصيل قاعدة البيانات
db.connect()
    .then(() => console.log("✅ تم الاتصال بقاعدة البيانات (PostgreSQL) بنجاح."))
    .catch(err => console.error("[ ❌ ] خطأ في الاتصال بقاعدة البيانات:", err));

// دالة لتهيئة الجداول
async function initTables() {
    try {
        // جدول إعدادات المجموعات
        await db.query(`CREATE TABLE IF NOT EXISTS group_settings (
            group_id TEXT PRIMARY KEY
        );`);

        const columnasGrupos = [
            ['welcome', 'BOOLEAN DEFAULT true'], // ترحيب
            ['detect', 'BOOLEAN DEFAULT true'], // كشف
            ['antifake', 'BOOLEAN DEFAULT false'], // مضاد للحسابات المزيفة
            ['antilink', 'BOOLEAN DEFAULT false'], // مضاد للروابط
            ['antilink2', 'BOOLEAN DEFAULT false'], // مضاد للروابط 2
            ['modohorny', 'BOOLEAN DEFAULT false'], // وضع المحتوى الجنسي
            ['audios', 'BOOLEAN DEFAULT false'], // السماح بالملفات الصوتية
            ['nsfw_horario', 'TEXT'], // جدول المحتوى الجنسي
            ['antiStatus', 'BOOLEAN DEFAULT false'], // مضاد للحالة
            ['modoadmin', 'BOOLEAN DEFAULT false'], // وضع الأدمن
            ['photowelcome', 'BOOLEAN DEFAULT false'], // صورة ترحيب
            ['photobye', 'BOOLEAN DEFAULT false'], // صورة وداع
            ['autolevelup', 'BOOLEAN DEFAULT true'], // ترقية تلقائية للمستوى
            ['sWelcome', 'TEXT'], // نص الترحيب
            ['sBye', 'TEXT'], // نص الوداع
            ['sPromote', 'TEXT'], // نص الترقية
            ['sDemote', 'TEXT'], // نص التنزيل
            ['banned', 'BOOLEAN DEFAULT false'], // محظور
            ['expired', 'BIGINT DEFAULT 0'], // منتهي الصلاحية
            ['memory_ttl', 'INTEGER DEFAULT 86400'], // مدة الذاكرة
            ['sAutorespond', 'TEXT'], // الرد التلقائي
            ['primary_bot', 'TEXT'] // البوت الرئيسي
        ];

        // إضافة الأعمدة إذا لم تكن موجودة
        for (const [columna, tipo] of columnasGrupos) {
            await db.query(`ALTER TABLE group_settings ADD COLUMN IF NOT EXISTS ${columna} ${tipo}`);
        }

        // جدول المستخدمين
        await db.query(`CREATE TABLE IF NOT EXISTS usuarios (
            id TEXT PRIMARY KEY
        );`);

        const columnasUsuarios = [
            ['nombre', 'TEXT'], // الاسم
            ['registered', 'BOOLEAN DEFAULT false'], // مسجل
            ['num', 'TEXT'], // الرقم
            ['lid', 'TEXT UNIQUE'], // المعرف
            ['banned', 'BOOLEAN DEFAULT false'], // محظور
            ['warn_pv', 'BOOLEAN DEFAULT false'], // تحذير خاص
            ['warn', 'INTEGER DEFAULT 0'], // تحذيرات
            ['warn_antiporn', 'INTEGER DEFAULT 0'], // تحذيرات مضاد الإباحية
            ['warn_estado', 'INTEGER DEFAULT 0'], // تحذيرات الحالة
            ['edad', 'INTEGER'], // العمر
            ['money', 'INTEGER DEFAULT 100'], // المال
            ['limite', 'INTEGER DEFAULT 10'], // الحد
            ['exp', 'INTEGER DEFAULT 0'], // الخبرة
            ['banco', 'INTEGER DEFAULT 0'], // البنك
            ['level', 'INTEGER DEFAULT 0'], // المستوى
            ['role', "TEXT DEFAULT 'novato'"], // الرتبة
            ['reg_time', 'TIMESTAMP'], // وقت التسجيل
            ['serial_number', 'TEXT'], // الرقم التسلسلي
            ['sticker_packname', 'TEXT'], // اسم حزمة الملصقات
            ['sticker_author', 'TEXT'], // مؤلف الملصقات
            ['ry_time', 'BIGINT DEFAULT 0'], // وقت الرد
            ['lastwork', 'BIGINT DEFAULT 0'], // آخر عمل
            ['lastmiming', 'BIGINT DEFAULT 0'], // آخر تعدين
            ['lastclaim', 'BIGINT DEFAULT 0'], // آخر مطالبة
            ['dailystreak', 'BIGINT DEFAULT 0'], // التسلسل اليومي
            ['lastcofre', 'BIGINT DEFAULT 0'], // آخر صندوق
            ['lastrob', 'BIGINT DEFAULT 0'], // آخر سرقة
            ['lastslut', 'BIGINT DEFAULT 0'], // آخر دعارة
            ['timevot', 'BIGINT DEFAULT 0'], // وقت التصويت
            ['wait', 'BIGINT DEFAULT 0'], // الانتظار
            ['crime', 'BIGINT DEFAULT 0'], // الجريمة
            ['marry', 'TEXT DEFAULT NULL'], // متزوج
            ['marry_request', 'TEXT DEFAULT NULL'], // طلب زواج
            ['razon_ban', 'TEXT'], // سبب الحظر
            ['avisos_ban', 'INTEGER DEFAULT 0'], // إنذارات الحظر
            ['gender', 'TEXT'], // الجنس
            ['birthday', 'DATE'] // تاريخ الميلاد
        ];

        for (const [columna, tipo] of columnasUsuarios) {
            await db.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ${columna} ${tipo}`);
        }

        // جدول الدردشات
        await db.query(`CREATE TABLE IF NOT EXISTS chats (
            id TEXT PRIMARY KEY,
            is_group BOOLEAN DEFAULT true,
            timestamp BIGINT,
            is_active BOOLEAN DEFAULT true,
            bot_id TEXT,
            joined BOOLEAN DEFAULT true
        );`);

        // جدول الرسائل
        await db.query(`CREATE TABLE IF NOT EXISTS messages (
            user_id TEXT,
            group_id TEXT,
            message_count INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, group_id)
        );`);

        // جدول الشخصيات
        await db.query(`CREATE TABLE IF NOT EXISTS characters (
            id SERIAL PRIMARY KEY
        );`);

        const columnasCharacters = [
            ['name', 'TEXT NOT NULL'], // الاسم
            ['url', 'TEXT NOT NULL'], // الرابط
            ['tipo', 'TEXT'], // النوع
            ['anime', 'TEXT'], // الأنمي
            ['rareza', 'TEXT'], // الندرة
            ['price', 'INTEGER NOT NULL'], // السعر
            ['previous_price', 'INTEGER'], // السعر السابق
            ['claimed_by', 'TEXT'], // مطلوب بواسطة
            ['for_sale', 'BOOLEAN DEFAULT false'], // للبيع
            ['seller', 'TEXT'], // البائع
            ['votes', 'INTEGER DEFAULT 0'], // الأصوات
            ['last_removed_time', 'BIGINT'] // وقت الإزالة الأخير
        ];

        for (const [columna, tipo] of columnasCharacters) {
            await db.query(`ALTER TABLE characters ADD COLUMN IF NOT EXISTS ${columna} ${tipo}`);
        }

        // جدول البوتات الفرعية
        await db.query(`CREATE TABLE IF NOT EXISTS subbots (
            id TEXT PRIMARY KEY
        );`);

        // جدول التقارير
        await db.query(`CREATE TABLE IF NOT EXISTS reportes (
            id SERIAL PRIMARY KEY,
            sender_id TEXT NOT NULL,
            sender_name TEXT,
            mensaje TEXT NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            enviado BOOLEAN DEFAULT false,
            tipo TEXT DEFAULT 'reporte'
        );`);

        const columnasSubbots = [
            ['tipo', "TEXT DEFAULT 'null'"], // النوع
            ['name', 'TEXT'], // الاسم
            ['logo_url', 'TEXT'], // رابط الشعار
            ['prefix', "TEXT[] DEFAULT ARRAY['/', '.', '#']"], // البادئات
            ['mode', "TEXT DEFAULT 'public'"], // الوضع
            ['owners', 'TEXT[]'], // المالكون
            ['anti_private', 'BOOLEAN DEFAULT false'], // مضاد الخاص
            ['anti_call', 'BOOLEAN DEFAULT true'], // مضاد المكالمات
            ['privacy', 'BOOLEAN DEFAULT false'], // الخصوصية
            ['prestar', 'BOOLEAN DEFAULT false'] // الإعارة
        ];

        for (const [columna, tipo] of columnasSubbots) {
            await db.query(`ALTER TABLE subbots ADD COLUMN IF NOT EXISTS ${columna} ${tipo}`);
        }

        // جدول ذاكرة الدردشة
        await db.query(`CREATE TABLE IF NOT EXISTS chat_memory (
            chat_id TEXT PRIMARY KEY,
            history JSONB,
            updated_at TIMESTAMP DEFAULT NOW()
        );`);

        // جدول الإحصائيات
        await db.query(`CREATE TABLE IF NOT EXISTS stats (
            command TEXT PRIMARY KEY,
            count INTEGER DEFAULT 1
        );`);

    } catch (err) {
        console.error("[❌] خطأ في إنشاء الجداول أو الأعمدة:", err);
    }
}

// دالة للحصول على إعدادات البوت الفرعي
export async function getSubbotConfig(botId) {
    try {
        const cleanId = botId.replace(/:\d+/, "");
        const res = await db.query("SELECT * FROM subbots WHERE id = $1", [cleanId]);

        if (res.rows.length > 0) return res.rows[0];

        // الإعدادات الافتراضية
        return {
            prefix: ['/', '.', '#'],
            mode: 'public',
            anti_private: true,
            anti_call: false,
            owners: [],
            name: null,
            logo_url: null,
            privacy: null,
            prestar: null,
            tipo: null
        };
    } catch (err) {
        console.error("❌ خطأ في الحصول على إعدادات البوت الفرعي من قاعدة البيانات:", err);
        return {
            prefix: ['/', '.', '#'],
            mode: 'public',
            anti_private: true,
            anti_call: false,
            owners: [],
            name: null,
            logo_url: null,
            privacy: null,
            prestar: null,
            tipo: null
        };
    }
}

// تهيئة الجداول
initTables();
