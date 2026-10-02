import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon.svg'],
      manifest: {
        name: 'מאיפה באנו?',
        short_name: 'מאיפה באנו?',
        description: 'משחק שיחה על מוצאי יהודים ושמות משפחה',
        lang: 'he',
        dir: 'rtl',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        background_color: '#FFFFFF',
        theme_color: '#A3243B',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        // Take over right away (also from older installs); the page itself reloads only on the home screen.
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
})
