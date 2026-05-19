import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: 'https://cdn.jsdelivr.net/gh/abcxyzeric/HypnosisAPP5-viet-hoa@68c705cdaf6976a7e08adc189a413359de48d8cd/dist/',
  plugins: [react()],
  build: {
    sourcemap: false,
  },
});
