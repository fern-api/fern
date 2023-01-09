import { Volume } from "memfs/lib/volume";
import { NON_EXPORTED_FOLDERS, TYPES_DIRECTORY } from "./constants";
import { getPathToProjectFile } from "./utils";

export async function generateStubTypeDeclarations(volume: Volume): Promise<void> {
    for (const folder of NON_EXPORTED_FOLDERS) {
        await exportFolder(folder, volume);
    }
}

export function getAllStubTypeFiles(): string[] {
    return NON_EXPORTED_FOLDERS.map(getPathForStubTypesDeclarationFile);
}

async function exportFolder(folder: string, volume: Volume) {
    await volume.promises.writeFile(
        getPathToProjectFile(getPathForStubTypesDeclarationFile(folder)),
        `// this is needed for older versions of TypeScript
// that don't read the "exports" field in package.json
export * from "./${TYPES_DIRECTORY}/${folder}";
`
    );
}

function getPathForStubTypesDeclarationFile(folder: string) {
    return `${folder}.d.ts`;
}
