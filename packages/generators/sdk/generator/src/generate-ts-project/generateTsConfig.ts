import { Volume } from "memfs/lib/volume";
import { CompilerOptions, ModuleKind, ModuleResolutionKind, ScriptTarget } from "ts-morph";
import { getPathToProjectFile } from "./utils";

const COMPILER_OPTIONS: CompilerOptions = {
    strict: true,
    target: "esnext" as unknown as ScriptTarget,
    module: "commonjs" as unknown as ModuleKind,
    moduleResolution: "node" as unknown as ModuleResolutionKind,
    esModuleInterop: true,
    skipLibCheck: true,
    declaration: true,
    sourceMap: true,
    inlineSources: true,
    noUncheckedIndexedAccess: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    outDir: ".",
    rootDir: "src",
};

export async function generateTsConfig(volume: Volume): Promise<void> {
    await volume.promises.writeFile(
        getPathToProjectFile("tsconfig.json"),
        JSON.stringify(
            {
                compilerOptions: COMPILER_OPTIONS,
                include: ["src"],
                exclude: [],
            },
            undefined,
            4
        )
    );
}
