import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import path from 'path'

import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: path.resolve('src/index.ts'),
      fileName: '[name]',
      formats: ['es']
    },
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: {
        index: path.resolve(`./src/index.ts`),
        schemas: path.resolve(`./src/schemas/index.ts`)
      },
      external: [
        ...Object.keys(pkg.devDependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
      ]
    }
  },
  plugins: [dts()]
})
