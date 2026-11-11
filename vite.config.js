import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Relative asset URLs so the build works under a GitHub Pages project subpath.
  base: './',
  plugins: [react(), tailwindcss()],
});
