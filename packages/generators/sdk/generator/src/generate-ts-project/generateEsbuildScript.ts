import { Volume } from "memfs/lib/volume";
import {
    API_BUNDLE_FILENAME,
    BROWSER_CJS_DIST_DIRECTORY,
    BROWSER_ESM_DIST_DIRECTORY,
    BUILD_SCRIPT_NAME,
    CORE_BUNDLE_FILENAME,
    DIST_DIRECTORY,
    NODE_DIST_DIRECTORY,
    SERIALIZATION_BUNDLE_FILENAME,
    SRC_DIRECTORY,
} from "./constants";
import { getPathToProjectFile } from "./utils";

export async function generateEsbuildScript({
    volume,
    packageName,
}: {
    volume: Volume;
    packageName: string;
}): Promise<void> {
    await volume.promises.writeFile(getPathToProjectFile(BUILD_SCRIPT_NAME), getBuildScriptContents({ packageName }));
}

function getBuildScriptContents({ packageName }: { packageName: string }): string {
    return `const { build } = require("esbuild");

void main();

async function main() {
    await bundle({
        platform: "node",
        target: "node14",
        format: "cjs",
        outdir: "${NODE_DIST_DIRECTORY}",
    });
    await bundle({
        platform: "browser",
        format: "esm",
        outdir: "${BROWSER_ESM_DIST_DIRECTORY}",
    });
    await bundle({
        platform: "browser",
        format: "cjs",
        outdir: "${BROWSER_CJS_DIST_DIRECTORY}",
    });
}

async function bundle({ platform, target, format, outdir }) {
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./${SRC_DIRECTORY}/index.ts",
        outfile: \`./${DIST_DIRECTORY}/\${outdir}/${API_BUNDLE_FILENAME}\`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./${SRC_DIRECTORY}/core/index.ts",
        outfile: \`./${DIST_DIRECTORY}/\${outdir}/${CORE_BUNDLE_FILENAME}\`,
    });
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./${SRC_DIRECTORY}/serialization/index.ts",
        outfile: \`./${DIST_DIRECTORY}/\${outdir}/${SERIALIZATION_BUNDLE_FILENAME}\`,
    });
}

async function runEsbuild({ platform, target, format, entryPoint, outfile }) {
    await build({
        platform,
        target,
        format,
        entryPoints: [entryPoint],
        outfile,
        bundle: true,
        alias: {
            // matches up with tsconfig paths
            "${packageName}": "./${SRC_DIRECTORY}",
        }
    }).catch(() => process.exit(1));
}
`;
}
