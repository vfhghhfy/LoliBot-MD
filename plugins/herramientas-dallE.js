import fetch from 'node-fetch';
import axios from 'axios';
import * as cheerio from "cheerio"

const handler = async (m, {conn, text, usedPrefix, command}) => {
if (!text) return m.reply(
`⚠️ *الرجاء إدخال نص لإنشاء صورة باستخدام الذكاء الاصطناعي (DALL-E)*

📌 *مثال:*  
${usedPrefix + command} قطة تبكي 🐱😭`
)
m.react('⌛') 
try {
let response = await fetch(`https://api.dorratz.com/v3/ai-image?prompt=${text}`) 
let res = await response.json()
if (res.data.status === "success") {
const imageUrl = res.data.image_link;
await conn.sendFile(m.chat, imageUrl, 'resultado.jpg', `_💫 النتيجة: ${text}_\n\n> *✨ صورة مولدة بواسطة الذكاء الاصطناعي ✨*`, m);
m.react('✅');
}
} catch {
try {       
let answer = await flux(text)
await conn.sendFile(m.chat, answer, 'resultado.jpg', `_💫 النتيجة: ${text}_\n\n> *✨ صورة مولدة بواسطة الذكاء الاصطناعي ✨*`, m);
m.react('✅');
} catch {
try {            
const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(text)}&client_id=YuKJ2TeTdI2x92PLBA3a11kCEqxjrwVsGhrVRyLBEfU`;
const response = await axios.get(url);
if (response.data.results.length === 0) return m.react("❌") 
const imageUrl = response.data.results[0].urls.regular; 
await conn.sendFile(m.chat, imageUrl, 'resultado.jpg', `_*نتيجة البحث عن:* ${text}_`, m);
m.react('✅');
} catch {  
try {        
const url = `https://api.betabotz.eu.org/api/search/bing-img?text=${encodeURIComponent(text)}&apikey=7gBNbes8`;
const response = await axios.get(url);
if (!response.data.result || response.data.result.length === 0) return m.react("❌") 
const imageUrl = response.data.result[0];
await conn.sendFile(m.chat, imageUrl, 'resultado.jpg', `_*نتيجة البحث عن:* ${text}_`, m);
m.react('✅');
} catch {  
try {
const tiores1 = await fetch(`https://vihangayt.me/tools/imagine?q=${text}`);
const json1 = await tiores1.json();
await conn.sendFile(m.chat, json1.data, 'resultado.jpg', `_*نتيجة:* ${text}_`, m);
} catch {
try {
const tiores4 = await conn.getFile(`https://api.lolhuman.xyz/api/dall-e?apikey=${info.fgmods.key}&text=${text}`);
await conn.sendFile(m.chat, tiores4.data, 'resultado.jpg', `_*نتيجة:* ${text}_`, m);
m.react('✅') 
} catch (error) {
console.log('[❗] خطأ، جميع الـ API لا تعمل.\n' + error);
m.reply(`❌ خطأ: ${error}`) 
m.react('❌') 
}}}}}}}
handler.help = ["dalle", "تخيل", "صورة", "رسم"]
handler.tags = ["الذكاء", "buscadores"]
handler.command = /^(dall-e|dalle|ia2|cimg|openai3|a-img|aimg|imagine|تخيل|صورة|رسم|رسمية)$/i
handler.register = true
handler.limit = 1
export default handler;

// مولد صور بديل (FLUX)
const flux = async (prompt) => {
  const url = `https://lusion.regem.in/access/flux.php?prompt=${encodeURIComponent(prompt)}`
  const headers = {
    Accept: "*/*",
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, مثل Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
    Referer: "https://lusion.regem.in/?ref=taaft&utm_source=taaft&utm_medium=referral",
  }
  const response = await fetch(url, { headers })
  const html = await response.text()
  const $ = cheerio.load(html)
  return $("a.btn-navy.btn-sm.mt-2").attr("href") || null
}

// كاتب نصوص
const writer = async (input) => {
  const url = `https://ai-server.regem.in/api/index.php`
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    Accept: "*/*",
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, مثل Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
    Referer: "https://regem.in/ai-writer/",
  }
  const formData = new URLSearchParams()
  formData.append("input", input)
  const response = await fetch(url, { method: "POST", headers, body: formData })
  return response.text()
}

// إعادة صياغة
const rephrase = async (input) => {
  const url = `https://ai-server.regem.in/api/rephrase.php`
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    Accept: "*/*",
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, مثل Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
    Referer: "https://regem.in/ai-rephrase-tool/",
  }
  const formData = new URLSearchParams()
  formData.append("input", input)
  const response = await fetch(url, { method: "POST", headers, body: formData })
  return response.text()
}
