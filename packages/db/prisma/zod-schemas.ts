import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Writes zod/index.ts to lib as base schema
 * @param zod
 * @returns
 */
async function processZodIndex(zodContent: string) {
  const processedLines: string[] = []
  let skipping = false
  for (const line of zodContent.split('\n')) {
    if (line.trim() === '// SELECT & INCLUDE') {
      break
    } else if (line.includes("import { z } from 'zod'")) {
      processedLines.push(line, '')
      skipping = true
    } else if (line.includes('JsonValueSchema')) {
      processedLines.push(line)
      skipping = false
    } else if (
      line.includes('JsonNullValueInputSchema') ||
      line.includes('JsonNullValueFilterSchema') ||
      line.includes('.transform((v) => transformJsonNull(v))')
    ) {
      // Skip these lines as they include Prisma.JsonNull imports
    } else if (line.includes('export type Session = z.infer<typeof SessionSchema>')) {
      processedLines.push(line.replace(/type Session/g, 'type SessionDB'))
    } else if (line.includes('instanceof(Buffer)')) {
      processedLines.push(line.replace(/z\.instanceof\(Buffer\)/g, 'z.any()'))
    } else if (!skipping) {
      processedLines.push(line)
    }
  }
  return processedLines
}

export async function main() {
  console.log('Updating lib prisma zod schemas...')
  // const __filename = fileURLToPath(import.meta.url)
  // const __dirname = path.dirname(__filename)

  const zodPath = path.join(__dirname, '../zod/index.ts')
  const prismaTypesPath = path.join(__dirname, './prisma-types.ts')
  const outputPath = path.join(__dirname, '../../lib/src/schemas/prisma.ts')

  const [zod, prismaTypes] = await Promise.all([
    fs.readFile(zodPath, 'utf-8'),
    fs.readFile(prismaTypesPath, 'utf-8')
  ])
  const lines = await processZodIndex(zod)
  await fs.writeFile(outputPath, lines.join('\n').concat('\n\n', prismaTypes), 'utf-8')
  console.log(`Wrote ${lines.length} lines`)
  console.log('Schemas updated successfully!')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
