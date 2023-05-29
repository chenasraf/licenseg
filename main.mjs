// @ts-check
import { massarg } from 'massarg'
import { Scaffold } from 'simple-scaffold'

const CACHE_DIR = process.env.HOME + '/.cache/license-gen'

massarg()
  .main(async (args) => {
    await fillCache()
    await Scaffold({
      templates: [`${CACHE_DIR}/_licenses/${args.license}.txt`],
      output: '.',
      name: args.name,
      data: {
        year: new Date().getFullYear(),
      },
      quiet: true,
    })
    // rename output file
    const fs = await import('fs')
    if (fs.existsSync('LICENSE')) fs.unlinkSync('LICENSE')
    fs.renameSync(`${args.license}.txt`, 'LICENSE')
  })
  .option({
    name: 'name',
    aliases: ['n'],
  })
  .option({
    name: 'license',
    aliases: ['l'],
    isDefault: true,
    parse: (s) => s.toLowerCase(),
  })
  .parse()

async function fillCache() {
  // clone the repo to cache dir
  const gitUrl = 'git@github.com:github/choosealicense.com.git'

  const { exec } = await import('child_process')
  const { promisify } = await import('util')
  const execAsync = promisify(exec)

  const { stdout } = await execAsync(
    `rm -rf ${CACHE_DIR} && git clone --depth=1 ${gitUrl} ${CACHE_DIR}`,
  )
  console.log(stdout)

  // remove unused files
  const fs = await import('fs')
  const { join } = await import('path')
  const readdir = promisify(fs.readdir)
  const unlink = promisify(fs.unlink)
  const files = await readdir(CACHE_DIR)
  for (const file of files) {
    if (file === '_licenses') continue
    if ((await fs.promises.lstat(join(CACHE_DIR, file))).isDirectory()) {
      await execAsync(`rm -rf ${join(CACHE_DIR, file)}`)
      continue
    }
    unlink(join(CACHE_DIR, file))
  }
  const readFile = promisify(fs.readFile)
  const licenseFiles = await readdir(`${CACHE_DIR}/_licenses`)
  for (const file of licenseFiles) {
    const contents = await readFile(`${CACHE_DIR}/_licenses/${file}`, 'utf8')
    const replaced = contents
      .split('---')
      .slice(-1)
      .join('')
      .replace(/\[year\]/g, '{{ year }}')
      .replace(/\[fullname\]/g, '{{ name }}')
      .trim()
    fs.writeFileSync(`${CACHE_DIR}/_licenses/${file}`, replaced)
  }
}
