import { convert } from "./ezgif-convert.js"
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from "file-type"
import crypto from "crypto"

const randomBytes = crypto.randomBytes(5).toString("hex");
const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

/**
 * تحويل WebP إلى MP4 مع خيارات احتياطية متعددة
 * @param {Buffer|string} source - ملف WebP أو رابط URL
 * @returns {Promise<string>} رابط الفيديو المحول
 */
async function webp2mp4(source) {
    const isUrl = typeof source === 'string' && urlRegex.test(source);
 
    try {
        return await convert({
            type: 'webp-mp4',
            ...(isUrl ? {
                url: source
            } : {
                file: new Blob([source]),
                filename: randomBytes + "." + (await fileTypeFromBuffer(source)).ext
            })
        });
    } catch (error) {
        console.error("❌ خطأ في تحويل WebP إلى MP4. جرب أنواع بديلة.");

        try {
            return await convert({
                type: 'webp-avif',
                ...(isUrl ? {
                    url: source
                } : {
                    file: new Blob([source]),
                    filename: randomBytes + "." + (await fileTypeFromBuffer(source)).ext
                })
            });
        } catch (avifError) {
            console.error("❌ خطأ في تحويل WebP إلى AVIF. جرب WebP إلى GIF.");

            try {
                return await convert({
                    type: 'webp-gif',
                    ...(isUrl ? {
                        url: source
                    } : {
                        file: new Blob([source]),
                        filename: randomBytes + "." + (await fileTypeFromBuffer(source)).ext
                    })
                });
            } catch (gifError) {
                console.error("❌ خطأ في تحويل WebP إلى GIF. فشلت جميع الأنواع البديلة.");
                throw new Error("تعذر تحويل ملف WebP. حاول باستخدام ملف آخر.");
            }
        }
    }
}

/**
 * تحويل WebP إلى PNG مع خيارات احتياطية
 * @param {Buffer|string} source - ملف WebP أو رابط URL
 * @returns {Promise<string>} رابط الصورة المحولة
 */
async function webp2png(source) {
    const isUrl = typeof source === 'string' && urlRegex.test(source);

    try {
        return await convert({
            type: 'webp-png',
            ...(isUrl ? {
                url: source
            } : {
                file: new Blob([source]),
                filename: randomBytes + "." + (await fileTypeFromBuffer(source)).ext
            })
        });
    } catch (pngError) {
        console.error("❌ خطأ في تحويل WebP إلى PNG. جرب WebP إلى JPG.");

        try {
            return await convert({
                type: 'webp-jpg',
                ...(isUrl ? {
                    url: source
                } : {
                    file: new Blob([source]),
                    filename: randomBytes + "." + (await fileTypeFromBuffer(source)).ext
                })
            });
        } catch (jpgError) {
            console.error("❌ خطأ في تحويل WebP إلى JPG. فشلت جميع الأنواع البديلة.");
            throw new Error("تعذر تحويل ملف WebP إلى صورة. حاول باستخدام ملف آخر.");
        }
    }
}

export {
    webp2mp4,
    webp2png
};

/* 
البديل القديم باستخدام JSDOM (معلق للطوارئ)
import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import { JSDOM } from 'jsdom';

async function webp2mp4(source) {
    let form = new FormData()
    let isUrl = typeof source === 'string' && /https?:\/\//.test(source)
    const blob = !isUrl && new Blob([source.toArrayBuffer()])
    form.append('new-image-url', isUrl ? blob : '')
    form.append('new-image', isUrl ? '' : blob, 'image.webp')
    let res = await fetch('https://ezgif.com/webp-to-mp4', {
        method: 'POST',
        body: form
    })
    let html = await res.text()
    let { document } = new JSDOM(html).window
    let form2 = new FormData()
    let obj = {}
    for (let input of document.querySelectorAll('form input[name]')) {
        obj[input.name] = input.value
        form2.append(input.name, input.value)
    }
    let res2 = await fetch('https://ezgif.com/webp-to-mp4/' + obj.file, {
        method: 'POST',
        body: form2
    })
    let html2 = await res2.text()
    let { document: document2 } = new JSDOM(html2).window
    return new URL(document2.querySelector('div#output > p.outfile > video > source').src, res2.url).toString()
}

async function webp2png(source) {
    let form = new FormData()
    let isUrl = typeof source === 'string' && /https?:\/\//.test(source)
    const blob = !isUrl && new Blob([source.toArrayBuffer()])
    form.append('new-image-url', isUrl ? blob : '')
    form.append('new-image', isUrl ? '' : blob, 'image.webp')
    let res = await fetch('https://ezgif.com/webp-to-png', {
        method: 'POST',
        body: form
    })
    let html = await res.text()
    let { document } = new JSDOM(html).window
    let form2 = new FormData()
    let obj = {}
    for (let input of document.querySelectorAll('form input[name]')) {
        obj[input.name] = input.value
        form2.append(input.name, input.value)
    }
    let res2 = await fetch('https://ezgif.com/webp-to-png/' + obj.file, {
        method: 'POST',
        body: form2
    })
    let html2 = await res2.text()
    let { document: document2 } = new JSDOM(html2).window
    return new URL(document2.querySelector('div#output > p.outfile > img').src, res2.url).toString()
}
*/
