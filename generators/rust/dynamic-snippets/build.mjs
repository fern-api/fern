import { fileURLToPath } from "url";
import tsup from "tsdown";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


main();

async function main() {
    await build({
        entryPoints: ["./src/**/*.ts"],
        platform: "node",
        target: "node18",
        outdir: "./lib",
        bundle: false,
        plugins: [pnpPlugin()],
        logLevel: "info",
        tsconfig: "./build.tsconfig.json"
    });
}