import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        importScripts: ['push-sw.js'],
        // Take control immediately and remove stale precaches on every update.
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        // Always fetch the page fresh from the network (fall back to cache only
        // when offline) so a broken/blank cached shell can never strand users.
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-pages',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 12 },
            },
          },
        ],
      },
      manifest: {
        name: 'Zero Contract',
        short_name: 'ZeroContract',
        description: 'Track your shift earnings and paydays',
        theme_color: '#0B3D2E',
        background_color: '#F4F6F3',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
