import path from "path"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import { compression } from 'vite-plugin-compression2'
import { VitePWA } from 'vite-plugin-pwa'


export default defineConfig({
  plugins: [
    react(
      {
        tsDecorators: true,
      }
    ),
    compression(
      {
        algorithm: "brotliCompress",
        include: [".js", ".json", ".css", ".html", ".jsx", ".tsx", ".svg"]
      }
    ),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.ico'],
      manifest: {
        name: '9Notes - Offline-First Notes',
        short_name: '9Notes',
        description: 'Advanced offline-first note-taking app with rich text editor, search, and themes',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      }
    }),
  ],
  server: {
    port: 4000,
  },
  base: process.env.NODE_ENV === 'production' ? '/notes/' : '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'redux', 'react-redux'],
          tiptap: ['@tiptap/core', '@tiptap/react', '@tiptap/starter-kit'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-tooltip', 'lucide-react']
        }
      }
    }
  }
})