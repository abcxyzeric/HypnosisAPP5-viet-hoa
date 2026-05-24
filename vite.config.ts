import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: 'https://cdn.jsdelivr.net/gh/abcxyzeric/HypnosisAPP5-viet-hoa@d79bd76b9aa33eec78886410afaf6316b1f61e9d/dist/',
  plugins: [react()],
  build: {
    sourcemap: false,
  },
});
