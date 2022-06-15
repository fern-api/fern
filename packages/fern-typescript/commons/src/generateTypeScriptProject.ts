import { Volume } from "memfs/lib/volume";
import path from "path";
import { Directory } from "ts-morph";
import { withProject } from "./codegen/file-system/withProject";
import { writeProject } from "./writeProject";

function getPathOnVolume(relativePath: string) {
    return path.join(path.sep, relativePath);
}

const COMPILED_TYPESCRIPT_OUT_DIR = "lib";

export async function generateTypeScriptProject({
    volume,
    packageName,
    packageVersion,
    packageDependencies,
    packageDevDependencies,
    generateSrc,
}: {
    volume: Volume;
    packageName: string;
    packageVersion: string;
    packageDependencies?: Record<string, string>;
    packageDevDependencies?: Record<string, string>;
    generateSrc: (directory: Directory) => void | Promise<void>;
}): Promise<void> {
    await writePackageJson({
        volume,
        packageName,
        packageVersion,
        packageDependencies,
        packageDevDependencies,
    });
    await writeTsConfigJson(volume);

    const project = await withProject(async (p) => {
        await generateSrc(p.createDirectory("src"));
    });

    await writeProject(project, volume);
}

async function writePackageJson({
    volume,
    packageName,
    packageVersion,
    packageDependencies = {},
    packageDevDependencies = {},
}: {
    volume: Volume;
    packageName: string;
    packageVersion: string;
    packageDependencies?: Record<string, string>;
    packageDevDependencies?: Record<string, string>;
}) {
    await volume.promises.writeFile(
        getPathOnVolume("package.json"),
        JSON.stringify(
            {
                name: packageName,
                version: packageVersion,
                files: [COMPILED_TYPESCRIPT_OUT_DIR],
                main: path.join(COMPILED_TYPESCRIPT_OUT_DIR, "index.js"),
                scripts: {
                    compile: "tsc",
                },
                dependencies: {
                    ...packageDependencies,
                },
                devDependencies: {
                    ...packageDevDependencies,
                    "@types/node": "^17.0.33",
                    typescript: "^4.6.4",
                },
            },
            undefined,
            4
        )
    );
}

async function writeTsConfigJson(volume: Volume) {
    await volume.promises.writeFile(
        getPathOnVolume("tsconfig.json"),
        JSON.stringify(
            {
                compilerOptions: {
                    module: "CommonJS",
                    target: "esnext",
                    outDir: COMPILED_TYPESCRIPT_OUT_DIR,
                    moduleResolution: "node",
                    esModuleInterop: true,
                    strict: true,
                    declaration: true,
                    noFallthroughCasesInSwitch: true,
                    forceConsistentCasingInFileNames: true,
                    noUncheckedIndexedAccess: true,
                    noUnusedLocals: true,
                    noUnusedParameters: true,
                },
                include: ["./src"],
            },
            undefined,
            4
        )
    );
}
