/* eslint-env node */
// import { build } from "esbuild";
import pkg from "esbuild";
import babel from "esbuild-plugin-babel";
import process from "process";

const { build } = pkg;

const args = process.argv.slice(2);

const watch = args.some((a) => a === "--watch" || a === "-w");

build({
  entryPoints: { loopu: "src/main.ts" },
  bundle: true,
  minifySyntax: true,
  platform: "node",
  target: "rhino1.7.14",
  external: ["kolmafia"],
  plugins: [babel()],
  outdir: "dist/scripts/loopu",
  watch,
  loader: { ".json": "text" },
  inject: ["./kolmafia-polyfill.js"],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
