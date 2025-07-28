import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Writes zod/index.ts to lib as base schema
 * @param inputPath
 * @returns
 */
async function processZodIndex(inputPath: string) {
  const content = await fs.readFile(inputPath, 'utf-8')
  const processedLines: string[] = []
  for (const line of content.split('\n')) {
    if (line.trim() === '// SELECT & INCLUDE') {
      break
    } else if (line.includes("import { Prisma } from '../generated'")) {
      processedLines.push("import { Prisma } from '@/db'")
    } else if (line.includes('export type Session = z.infer<typeof SessionSchema>')) {
      processedLines.push(line.replace(/type Session/g, 'type SessionDB'))
    } else if (line.includes('instanceof(Buffer)')) {
      processedLines.push(line.replace(/z\.instanceof\(Buffer\)/g, 'z.any()'))
    } else {
      processedLines.push(line)
    }
  }
  return processedLines
}

export async function main() {
  console.log('Updating lib prisma zod schemas...')
  // const __filename = fileURLToPath(import.meta.url)
  // const __dirname = path.dirname(__filename)

  const inputPath = path.join(__dirname, '../zod/index.ts')
  const outputPath = path.join(__dirname, '../../lib/src/schemas/prisma.ts')

  const lines = await processZodIndex(inputPath)
  await fs.writeFile(outputPath, lines.join('\n'), 'utf-8')
  console.log(`Wrote ${lines.length} lines`)
  console.log('Schemas updated successfully!')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
