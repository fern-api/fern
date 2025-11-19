const {
  NodeModulesPolyfillPlugin,
} = require("@esbuild-plugins/node-modules-polyfill");
const {
  NodeGlobalsPolyfillPlugin,
} = require("@esbuild-plugins/node-globals-polyfill");
const packageJson = require("./package.json");
const tsup = require('tsdown');
const { writeFile, mkdir } = require("fs/promises");
const path = require("path");

main();

async function main() {
  const config = {
    entry: ["src/**/*.ts", "!src/__test__"],
    target: "es2017",
    minify: true,
    dts: true,
    sourcemap: true,
    esbuildPlugins: [
      NodeModulesPolyfillPlugin(),
      NodeGlobalsPolyfillPlugin({
        process: true,
        buffer: true,
        util: true,
      }),
    ],
    tsconfig: "./build.tsconfig.json",
  };

  await tsup.build({
    ...config,
    format: ["cjs"],
    outDir: "dist/cjs",
    clean: true,
  });

  await tsup.build({
    ...config,
    format: ["esm"],
    outDir: "dist/esm",
    clean: false,
  });

  await mkdir(path.join(__dirname, "dist"), { recursive: true });
  process.chdir(path.join(__dirname, "dist"));

  await writeFile(
    "package.json",
    JSON.stringify(
      {
        name: packageJson.name,
        version: process.argv[2] || packageJson.version,
        repository: packageJson.repository,
        type: "module",
        exports: {
          // Conditional exports for ESM and CJS.
          import: {
            types: "./esm/index.d.ts",
            default: "./esm/index.js",
          },
          require: {
            types: "./cjs/index.d.cts",
            default: "./cjs/index.cjs",
          },
        },
        // Fallback for older tooling or direct imports.
        main: "./cjs/index.cjs",
        module: "./esm/index.js",
        types: "./cjs/index.d.cts",
        files: ["cjs", "esm"],
      },
      undefined,
      2,
    ),
  );
}
