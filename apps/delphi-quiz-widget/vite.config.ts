import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  build: {
    lib: {
      entry: "src/embed.tsx",
      name: "DelphiQuizWidget",
      formats: ["iife", "es"],
      fileName: (format) => `delphi-quiz-widget.${format}.js`
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        banner:
          "var process=globalThis.process||{env:{NODE_ENV:'production'},emit:function(){}};"
      }
    }
  }
});
