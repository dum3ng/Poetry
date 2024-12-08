/**
 * generate all authors from data files
 */
import fsp from 'node:fs/promises'
import fs from 'node:fs'
import path from 'node:path'
import { parse, stringify } from 'csv/sync'

const dir = path.resolve(__dirname, '..')
const authors = new Map<string, [string, string]>()

async function processFile(f: string) {
  const file = path.resolve(dir, f)
  const s = await fsp.readFile(file, 'utf8')
  const records = parse(s, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    quote: '"',
    trim: true,
    bom: true,
  })
  records.forEach((r: any) => {
    const k = `${r['作者']}-${r['朝代']}`
    if (!authors.has(k)) {
      authors.set(k, [r['作者'], r['朝代']])
    }
  })
}
async function main() {
   if(!fs.existsSync('authors'))await fsp.mkdir('authors' )
  const files = await fsp.readdir(dir)
  for (const key of files) {
    if (key.endsWith('.csv')) await processFile(key)
  }
  console.log(authors.size)
  const data = [['name', 'dyn']]
  authors.forEach((a) => data.push(a))
  await fsp.writeFile(
    path.resolve(dir, 'authors/authors.csv'),
    stringify(data),
    {encoding: 'utf8', flag: 'w'},
  )
}

main()
