import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import path from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: path.resolve('src/index.ts'),
      fileName: 'index',
      formats: ['es']
    },
    minify: false,
    sourcemap: true
  },
  plugins: [dts()]
})
