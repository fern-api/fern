import { Volume } from "memfs/lib/volume";
import { CompilerOptions, ModuleResolutionKind, ScriptTarget } from "ts-morph";
import { getPathToProjectFile } from "./utils";

export const TSCONFIG_OUT_DIR = "types";

const COMPILER_OPTIONS: CompilerOptions = {
    strict: true,
    target: "esnext" as unknown as ScriptTarget,
    moduleResolution: "node" as unknown as ModuleResolutionKind,
    skipLibCheck: true,
    declaration: true,
    sourceMap: true,
    emitDeclarationOnly: true,
    esModuleInterop: true,
    noUncheckedIndexedAccess: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    outDir: TSCONFIG_OUT_DIR,
};

export async function generateTsConfig(volume: Volume): Promise<void> {
    await volume.promises.writeFile(
        getPathToProjectFile("tsconfig.json"),
        JSON.stringify(
            {
                compilerOptions: COMPILER_OPTIONS,
            },
            undefined,
            4
        )
    );
}
