import os from 'os';
import cp from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';
const exec = promisify(cp.exec).bind(cp);

const handler = async (m) => {
    let o;
    m.react("🚀") 
    try {
        o = await exec('python3 speed.py --secure --share');
        const {stdout, stderr} = o;
        if (stdout.trim()) {
            const match = stdout.match(/http[^"]+\.png/);
            const urlImagen = match ? match[0] : null;
            await conn.relayMessage(m.chat, {
                extendedTextMessage:{ 
                    text: stdout.trim(), 
                    contextInfo: { 
                        externalAdReply: {
                            title: "< ＩＮＦＯ - ＳＰＥＥＤＴＥＳＴ />", 
                            body: `${toTime(os.uptime() * 1000)}`, 
                            mediaType: 1,
                            previewType: 0, 
                            renderLargerThumbnail: true,
                            thumbnailUrl: urlImagen, 
                            sourceUrl: info.nna 
                        }
                    }, 
                    mentions: null 
                }
            }, {quoted: m})
        }
        if (stderr.trim()) { 
            const match2 = stderr.match(/http[^"]+\.png/);
            const urlImagen2 = match2 ? match2[0] : null;    
            await conn.relayMessage(m.chat, {
                extendedTextMessage:{
                    text: stderr.trim(), 
                    contextInfo: {
                        externalAdReply: {
                            title: "< ＩＮＦＯ - ＳＰＥＥＤＴＥＳＴ />", 
                            body: `${toTime(os.uptime() * 1000)}`, 
                            mediaType: 1, 
                            previewType: 0, 
                            renderLargerThumbnail: true,
                            thumbnailUrl: urlImagen2, 
                            sourceUrl: info.nna 
                        }
                    }, 
                    mentions: null 
                }
            }, {quoted: m})
        }
    } catch (e) {
        o = e.message;
        return m.reply(o)
    }
};

// إضافة الأوامر العربية
handler.help = ['speedtest', 'السرعة', 'قياس'];
handler.tags = ['main'];
handler.command = /^(speedtest?|test?speed|سرعة|قياس|السرعة|القياس|نت)$/i;
handler.register = true

export default handler;

function toTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return `${days} يوم, ${hours % 24} ساعة, ${minutes % 60} دقيقة, ${seconds % 60} ثانية`;
}
