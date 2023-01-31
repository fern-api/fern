import { Volume } from "memfs/lib/volume";
import { CompilerOptions, ModuleKind, ModuleResolutionKind, ScriptTarget } from "ts-morph";
import { LIB_DIRECTORY, SRC_DIRECTORY } from "./constants";
import { getPathToProjectFile } from "./utils";

export async function generateTsConfig(volume: Volume): Promise<void> {
    const compilerOptions: CompilerOptions = {
        strict: true,
        target: "esnext" as unknown as ScriptTarget,
        module: "esnext" as unknown as ModuleKind,
        moduleResolution: "node" as unknown as ModuleResolutionKind,
        esModuleInterop: true,
        skipLibCheck: true,
        declaration: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        outDir: LIB_DIRECTORY,
        rootDir: SRC_DIRECTORY,
        baseUrl: SRC_DIRECTORY,
    };

    await volume.promises.writeFile(
        getPathToProjectFile("tsconfig.json"),
        JSON.stringify(
            {
                compilerOptions,
                include: [SRC_DIRECTORY],
                exclude: [],
            },
            undefined,
            4
        )
    );
}
