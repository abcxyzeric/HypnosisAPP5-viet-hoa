import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: 'https://cdn.jsdelivr.net/gh/abcxyzeric/HypnosisAPP5-viet-hoa@e09f215a97b7189024ca1993e0c927f9ffd848e0/dist/',
  plugins: [react()],
  build: {
    sourcemap: false,
  },
});
