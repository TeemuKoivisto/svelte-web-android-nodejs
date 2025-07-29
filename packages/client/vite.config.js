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
  server: {
    port: 5180,
    proxy: {
      '/api': {
        target: 'http://localhost:5181',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url)
          })
        }
      },
      '/oauth': 'http://localhost:5181'
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
