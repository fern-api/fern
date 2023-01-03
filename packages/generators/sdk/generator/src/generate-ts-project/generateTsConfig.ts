import { Volume } from "memfs/lib/volume";
import { CompilerOptions, ModuleKind, ModuleResolutionKind, ScriptTarget } from "ts-morph";
import { getPathToProjectFile } from "./utils";

export async function generateTsConfig({
    volume,
    packageName,
}: {
    volume: Volume;
    packageName: string;
}): Promise<void> {
    const compilerOptions: CompilerOptions = {
        strict: true,
        target: "esnext" as unknown as ScriptTarget,
        module: "esnext" as unknown as ModuleKind,
        moduleResolution: "node" as unknown as ModuleResolutionKind,
        esModuleInterop: true,
        skipLibCheck: true,
        declaration: true,
        emitDeclarationOnly: true,
        noUncheckedIndexedAccess: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        outDir: ".",
        rootDir: "src",
        baseUrl: "src",
        paths: {
            [packageName]: ["."],
        },
    };

    await volume.promises.writeFile(
        getPathToProjectFile("tsconfig.json"),
        JSON.stringify(
            {
                compilerOptions,
                include: ["src"],
                exclude: [],
            },
            undefined,
            4
        )
    );
}
