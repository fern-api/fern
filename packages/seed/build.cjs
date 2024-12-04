const packageJson = require("./package.json");
const tsup = require('tsup');

main();

async function main() {
    await tsup.build({
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