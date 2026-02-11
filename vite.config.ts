import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        '/api/perplexity': {
          target: 'https://api.perplexity.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/perplexity/, ''),
          headers: {
            'Origin': 'https://api.perplexity.ai'
          }
        },
        '/api/naver-finance': {
          target: 'https://finance.naver.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/naver-finance/, ''),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        },
        '/api/naver-mobile': {
          target: 'https://m.stock.naver.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/naver-mobile/, ''),
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
          }
        }
      }
    },
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
