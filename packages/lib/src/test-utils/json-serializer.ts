import type { SnapshotSerializer } from 'vitest'

export default {
  serialize(val: any, config: any, indentation: string, depth: number, refs: any, printer: any) {
    return JSON.stringify(val, null, 2)
  },
  test(val) {
    return typeof val === 'object' && val !== null
  }
} satisfies SnapshotSerializer
