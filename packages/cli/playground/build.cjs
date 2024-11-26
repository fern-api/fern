const packageJson = require("./package.json");
const tsup = require('tsup');
const { writeFile, rename } = require("fs/promises");
const path = require("path");

main();

async function main() {
    await tsup.build({
        entry: [
            'src/**/*.ts',
            'src/config/go/config.json',
            'src/config/ir/ir.json'
        ],
        format: ['cjs'],
        target: 'esnext',
        outDir: 'dist',
        minify: true,
        dts: true,
        tsconfig: "./tsconfig.json"
    });
}