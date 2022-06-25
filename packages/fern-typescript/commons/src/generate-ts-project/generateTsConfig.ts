import { Volume } from "memfs/lib/volume";
import { CompilerOptions } from "typescript";
import { getPathToProjectFile, RELATIVE_OUT_DIR_PATH, RELATIVE_SRC_PATH } from "./utils";

const COMPILER_OPTIONS: CompilerOptions = {
    rootDir: RELATIVE_SRC_PATH,
    outDir: RELATIVE_OUT_DIR_PATH,
    skipLibCheck: true,
    strict: true,
    declaration: true,
    emitDeclarationOnly: true,
    isolatedModules: true,
    esModuleInterop: true,
};

export async function generateTsConfig(volume: Volume): Promise<void> {
    await volume.promises.writeFile(
        getPathToProjectFile("tsconfig.json"),
        JSON.stringify(
            {
                compilerOptions: COMPILER_OPTIONS,
                include: [RELATIVE_SRC_PATH],
            },
            undefined,
            4
        )
    );
}
