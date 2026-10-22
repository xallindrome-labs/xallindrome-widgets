import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "XallindromeWidgets",
      formats: ["iife", "es"],
      fileName: (format) => `xallindrome-widgets-sdk.${format}.js`,
    },
    sourcemap: true,
  },
});
