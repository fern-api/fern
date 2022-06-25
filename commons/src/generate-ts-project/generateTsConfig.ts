import { Volume } from "memfs/lib/volume";
import { getPathToProjectFile, RELATIVE_CJS_OUT_DIR_PATH, RELATIVE_ESM_OUT_DIR_PATH } from "./utils";

export type ModuleType = "commonjs" | "esm";

export const CJS_TSCONFIG_PATH = "tsconfig.json";
export const ESM_TSCONFIG_PATH = "tsconfig.esm.json";

const SRC_DIRECTORY = "src";

export async function generateTsConfig(volume: Volume, moduleType: ModuleType): Promise<void> {
    await volume.promises.writeFile(
        getPathToProjectFile(getFilePath(moduleType)),
        JSON.stringify(
            {
                compilerOptions: {
                    composite: true,
                    module: getModule(moduleType),
                    target: "esnext",
                    outDir: getOutDir(moduleType),
                    rootDir: SRC_DIRECTORY,
                    moduleResolution: "node",
                    skipLibCheck: true,
                    esModuleInterop: true,
                    strict: true,
                    declaration: true,
                    noFallthroughCasesInSwitch: true,
                    forceConsistentCasingInFileNames: true,
                    noUncheckedIndexedAccess: true,
                    noUnusedLocals: true,
                    noUnusedParameters: true,
                },
                include: [SRC_DIRECTORY],
            },
            undefined,
            4
        )
    );
}

function getModule(moduleType: ModuleType): string {
    switch (moduleType) {
        case "commonjs":
            return "commonjs";
        case "esm":
            return "esnext";
    }
}

function getFilePath(moduleType: ModuleType): string {
    switch (moduleType) {
        case "commonjs":
            return CJS_TSCONFIG_PATH;
        case "esm":
            return ESM_TSCONFIG_PATH;
    }
}

function getOutDir(moduleType: ModuleType): string {
    switch (moduleType) {
        case "commonjs":
            return RELATIVE_CJS_OUT_DIR_PATH;
        case "esm":
            return RELATIVE_ESM_OUT_DIR_PATH;
    }
}
