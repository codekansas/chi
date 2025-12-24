import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Allow overriding the base path (useful for GitHub Pages project sites).
  base: process.env.BASE_PATH ?? "/",
});
