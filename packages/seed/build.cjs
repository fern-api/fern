const packageJson = require("./package.json");
const tsdown = require('tsdown');

main();

async function main() {
    await tsdown.build({
        entry: ['src/cli.ts'],
        format: ['cjs'],
        minify: false,
        outDir: 'dist',
        env: {
            CLI_NAME: "seed",
            CLI_PACKAGE_NAME: "seed-cli",
            CLI_VERSION: process.argv[2] || packageJson.version,
        },
        external: [
            '@fern-api/go-formatter',
          ],
    });     
}