import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: process.env.VITE_ASSET_BASE ?? "/",
  plugins: [react(), tailwindcss()],
  build: {
    target: "esnext",
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("index.html", import.meta.url)),
      },
      output: {
        entryFileNames: "portal.js",
        assetFileNames: (asset) =>
          asset.names?.some((n) => n.endsWith(".css"))
            ? "portal.[ext]"
            : "assets/[name].[ext]",
        chunkFileNames: (chunk) =>
          `${chunk.name.replace(/-[A-Za-z0-9_-]{8}$/, "")}.js`,
        manualChunks(id) {
          if (
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react/") ||
            id.includes("node_modules/scheduler")
          ) {
            return "vendor";
          }
          if (id.includes("node_modules/@tanstack/react-query")) {
            return "query";
          }
        },
      },
    },
  },
});
