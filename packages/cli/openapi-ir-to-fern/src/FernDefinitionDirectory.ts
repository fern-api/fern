import { RelativeFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import path from "path";

export class FernDefinitionDirectory {
    private files: Record<RelativeFilePath, RawSchemas.DefinitionFileSchema> = {};
    private directories: Record<string, FernDefinitionDirectory> = {};

    public getAllFiles(): Record<RelativeFilePath, RawSchemas.DefinitionFileSchema> {
        const files: Record<RelativeFilePath, RawSchemas.DefinitionFileSchema> = {};

        const walk = (root: FernDefinitionDirectory, currentPath?: string) => {
            for (const [relativeFilePath, definition] of Object.entries(root.files)) {
                const fullRelativeFilePath =
                    currentPath != null
                        ? RelativeFilePath.of(`${currentPath}${path.sep}${relativeFilePath}`)
                        : RelativeFilePath.of(relativeFilePath);
                files[fullRelativeFilePath] = definition;
            }
            const sortedDirectories = Object.keys(root.directories).sort();
            for (const directory of sortedDirectories) {
                const nextPath = currentPath != null ? `${currentPath}${path.sep}${directory}` : directory;
                const nextDirectory = root.directories[directory]!;
                walk(nextDirectory, nextPath);
            }
        };

        walk(this);

        return files;
    }

    public getOrCreateFile(relativeFilePath: RelativeFilePath): RawSchemas.DefinitionFileSchema {
        return this.getOrCreateFileRecursive(relativeFilePath.split(path.sep));
    }

    private getOrCreateFileRecursive(pathParts: string[]): RawSchemas.DefinitionFileSchema {
        if (pathParts.length === 1) {
            return (this.files[RelativeFilePath.of(pathParts[0]!)] ??= {});
        }
        const [directory, ...remainingPath] = pathParts;
        if (directory == null) {
            throw new Error(`Internal error; cannot add file with path: ${pathParts}`);
        }
        if (!this.directories[directory]) {
            this.directories[directory] = new FernDefinitionDirectory();
        }
        return this.directories[directory]!.getOrCreateFileRecursive(remainingPath);
    }
}
