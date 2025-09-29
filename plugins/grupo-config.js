let handler = async (m, { conn, args, usedPrefix, command, isOwner, text}) => {
let groupId = m.isGroup ? m.chat : null;
if (!m.isGroup && !isOwner) return m.reply('⚠️ فقط المالك يمكنه استخدام هذا الأمر في الخاص.');
let identifier, action, target;

if (!m.isGroup && !m.isAdmin && isOwner) {
if (args.length < 2) return m.reply('⚠️ تنسيق غير صحيح. استخدم: !مجموعة [معرف/رابط] [ID/URL] - [إجراء] [+رقم إذا ينطبق]')

if (args[0].startsWith('معرف')) {
identifier = args[1];
action = args[2]?.replace('-', '').trim().toLowerCase();
target = args[3]?.replace('+', '') + '@s.whatsapp.net';
groupId = identifier;
} else if (args[0].match(/chat\.whatsapp\.com/)) {
identifier = args[0];
if (args[1] === '-') {
action = args[2]?.trim().toLowerCase();
target = args[3]?.replace('+', '') + '@s.whatsapp.net';
} else {
action = args[1]?.replace('-', '').trim().toLowerCase();
target = args[2]?.replace('+', '') + '@s.whatsapp.net';
}
const inviteCode = identifier.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:invite\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1];
if (!inviteCode) return m.reply( '⚠️ رابط غير صالح. استخدم رابط واتساب صالح.')
try {
const inviteInfo = await conn.groupGetInviteInfo(inviteCode);
groupId = inviteInfo.id;
} catch (e) {
return m.reply( '⚠️ تعذر الحصول على معلومات المجموعة. تحقق من الرابط أو أن البوت لديه صلاحية.')
}} else if (args[0] === 'رابط') {
identifier = args[1];
if (args[2] === '-') {
action = args[3]?.trim().toLowerCase();
target = args[4]?.replace('+', '') + '@s.whatsapp.net';
} else {
action = args[2]?.replace('-', '').trim().toLowerCase();
target = args[3]?.replace('+', '') + '@s.whatsapp.net';
}
if (!identifier.match(/chat\.whatsapp\.com/)) {
return m.reply('⚠️ يجب تقديم رابط صالح.')
}
const inviteCode = identifier.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:invite\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1];
if (!inviteCode) return m.reply('⚠️ رابط غير صالح. استخدم رابط واتساب صالح.')
try {
const inviteInfo = await conn.groupGetInviteInfo(inviteCode);
groupId = inviteInfo.id;
} catch (e) {
return m.reply( '⚠️ تعذر الحصول على معلومات المجموعة. تحقق من الرابط أو أن البوت لديه صلاحية.')
}} else {
return m.reply( '⚠️ استخدم "معرف" أو "رابط" كأول وسيط، أو مرر رابطًا صالحًا مباشرة.')
}} else if (m.isGroup) {
action = args[0]?.toLowerCase();
target = args[1]?.replace(/@/, '') + '@s.whatsapp.net';
}

if (!groupId) return m.reply('⚠️ يجب أن تكون في مجموعة أو تحديد معرف/رابط في الخاص.');
if (!action) return m.reply( '⚠️ يجب تحديد إجراء (فتح، إغلاق، رفع، إلخ).')

// تحويل الأوامر العربية
const actionTraducida = traducirAccion(action);

switch (actionTraducida) {
case 'abrir': case 'open': case 'abierto':
await conn.groupSettingUpdate(groupId, 'not_announcement');
m.reply(`🟢 تم فتح المجموعة! الجميع يمكنه الكتابة الآن.`);
break;

case 'cerrar': case 'close': case 'cerrado':
await conn.groupSettingUpdate(groupId, 'announcement');
m.reply(`⚠️ تم إغلاق المجموعة! فقط المشرفون يمكنهم الكتابة.`);
break;

case 'addadmin': case 'promote': case 'daradmin':
if (!target) return m.reply('⚠️ حدد رقمًا (مثال: - رفع +20123456789) أو ضع علامة في المجموعة.')
await conn.groupParticipantsUpdate(groupId, [target], 'promote');
m.reply(`✅ @${target.split('@')[0]} أصبح مشرفًا الآن.`);
break;

case 'removeadmin': case 'demote': case 'quitaradmin':
if (!target) return m.reply('⚠️ حدد رقمًا (مثال: - تنزيل +20123456789) أو ضع علامة في المجموعة.')
await conn.groupParticipantsUpdate(groupId, [target], 'demote');
m.reply(`✅ @${target.split('@')[0]} لم يعد مشرفًا.`);
break;

case 'kick': case 'eliminar':
if (!target) return m.reply('⚠️ حدد رقمًا (مثال: - طرد +20123456789) أو ضع علامة في المجموعة.')
await conn.groupParticipantsUpdate(groupId, [target], 'remove');
m.reply(`🗑️ @${target.split('@')[0]} تم طرده من المجموعة.`);
break;

case 'aprobar':
if (!target) return m.reply('⚠️ حدد رقمًا (مثال: - موافقة +20123456789).')
await conn.groupRequestParticipantsUpdate(groupId, [target], 'approve');
m.reply(`✅ @${target.split('@')[0]} تمت الموافقة عليه في المجموعة.`);
break;
default:
return m.reply(`*⚠️ أمر غير صالح*\n\n*في المجموعة:*\n${usedPrefix + command} فتح\n${usedPrefix + command} إغلاق\n${usedPrefix + command} رفع @مستخدم\n${usedPrefix + command} تنزيل @مستخدم\n${usedPrefix + command} طرد @مستخدم\n\n*في الخاص (للمالك):*\n${usedPrefix + command} معرف [ID] - فتح\n${usedPrefix + command} رابط [URL] - إغلاق\n${usedPrefix + command} [URL] - إغلاق\n${usedPrefix + command} معرف [ID] - رفع +رقم`)
}
};

// الأوامر العربية المضافة
handler.help = ['group open/close', 'grupo abrir/cerrar', 'grupo aprobar +number', 'مجموعة فتح/إغلاق', 'مجموعة رفع @user'];
handler.tags = ['group', 'المجموعة', 'إدارة'];
handler.command = /^(group|grupo|مجموعة|جروب)$/i;
export default handler;

// دالة لترججة الأوامر العربية
function traducirAccion(accion) {
  const traducciones = {
    'فتح': 'abrir',
    'إغلاق': 'cerrar',
    'مفتوح': 'abrir',
    'مغلق': 'cerrar',
    'رفع': 'daradmin',
    'ترقية': 'daradmin',
    'تنزيل': 'quitaradmin',
    'إزالة': 'quitaradmin',
    'طرد': 'eliminar',
    'حذف': 'eliminar',
    'موافقة': 'aprobar',
    'قبول': 'aprobar',
    'open': 'abrir',
    'close': 'cerrar',
    'promote': 'daradmin',
    'demote': 'quitaradmin',
    'kick': 'eliminar',
    'approve': 'aprobar'
  };
  return traducciones[accion] || accion;
}
