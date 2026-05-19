import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: 'https://cdn.jsdelivr.net/gh/abcxyzeric/HypnosisAPP5-viet-hoa@8297adb4a1f156a2102fee048f23346342186c87/dist/',
  plugins: [react()],
  build: {
    sourcemap: false,
  },
});
