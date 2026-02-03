import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync, readdirSync, existsSync, mkdirSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5556,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "copy-plan-json-files",
      closeBundle() {
        const srcPlansDir = path.resolve(__dirname, "src/data/plans");
        const distPlansDir = path.resolve(__dirname, "dist/plans");
        
        // Ensure dist/plans directory exists
        if (!existsSync(distPlansDir)) {
          mkdirSync(distPlansDir, { recursive: true });
        }
        
        // Copy all JSON files from src/data/plans to dist/plans
        if (existsSync(srcPlansDir)) {
          const files = readdirSync(srcPlansDir);
          
          files.forEach((file) => {
            if (file.endsWith(".json")) {
              const srcPath = path.join(srcPlansDir, file);
              const destPath = path.join(distPlansDir, file);
              try {
                copyFileSync(srcPath, destPath);
                console.log(`Copied ${file} to dist/plans folder`);
              } catch (err) {
                console.error(`Failed to copy ${file}:`, err);
              }
            }
          });
        }
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
