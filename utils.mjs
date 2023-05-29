// @ts-check
import * as fs from 'fs/promises'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

export const CACHE_DIR = process.env.HOME + '/.cache/licenseg'
const execAsync = promisify(exec)

/**
 * @param {string} f file path
 * @returns {Promise<boolean>}
 */
export async function exists(f) {
  try {
    await fs.access(f)
    return true
  } catch {
    return false
  }
}

export async function cacheLicenses() {
  if (await exists(CACHE_DIR)) {
    return
  }

  console.log('Caching licenses...')
  const gitUrl = 'git@github.com:github/choosealicense.com.git'

  await execAsync(`git clone --depth=1 ${gitUrl} ${CACHE_DIR}`)
  if (!exists(`${CACHE_DIR}/_licenses`)) {
    console.error('Error cloning choosealicense.com')
    process.exit(1)
  }

  const files = await fs.readdir(CACHE_DIR)
  for (const file of files) {
    if (file === '_licenses') continue
    if ((await fs.lstat(path.join(CACHE_DIR, file))).isDirectory()) {
      await execAsync(`rm -rf ${path.join(CACHE_DIR, file)}`)
      continue
    }
    fs.unlink(path.join(CACHE_DIR, file))
  }
  const licenseFiles = await fs.readdir(`${CACHE_DIR}/_licenses`)
  for (const file of licenseFiles) {
    const contents = await fs.readFile(`${CACHE_DIR}/_licenses/${file}`, 'utf8')
    const replaced = contents
      .split('---')
      .slice(-1)
      .join('')
      .replace(/\[year\]/g, '{{ year }}')
      .replace(/\[fullname\]/g, '{{ name }}')
      .trim()
    await fs.writeFile(`${CACHE_DIR}/_licenses/${file}`, replaced)
  }
  console.log('Done.')
}
