import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";
import tailwind from "@astrojs/tailwind";

// import partytown from "@astrojs/partytown";

// https://astro.build/config

// partytown({
//   config: {
//     forward: ["dataLayer.push"],
//   },
// }),

export default defineConfig({
  integrations: [react(), tailwind()],
  output: "server",
  adapter: vercel({
    nodejs: {
      version: 18
    }
  }),
  server: {
    proxy: {
      '/api/stability': {
        target: 'https://api.stability.farm',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stability/, '')
      },
      '/api/stabilitydao': {
        target: 'https://api.stabilitydao.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stabilitydao/, '')
      }
    }
  },
  vite: {
    build: {
      rollupOptions: {
        external: ["sharp"],
      },
    },
  },
});
