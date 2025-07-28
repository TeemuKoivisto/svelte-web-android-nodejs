/// <reference types="vitest" />

import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

import { resolve } from 'path'

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  resolve: {
    alias: {
      $api: resolve('./src/api'),
      $components: resolve('./src/components'),
      $config: resolve('./src/config'),
      $elements: resolve('./src/elements'),
      $hooks: resolve('./src/hooks'),
      $lib: resolve('./src/lib'),
      $modals: resolve('./src/modals'),
      $shadcn: resolve('./src/shadcn'),
      $stores: resolve('./src/stores'),
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
