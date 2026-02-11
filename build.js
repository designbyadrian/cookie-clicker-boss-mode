// Simple esbuild bundler for the Boss Mode overlay React UI.
// Outputs a single IIFE script at boss-mode/overlay.js that exposes
// window.BossModeOverlay with the same init API used by the mod.

const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/index.js"],
    bundle: true,
    outfile: "boss-mode/overlay.js",
    format: "iife",
    globalName: "BossModeOverlayBundle",
    jsx: "automatic",
    sourcemap: false,
    minify: true,
    target: ["chrome80"],
    loader: {
      ".js": "jsx",
      ".jsx": "jsx",
    },
  })
  .then(() => {
    console.log("Boss Mode overlay bundle built to boss-mode/overlay.js");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
