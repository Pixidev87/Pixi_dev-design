import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      "@site-app": fileURLToPath(
        new URL(
          mode === "brochure" ? "./src/BrochureApp.jsx" : "./src/App.jsx",
          import.meta.url,
        ),
      ),
    },
  },
  build: { outDir: mode === "brochure" ? "dist-brochure" : "dist" },
  plugins: [react()],
  server: {
    proxy: { "/api": { target: "http://localhost:8082", changeOrigin: false } },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    restoreMocks: true,
  },
}));
