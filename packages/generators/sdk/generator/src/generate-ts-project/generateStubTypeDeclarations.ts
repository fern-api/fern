import { Volume } from "memfs/lib/volume";
import { TYPES_DIRECTORY } from "./constants";
import { getPathToProjectFile } from "./utils";

export async function generateStubTypeDeclarations(volume: Volume): Promise<void> {
    await volume.promises.writeFile(
        getPathToProjectFile("core.d.ts"),
        `// this is needed for older versions of TypeScript
// that don't read the "exports" field in package.json
export * from "./${TYPES_DIRECTORY}/core/index.d.ts";
`
    );
    await volume.promises.writeFile(
        getPathToProjectFile("serialization.d.ts"),
        `// this is needed for older versions of TypeScript
// that don't read the "exports" field in package.json
export * from "./${TYPES_DIRECTORY}/serialization/index.d.ts";
`
    );
}
