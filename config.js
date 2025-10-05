import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'

//owner
global.owner = [
['967778668253'],
['967778668253'],
['967778668253'],
['967778668253'],
['967778668253'],
['967778668253'],
['967778668253']
]

//Información 
globalThis.info = {
wm: "𝙇𝙤𝙡𝙞𝘽𝙤𝙩",
vs: "2.0.0 (beta)",
packname: "𝕃𝕆𝕃𝕀𝔹𝕆𝕋",
author: "Owner: @elrebelde21\n• Dueña: @itschinita_official",
apis: "https://api.delirius.store",
apikey: "GataDios",
fgmods: { url: 'https://api.fgmods.xyz/api', key: 'elrebelde21' },
neoxr: { url: 'https://api.neoxr.eu/api', key: 'GataDios' },
img2: "https://files.catbox.moe/nz2421.jpg",
img4: fs.readFileSync('./media/Menu2.jpg'),
yt: "https://www.youtube.com/@elrebe",
tiktok: "https://www.tiktok.com/@elrebe",
md: "https://github.com/elrebelde21/LoliBot-MD",
fb: "https://www.facebook.com/elreb",
ig: "https://www.instagram.com/j_5f4?igsh=bXp6dXdiOWNkY2w0",
nn: "https://whatsapp.com/channel/0029VapxAcz4SpkEe0XN6X3V", //Grupo ofc1
nn2: "https://whatsapp.com/channel/0029VapxAcz4SpkEe0XN6X3V", //Grupo ofc2
nn3: "https://whatsapp.com/channel/0029VapxAcz4SpkEe0XN6X3V", //Colab Loli & Gata
nn4: "https://whatsapp.com/channel/0029VapxAcz4SpkEe0XN6X3V", //Enlace LoliBot
nn5: "https://whatsapp.com/channel/0029VapxAcz4SpkEe0XN6X3V", //A.T.M.M
nn6: "https://whatsapp.com/channel/0029VapxAcz4SpkEe0XN6X3V", //Dev support 
nna: "https://whatsapp.com/channel/0029VapxAcz4SpkEe0XN6X3V",
nna2: "https://whatsapp.com/channel/0029VapxAcz4SpkEe0XN6X3V"
}

//----------------------------------------------------

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
