import axios from 'axios';
import { pinterest } from '../lib/scraper.js';

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) return m.reply(`*⚠️ أدخل كلمة البحث.*\nمثال: ${usedPrefix + command} نايون`);
    m.react("⌛");
    
    try {
        const downloadAttempts = [
            async () => {
                const response = await pinterest.search(text, 6);
                const pins = response.result.pins.slice(0, 5);
                return pins.map(pin => ({
                    title: pin.title || text,
                    description: `🔎 بواسطة: ${pin.uploader.username}`,
                    image: pin.media.images.orig.url
                }));
            },
            async () => {
                const res = await axios.get(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}`);
                const data = res.data.data.slice(0, 5);
                return data.map(result => ({
                    title: result.grid_title || text, 
                    description: '', 
                    image: result.images_url 
                }));
            },
            async () => {
                const res = await axios.get(`https://api.dorratz.com/v2/pinterest?q=${text}`);
                const data = res.data.slice(0, 5);
                return data.map(result => ({
                    title: result.fullname || text, 
                    description: `*🔸️ المؤلف:* ${result.upload_by}\n*🔸️ المتابعون:* ${result.followers}`, 
                    image: result.image 
                }));
            },
            async () => {
                const res = await axios.get(`${info.apis}/search/pinterestv2?text=${encodeURIComponent(text)}`);
                const data = res.data.data.slice(0, 5);
                return data.map(result => ({
                    title: result.description || text, 
                    description: `🔎 المؤلف: ${result.name} (@${result.username})`, 
                    image: result.image 
                }));
            }
        ];

        let results = null;
        for (const attempt of downloadAttempts) {
            try {
                results = await attempt();
                if (results && results.length > 0) break; 
            } catch (err) {
                console.error(`خطأ في المحاولة: ${err.message}`);
                continue;
            }
        }

        if (!results || results.length === 0) throw new Error(`❌ لم يتم العثور على نتائج لـ "${text}".`);
        
        const medias = results.map(result => ({ 
            type: "image", 
            data: { url: result.image } 
        }));
        
        await conn.sendAlbumMessage(m.chat, medias, `✅ نتائج البحث عن: ${text}`, m);
        m.react("✅️");
        
    } catch (e) {
        await m.reply(e.message || `❌ لم يتم العثور على نتائج لـ "${text}".`);
        m.react("❌️");
    }
};

handler.help = ['pinterest <كلمة البحث>', 'بين <كلمة البحث>'];
handler.tags = ['buscadores'];
handler.command = /^(pinterest|بين)$/i;   // ← أضفنا "بين"
handler.register = true;
handler.limit = 1;

export default handler;
