import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icones/**/*.png', 'favicon.ico'],
      manifest: {
        name: 'Board Doctor',
        short_name: 'BoardDoc',
        description: 'Diagnostic de cartes électroniques par IA',
        theme_color: '#2563eb',
        background_color: '#1a202c',
        display: 'standalone',
        icons: [
          {
            src: '/icones/android/android-launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icones/android/android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icones/ios/192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose:'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ]
})
