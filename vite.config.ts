import path from "path"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import { compression } from 'vite-plugin-compression2'


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