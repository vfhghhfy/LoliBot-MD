import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

/**
 * رفع الملف إلى qu.ax
 * أنواع الملفات المدعومة:
 * - `image/jpeg` - صور JPEG
 * - `image/jpg` - صور JPG
 * - `image/png` - صور PNG
 * - `video/mp4` - فيديو MP4
 * - `video/webm` - فيديو WebM
 * - `audio/mpeg` - صوت MP3
 * - `audio/wav` - صوت WAV
 * @param {Buffer} buffer بيانات الملف
 * @return {Promise<string>} رابط الملف المرفوع
 */
export default async (buffer) => {
  const { ext, mime } = await fileTypeFromBuffer(buffer)
  const form = new FormData()
  const blob = new Blob([buffer], {type: mime})
  form.append('files[]', blob, 'tmp.' + ext)
  const res = await fetch('https://qu.ax/upload.php', { method: 'POST', body: form })
  const result = await res.json()
  if (result && result.success) {
    return result.files[0].url
  } else {
    throw new Error('فشل في رفع الملف إلى qu.ax')
  }
}

/**
 * رفع الملف إلى telegra.ph (بديل)
 * أنواع الملفات المدعومة:
 * - `image/jpeg`
 * - `image/jpg` 
 * - `image/png`
 * - `video/mp4`
 * - `video/webm`
 * - `audio/mpeg`
 * - `audio/wav`
 * @param {Buffer} buffer بيانات الملف
 * @return {Promise<string>} رابط الملف المرفوع
 */

/*export default async (buffer) => {
  const {ext, mime} = await fileTypeFromBuffer(buffer)
  const form = new FormData()
  const blob = new Blob([buffer.toArrayBuffer()], {type: mime})
  form.append('file', blob, 'tmp.' + ext)
  const res = await fetch('https://telegra.ph/upload', {
    method: 'POST',
    body: form,
  })
  const img = await res.json()
  if (img.error) throw img.error
  return 'https://telegra.ph' + img[0].src
}*/
