import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  const basePath =
    command === "serve"
      ? "/"
      : process.env.BASE_PATH ?? `/${process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "chi"}/`;

  return {
    plugins: [react()],
    // Use root base for dev server; during builds default to repo-relative base for GitHub Pages.
    base: basePath,
  };
});
