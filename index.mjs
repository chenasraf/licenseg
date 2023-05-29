// @ts-check
import { massarg } from 'massarg'
import { Scaffold } from 'simple-scaffold'
import * as fs from 'fs/promises'
import { CACHE_DIR, exists, cacheLicenses } from './utils.mjs'

massarg()
  .main(async (args) => {
    await cacheLicenses()
    await Scaffold({
      templates: [`${CACHE_DIR}/_licenses/${args.license}.txt`],
      output: '.',
      name: args.name,
      data: {
        year: new Date().getFullYear(),
      },
      quiet: true,
    })
    if (await exists('LICENSE')) await fs.unlink('LICENSE')
    await fs.rename(`${args.license}.txt`, 'LICENSE')
    console.log(`File ${process.cwd()}/LICENSE created.`)
  })
  .command({
    name: 'list',
    aliases: ['ls'],
    description: 'Lists available licenses',
    run: async () => {
      await cacheLicenses()
      const files = await fs.readdir(`${CACHE_DIR}/_licenses`)
      console.log(`Available licenses:\n${files.map((f) => f.replace('.txt', '')).join('\n')}`)
    },
  })
  .command({
    name: 'clear-cache',
    aliases: ['cc'],
    description: 'Clears the cache directory',
    run: async () => {
      if (await exists(CACHE_DIR)) {
        await fs.rm(CACHE_DIR, { recursive: true })
        console.log(`Cache directory ${CACHE_DIR} cleared.`)
      }
    },
  })
  .command({
    name: 'preview',
    aliases: ['p'],
    description: 'Preview a license',
    run: async (args) => {
      await cacheLicenses()
      const files = await fs.readdir(`${CACHE_DIR}/_licenses`)
      const license = files.find((f) => f.replace('.txt', '') === args.license)
      if (!license) {
        console.log(`License ${args.license} not found.`)
        return
      }
      const contents = await fs.readFile(`${CACHE_DIR}/_licenses/${license}`, 'utf8')
      const replaced = contents.split('---').slice(-1).join('').trim()
      console.log(replaced)
    },
  })
  .option({
    name: 'name',
    aliases: ['n'],
    description: 'Your name',
    // commands: ['main'],
  })
  .option({
    name: 'license',
    aliases: ['l'],
    isDefault: true,
    description: 'License to generate',
    parse: (s) => s.toLowerCase(),
    // commands: ['main'],
  })
  .parse()
