import axios from 'axios';
import fetch from 'node-fetch';
import search from 'yt-search';
const userMessages = new Map();
const userRequests = {};

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return m.reply(`*🤔 ماذا تبحث؟ أدخل الاسم لتحميل الموسيقى من سبوتيفاي، مثال:* ${usedPrefix + command} ozuna`)
if (userRequests[m.sender]) return await conn.reply(m.chat, `⚠️ يا @${m.sender.split('@')[0]} أيها الغبي، أنت بالفعل تقوم بتحميل أغنية 🙄\nانتظر حتى ينتهي التحميل الحالي قبل طلب آخر. 👆`, userMessages.get(m.sender) || m)
userRequests[m.sender] = true;
m.react(`⌛`);
try {
const spotify = await fetch(`${info.apis}/search/spotify?q=${text}`);
const song = await spotify.json();
if (!song.data || song.data.length === 0) return m
reply('⚠️ لم يتم العثور على نتائج لهذا البحث.')
const track = song.data[0];
const spotifyMessage = `*• العنوان:* ${track.title}\n*• الفنان:* ${track.artist}\n*• الألبوم:* ${track.album}\n*• المدة:* ${track.duration}\n*• النشر:* ${track.publish}\n\n> 🚀 *جاري إرسال الأغنية، انتظر لحظة....*`;
const message = await conn.sendMessage(m.chat, { text: spotifyMessage, 
contextInfo: {
forwardingScore: 1,
isForwarded: true,
externalAdReply: {
showAdAttribution: true,
containsAutoReply: true,
renderLargerThumbnail: true,
title: track.title,
body: "جاري إرسال الأغنية، انتظر لحظة 🚀",
mediaType: 1,
thumbnailUrl: track.image,
mediaUrl: track.url,
sourceUrl: track.url
}}}, { quoted: m });
userMessages.set(m.sender, message);

const downloadAttempts = [async () => {
const res = await fetch(`https://api.siputzx.my.id/api/d/spotify?url=${track.url}`);
const data = await res.json();
return data.data.download;
},
async () => {
const res = await fetch(`${info.apis}/download/spotifydl?url=${track.url}`);
const data = await res.json();
return data.data.url;
}];

let downloadUrl = null;
for (const attempt of downloadAttempts) {
try {
downloadUrl = await attempt();
if (downloadUrl) break; 
} catch (err) {
console.error(`خطأ في المحاولة: ${err.message}`);
continue; 
}}

if (!downloadUrl) throw new Error('لم يتمكن من تحميل الأغنية من أي API');
await conn.sendMessage(m.chat, { audio: { url: downloadUrl }, fileName: `${track.title}.mp3`, mimetype: 'audio/mpeg', contextInfo: {} }, { quoted: m });
m.react('✅️');
} catch (error) {
m.reply(`\`\`\`⚠️ حدث خطأ ⚠️\`\`\`\n\n> *أبلغ عن الخطأ التالي إلى مطوري باستخدام الأمر:* #report\n\n>>> ${error} <<<< `);
console.log(error);
m.react('❌');
handler.limit = false;
} finally {
delete userRequests[m.sender];
}};
handler.help = ['spotify'];
handler.tags = ['downloader'];
handler.command = /^(spotify|سبوتیفاي)$/i;
handler.register = true;
handler.limit = 1;

export default handler;

async function spotifyxv(query) {
  let token = await tokens();
  try {
    let response = await axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/search?q=' + query + '&type=track',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });
    const tracks = response.data.tracks.items;
    const results = tracks.map((track) => ({
      name: track.name,
      artista: track.artists.map((artist) => artist.name),
      album: track.album.name,
      duracion: timestamp(track.duration_ms),
      url: track.external_urls.spotify,
      imagen: track.album.images.length ? track.album.images[0].url : '',
    }));
    return results;
  } catch (error) {
    console.error(`خطأ في spotifyxv: ${error}`);
    return [];
  }
}

async function tokens() {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from('acc6302297e040aeb6e4ac1fbdfd62c3:0e8439a1280a43aba9a5bc0a16f3f009').toString('base64'),
      },
      data: 'grant_type=client_credentials',
    });
    return response.data.access_token;
  } catch (error) {
    console.error(`خطأ في tokens: ${error}`);
    throw new Error('لم يتمكن من الحصول على رمز الوصول');
  }
}

function timestamp(time) {
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

async function getBuffer(url, options) {
  try {
    options = options || {};
    const res = await axios({
      method: 'get',
      url,
      headers: {
        DNT: 1,
        'Upgrade-Insecure-Request': 1,
      },
      ...options,
      responseType: 'arraybuffer',
    });
    return res.data;
  } catch (err) {
    return err;
  }
}

async function getTinyURL(text) {
  try {
    let response = await axios.get(`https://tinyurl.com/api-create.php?url=${text}`);
    return response.data;
  } catch (error) {
    return text;
  }
}
