import { ExportedDirectory, ExportedFilePath } from "../../exports-manager/ExportedFilePath";

export declare namespace getQualifiedNameOfContainingDirectory {
    export interface Args<QualifiedName> {
        convertToQualifiedName: (value: string) => QualifiedName;
        constructQualifiedName: (left: QualifiedName, right: string) => QualifiedName;
        pathToFile: ExportedFilePath;
        prefix?: QualifiedName;
    }
}

export function getQualifiedNameOfContainingDirectory<QualifiedName>({
    pathToFile,
    convertToQualifiedName,
    constructQualifiedName,
    prefix,
}: getQualifiedNameOfContainingDirectory.Args<QualifiedName>): QualifiedName {
    const { initial, remainingDirectories } = splitQualifieidName({ convertToQualifiedName, prefix, pathToFile });

    return remainingDirectories.reduce<QualifiedName>((qualifiedReference, directory) => {
        if (directory.exportDeclaration?.namespaceExport != null) {
            return constructQualifiedName(qualifiedReference, directory.exportDeclaration.namespaceExport);
        }
        return qualifiedReference;
    }, initial);
}

function splitQualifieidName<QualifiedName>({
    convertToQualifiedName,
    pathToFile,
    prefix,
}: {
    convertToQualifiedName: (value: string) => QualifiedName;
    pathToFile: ExportedFilePath;
    prefix?: QualifiedName;
}): { initial: QualifiedName; remainingDirectories: ExportedDirectory[] } {
    if (prefix != null) {
        return { initial: prefix, remainingDirectories: pathToFile.directories };
    }

    const [first, ...rest] = pathToFile.directories;
    if (first == null) {
        throw new Error("Cannot get qualified name because path is empty: " + pathToFile.file.nameOnDisk);
    }
    if (first.exportDeclaration?.namespaceExport == null) {
        throw new Error(
            "Cannot get qualified name because path is not namespace-exported: " + pathToFile.file.nameOnDisk
        );
    }

    return { initial: convertToQualifiedName(first.exportDeclaration.namespaceExport), remainingDirectories: rest };
}
