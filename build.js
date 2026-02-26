// Simple esbuild bundler for the Boss Mode overlay React UI.
// Outputs a single IIFE script at boss-mode/overlay.js that exposes
// window.BossModeOverlay with the same init API used by the mod.

const path = require("path");
const esbuild = require("esbuild");

const clippySoundsStub = path.join(__dirname, "src", "clippy-sounds-stub.js");

/** Redirect clippyjs sound modules to a no-op stub so no MP3/OGG data is bundled. */
const clippyNoSoundsPlugin = {
  name: "clippy-no-sounds",
  setup(build) {
    build.onResolve({ filter: /sounds-mp3\.mjs$/ }, (args) => {
      if (args.importer && args.importer.includes("clippyjs")) {
        return { path: clippySoundsStub };
      }
      return null;
    });
  },
};

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
    plugins: [clippyNoSoundsPlugin],
  })
  .then(() => {
    console.log("Boss Mode overlay bundle built to boss-mode/overlay.js");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
