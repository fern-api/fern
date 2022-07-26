const { pnpPlugin } = require("@yarnpkg/esbuild-plugin-pnp");
const { build } = require("esbuild");

const options = {
    platform: "node",
    entryPoints: ["./src/cli.ts"],
    outfile: "./dist/bundle.cjs",
    bundle: true,
    external: ["cpu-features"],
    plugins: [pnpPlugin()],
};

build(options).catch(() => process.exit(1));
