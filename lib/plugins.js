import { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { readdirSync, readFileSync, existsSync, watch } from 'fs'
import chalk from "chalk"
import syntaxerror from 'syntax-error'
import { format } from 'util'

const __dirname = path => fileURLToPath(new URL(path, import.meta.url))
const pluginFolder = join(process.cwd(), './plugins')
const pluginFilter = filename => /\.js$/.test(filename)
globalThis.plugins = {}

export async function loadPlugins() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const pathFile = pathToFileURL(join(pluginFolder, filename)).href
      const module = await import(`${pathFile}?update=${Date.now()}`)
      let plugin = module.default || module
      if (typeof module.before === 'function') {
        plugin = { ...plugin, before: module.before }
      }

      globalThis.plugins[filename] = plugin

      if (typeof plugin.before === 'function') {
        globalThis.plugins[filename].__hasBefore = true
      }

      console.log(chalk.green(`✅ تم تحميل الإضافة: ${filename}`))
    } catch (e) {
      console.error(chalk.red(`❌ خطأ في تحميل ${filename}:\n${format(e)}`))
      delete globalThis.plugins[filename]
    }
  }
}

const reload = async (_, filename) => {
  if (!pluginFilter(filename)) return

  const fullPath = join(pluginFolder, filename)
  if (existsSync(fullPath)) {
    const err = syntaxerror(readFileSync(fullPath), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true
    })

    if (err) {
      console.error(chalk.red(`❌ خطأ في بناء الجملة في ${filename}:\n${format(err)}`))
      return
    }

    try {
      const pathFile = pathToFileURL(fullPath).href
      const module = await import(`${pathFile}?update=${Date.now()}`)
      let plugin = module.default || module
      if (typeof module.before === 'function') {
        plugin = { ...plugin, before: module.before }
      }

      globalThis.plugins[filename] = plugin
      console.log(chalk.green(`🔄 تم تحديث الإضافة: ${filename}`))
    } catch (e) {
      console.error(chalk.red(`❌ خطأ في إعادة تحميل ${filename}:\n${format(e)}`))
    }
  } else {
    console.log(chalk.yellow(`🗑️ تم حذف الإضافة: ${filename}`))
    delete globalThis.plugins[filename]
  }
}

watch(pluginFolder, reload)
await loadPlugins()
