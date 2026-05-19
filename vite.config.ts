import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: 'https://cdn.jsdelivr.net/gh/abcxyzeric/HypnosisAPP5-viet-hoa@card31-viet-hoa-v1/dist/',
  plugins: [react()],
  build: {
    sourcemap: false,
  },
});
