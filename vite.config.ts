import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      define: {
        // loadEnv reads .env files (local dev); process.env.ANTHROPIC_API_KEY is set
        // by Vercel (and other CI/CD) during the build process. Cover both cases.
        'process.env.ANTHROPIC_API_KEY': JSON.stringify(
          env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || ''
        )
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimizeDeps: {
        exclude: ['@anthropic-ai/sdk'],
        include: ['standardwebhooks'],
      },
      build: {
        rollupOptions: {
          external: [/^node:/],
        },
      },
    };
});
