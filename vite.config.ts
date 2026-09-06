import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  // Rutas relativas: permite publicar en subcarpetas (GitHub Pages:
  // https://usuario.github.io/nombre-del-repo/) y en Cloudflare Pages.
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})