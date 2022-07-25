import { Volume } from "memfs/lib/volume";
import { CompilerOptions } from "typescript";
import { getPathToProjectFile } from "./utils";

const COMPILER_OPTIONS: CompilerOptions = {
    strict: true,
    skipLibCheck: true,
    declaration: true,
    sourceMap: true,
    emitDeclarationOnly: true,
    esModuleInterop: true,
    noUncheckedIndexedAccess: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
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
