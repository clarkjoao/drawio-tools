import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isPlugin = mode === "plugin";

  return {
    plugins: [react(), tailwindcss()],
    define: {
      "import.meta.env.AS_PLUGIN": JSON.stringify(isPlugin),
      "process.env.NODE_ENV": JSON.stringify("production")
    },
    build: isPlugin
      ? {
          lib: {
            entry: path.resolve(__dirname, "src/plugin.tsx"),
            formats: ["iife"],
            name: "ReactDrawioPlugin",
            fileName: () => "replay.js"
          },
          rollupOptions: {
            output: {
              globals: {}
            }
          },
          outDir: "dist/plugin",
          emptyOutDir: true,
          minify: true
        }
      : {
          outDir: "dist/app",
          emptyOutDir: false
        },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    }
  };
});
