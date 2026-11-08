import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa' // 🚀 Naya Import

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({ // 🚀 PWA Plugin
      registerType: 'autoUpdate',
      includeAssets: ['card.png'], // Aapka logo
      manifest: {
        name: 'The Pacific Cambridge Admin',
        short_name: 'PCS Admin',
        description: 'Admin Panel for The Pacific Cambridge School',
        theme_color: '#3b82f6', // Blue color (aapke theme ke mutabiq)
        background_color: '#ffffff',
        display: 'standalone', // App ki tarah full screen (bina browser bar ke)
        start_url: '/',
        icons: [
          {
            src: '/card.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/card.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})