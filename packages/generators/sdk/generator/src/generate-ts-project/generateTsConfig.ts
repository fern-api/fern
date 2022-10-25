import { Volume } from "memfs/lib/volume";
import { CompilerOptions, ModuleResolutionKind, ScriptTarget } from "ts-morph";
import { TYPE_DECLARATIONS_DIRECTORY } from "./constants";
import { getPathToProjectFile } from "./utils";

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
    outDir: TYPE_DECLARATIONS_DIRECTORY,
    rootDir: "src",
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
