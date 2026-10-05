import { copyFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base keeps JS/CSS paths intact on GitHub Pages project sites
// (https://user.github.io/repo/) without hard-coding the repository name.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'github-pages-spa',
      apply: 'build',
      closeBundle() {
        copyFileSync('dist/index.html', 'dist/404.html')
      },
    },
  ],
  base: './',
})
