import { build, BuildOptions } from "esbuild";

const options: BuildOptions = {
    platform: "node",
    entryPoints: ["./src/cli.ts"],
    outfile: "./dist/bundle.cjs",
    bundle: true,
};

build(options).catch(() => process.exit(1));
