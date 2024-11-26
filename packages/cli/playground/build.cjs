const packageJson = require("./package.json");
const tsup = require('tsup');
const { writeFile, rename } = require("fs/promises");
const path = require("path");

main();

async function main() {
    await tsup.build({
        entry: ['src/**/*.ts'],
        format: ['esm', 'cjs', 'iife'],
        target: 'esnext',
        outDir: 'dist',
        sourcemap: true,
        splitting: false,
        minify: true,
        dts: true,
        external: ['fs', 'path', 'os'],
        platform: 'browser',
        tsconfig: "./tsconfig.json"
    });
}