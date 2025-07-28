/// <reference types="vitest" />

import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

import { resolve } from 'path'

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $config: resolve('./src/config'),
      $lib: resolve('./src/lib'),
      $utils: resolve('./src/utils')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    // snapshotSerializers: ['src/lib/tests/json-serializer.ts'],
    cache: false
  }
})
