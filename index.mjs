// @ts-check
import { massarg } from 'massarg'
import { Scaffold } from 'simple-scaffold'
import * as fs from 'fs/promises'
import { CACHE_DIR, exists, cacheLicenses } from './utils.mjs'

/**
 * @param {string[]} args
 */
export default function licenseg(args) {
  massarg()
    .main(async (args) => {
      await cacheLicenses()
      if (!args.name) {
        console.log('You must supply a name with the --name flag.')
        return
      }
      if (!args.overwrite && (await exists('LICENSE'))) {
        // get user input from stdin
        const input = await new Promise((resolve) => {
          console.log('LICENSE file already exists. Overwrite? [Y/n]')
          process.stdin.once('data', (data) => resolve(data.toString().trim()))
        })
        process.stdin.unref()
        if (input && input.toLowerCase() !== 'y') {
          console.log('License not generated.')
          return
        }
      }
      await Scaffold({
        templates: [`${CACHE_DIR}/_licenses/${args.license}.txt`],
        output: '.',
        name: args.name,
        data: {
          year: args.year ?? new Date().getFullYear(),
        },
        beforeWrite: (content) => {
          if (args.replaceCopyrightSymbol) return content.toString().replace(/\(c\)/gi, '©')
          return content
        },
        quiet: true,
      })
      if (await exists('LICENSE')) await fs.unlink('LICENSE')
      await fs.rename(`${args.license}.txt`, 'LICENSE')
      console.log(`File ${process.cwd()}/LICENSE created.`)
      return
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

        let replaced = contents
          .split('---')
          .slice(-1)
          .join('')
          .trim()
          .replace(/\{\{ year \}\}/gi, args.year ?? new Date().getFullYear())
          .replace(/\{\{ name \}\}/gi, args.name ?? 'Your Name')
        if (args.replaceCopyrightSymbol) {
          replaced = replaced.replace(/\(c\)/gi, '©')
        }
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
      description:
        'License to generate (the flag is optional, you can just supply the license name)',
      parse: (s) => s.toLowerCase(),
      // commands: ['main'],
    })
    .option({
      name: 'replace-copyright-symbol',
      aliases: ['rcs', 'C'],
      boolean: true,
      defaultValue: true,
      description: 'Replace the (c) symbol with the symbol ©.',
    })
    .option({
      name: 'overwrite',
      aliases: ['w'],
      boolean: true,
      description: 'Overwrite existing LICENSE file.',
    })
    .help({
      binName: 'licenseg',
      header: 'Generate a license file for your project',
      usageExample: [
        '[options] [command]',
        'licenseg --name "John Doe" mit   # generate MIT license',
        'licenseg ls                      # list all licenses',
      ].join('\n'),
    })
    .example({
      description: 'Generate MIT license',
      input: 'licenseg --name "John Doe" mit',
    })
    .example({
      description: 'List all licenses',
      input: 'licenseg ls',
    })
    .example({
      description: 'Preview a license',
      input: 'licenseg p mit',
    })
    .parse(args)
}

export { licenseg }
