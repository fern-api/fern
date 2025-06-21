import path from "path";

import { keys } from "@fern-api/core-utils";

import { ExportedDirectory, ExportsManager } from "../exports-manager";

const DEFAULT_SRC_DIRECTORY = "src";

export declare namespace getQualifiedNameOfDirectory {
    export interface Args<QualifiedName> {
        convertToQualifiedName: (value: string) => QualifiedName;
        constructQualifiedName: (left: QualifiedName, right: string) => QualifiedName;
        pathToDirectory: ExportedDirectory[];
        prefix?: QualifiedName;
        exportsManager: ExportsManager;
    }
}

export function getQualifiedNameOfDirectory<QualifiedName>({
    pathToDirectory,
    convertToQualifiedName,
    constructQualifiedName,
    prefix,
    exportsManager
}: getQualifiedNameOfDirectory.Args<QualifiedName>): QualifiedName {
    const { initial, remainingDirectories } = splitQualifiedName({ convertToQualifiedName, prefix, pathToDirectory });

    let qualifiedReference = initial;

    let i = 0;
    while (i < remainingDirectories.length) {
        let nextI = i + 1;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const directory = remainingDirectories[i]!;
        let exportDeclaration = directory.exportDeclaration;

        // prefer jumping through subexports when they exist
        if (directory.subExports != null) {
            const remainingPath = path.relative(
                exportsManager.convertExportedDirectoryPathToFilePath([directory]),
                exportsManager.convertExportedDirectoryPathToFilePath(remainingDirectories.slice(i))
            );
            const subExportPaths = keys(directory.subExports)
                .filter((subExportPath) => remainingPath.startsWith(subExportPath))
                // sort from deepest to shallowest
                .sort((a, b) => (a.length > b.length ? -1 : 1));
            const deepestSubExportPath = subExportPaths[0];
            if (deepestSubExportPath != null) {
                exportDeclaration = directory.subExports[deepestSubExportPath];
                const depth = deepestSubExportPath.split(path.sep).length;
                nextI += depth;
            }
        }

        if (exportDeclaration?.namespaceExport != null) {
            qualifiedReference = constructQualifiedName(qualifiedReference, exportDeclaration.namespaceExport);
        }

        i = nextI;
    }

    return qualifiedReference;
}

function splitQualifiedName<QualifiedName>({
    convertToQualifiedName,
    pathToDirectory,
    prefix
}: {
    convertToQualifiedName: (value: string) => QualifiedName;
    pathToDirectory: ExportedDirectory[];
    prefix?: QualifiedName;
}): { initial: QualifiedName; remainingDirectories: ExportedDirectory[] } {
    if (prefix != null) {
        return { initial: prefix, remainingDirectories: pathToDirectory };
    }

    const [first, ...rest] = pathToDirectory;
    if (first == null) {
        throw new Error("Cannot get qualified name because path is empty");
    }
    if (first.exportDeclaration?.namespaceExport == null) {
        throw new Error("Cannot get qualified name because path is not namespace-exported");
    }

    return { initial: convertToQualifiedName(first.exportDeclaration.namespaceExport), remainingDirectories: rest };
}
