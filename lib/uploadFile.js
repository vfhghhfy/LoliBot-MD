import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

/**
 * رفع الملف المؤقت إلى file.io
 * `ينتهي بعد 1 يوم`
 * `الحد الأقصى لحجم الملف 100MB`
 */
const fileIO = async (buffer) => {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || {}
  const form = new FormData()
  const blob = new Blob([buffer], { type: mime })
  form.append('file', blob, 'tmp.' + ext)
  const res = await fetch('https://file.io/?expires=1d', {
    method: 'POST',
    body: form,
  })
  const json = await res.json()
  if (!json.success) throw json
  return json.link
}

/**
 * رفع الملف إلى storage.restfulapi.my.id
 */
const RESTfulAPI = async (inp) => {
  const form = new FormData()
  let buffers = inp
  if (!Array.isArray(inp)) buffers = [inp]
  const mime = (await fileTypeFromBuffer(buffers[0]))?.mime || 'application/octet-stream'
  for (const buffer of buffers) {
    const blob = new Blob([buffer], { type: mime })
    form.append('file', blob)
  }
  const res = await fetch('https://storage.restfulapi.my.id/upload', {
    method: 'POST',
    body: form,
  })
  let json = await res.text()
  try {
    json = JSON.parse(json)
    if (!Array.isArray(inp)) return json.files[0].url
    return json.files.map((res) => res.url)
  } catch (e) {
    throw json
  }
}

/**
 * الرفع إلى qu.ax
 */
const quax = async (buffer) => {
  const { ext, mime } = await fileTypeFromBuffer(buffer)
  const form = new FormData()
  const blob = new Blob([buffer], { type: mime })
  form.append('files[]', blob, 'file.' + ext)
  const res = await fetch('https://qu.ax/upload.php', {
    method: 'POST',
    body: form,
  })
  const json = await res.json()
  if (!json?.success) throw '❌ خطأ في الرفع إلى qu.ax'
  return json.files[0].url
}

/**
 * الرفع إلى catbox.moe كخيار احتياطي
 */
const catbox = async (buffer) => {
  const { ext } = await fileTypeFromBuffer(buffer) || {}
  const form = new FormData()
  const blob = new Blob([buffer])
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', blob, 'file.' + ext)
  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form,
  })
  const url = await res.text()
  if (!url.startsWith('https://')) throw new Error('❌ خطأ في الرفع إلى catbox')
  return url
}

/**
 * الرفع إلى uguu.se
 */
const uguu = async (buffer) => {
  const { ext } = await fileTypeFromBuffer(buffer) || {}
  const form = new FormData()
  form.append('file', new Blob([buffer]), 'file.' + ext)
  const res = await fetch('https://uguu.se/api.php?d=upload-tool', { method: 'POST', body: form })
  const url = await res.text()
  if (!url.startsWith('https://')) throw '❌ خطأ في الرفع إلى uguu'
  return url
}

/**
 * الرفع إلى filechan
 */
const filechan = async (buffer) => {
  const { ext } = await fileTypeFromBuffer(buffer) || {}
  const form = new FormData()
  form.append('file', new Blob([buffer]), 'file.' + ext)
  const res = await fetch('https://api.filechan.org/upload', { method: 'POST', body: form })
  const json = await res.json()
  if (!json?.success || !json?.files?.length) throw '❌ خطأ في الرفع إلى filechan'
  return json.files[0].url
}

/**
 * الرفع إلى pixeldrain
 */
const pixeldrain = async (buffer) => {
  const form = new FormData()
  form.append('file', new Blob([buffer]))
  const res = await fetch('https://pixeldrain.com/api/file', { method: 'POST', body: form })
  const json = await res.json()
  if (!json?.success || !json?.id) throw '❌ خطأ في الرفع إلى pixeldrain'
  return `https://pixeldrain.com/u/${json.id}`
}

/**
 * الرفع إلى gofile
 */
const gofile = async (buffer) => {
  const getServer = await fetch('https://api.gofile.io/getServer')
  const { data } = await getServer.json()
  const form = new FormData()
  form.append('file', new Blob([buffer]))
  const res = await fetch(`https://${data.server}.gofile.io/uploadFile`, { method: 'POST', body: form })
  const json = await res.json()
  if (!json?.status || json.status !== 'ok') throw '❌ خطأ في الرفع إلى Gofile'
  return json.data.downloadPage
}

/**
 * الرفع إلى krakenfiles
 */
const krakenfiles = async (buffer) => {
  const { ext } = await fileTypeFromBuffer(buffer) || {}
  const form = new FormData()
  form.append('file', new Blob([buffer]), 'file.' + ext)
  const res = await fetch('https://api.krakenfiles.com/v2/file/upload', { method: 'POST', body: form })
  const json = await res.json()
  if (!json?.success) throw '❌ خطأ في الرفع إلى KrakenFiles'
  return json.data.url
}

/**
 * الرفع إلى telegra.ph
 */
const telegraph = async (buffer) => {
  const { ext } = await fileTypeFromBuffer(buffer) || {}
  const form = new FormData()
  form.append('file', new Blob([buffer]), 'file.' + ext)
  const res = await fetch('https://telegra.ph/upload', { method: 'POST', body: form })
  const json = await res.json()
  if (!Array.isArray(json)) throw '❌ خطأ في الرفع إلى Telegraph'
  return 'https://telegra.ph' + json[0].src
}

// التصدير الفردي للخدمات
export { quax, RESTfulAPI, catbox, uguu, filechan, pixeldrain, gofile, krakenfiles, telegraph }

/**
 * الرفع التلقائي مع خيارات احتياطية
 */
export default async function (inp) {
  const servicios = [quax, RESTfulAPI, catbox, uguu, filechan, pixeldrain, gofile, krakenfiles, telegraph]
  let err = null
  for (const upload of servicios) {
    try {
      const result = await upload(inp)
      console.log(`[✅ تم الرفع بنجاح]`, result)
      return result
    } catch (e) {
      console.log(`[❌ فشل الرفع]`, e)
      err = e
    }
  }
  if (err) throw err
}
