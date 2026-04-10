import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://backend:80",
        changeOrigin: true,
      },
    },
  },
  build: {
    // Outputs directly into the Apache document root so PHP and
    // frontend assets are co-located and served by mod_rewrite rules.
    outDir: "../backend",
    emptyOutDir: false, // don't wipe PHP files
  },
});
