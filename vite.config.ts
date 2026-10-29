import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // lets `vite preview` answer on temporary Cloudflare tunnel links
  preview: { allowedHosts: ['.trycloudflare.com'] },
})
