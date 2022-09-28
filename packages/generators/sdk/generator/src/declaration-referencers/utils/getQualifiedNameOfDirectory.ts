import { ExportedDirectory } from "../../exports-manager/ExportedFilePath";

export declare namespace getQualifiedNameOfDirectory {
    export interface Args<QualifiedName> {
        convertToQualifiedName: (value: string) => QualifiedName;
        constructQualifiedName: (left: QualifiedName, right: string) => QualifiedName;
        pathToDirectory: ExportedDirectory[];
        prefix?: QualifiedName;
    }
}

export function getQualifiedNameOfDirectory<QualifiedName>({
    pathToDirectory,
    convertToQualifiedName,
    constructQualifiedName,
    prefix,
}: getQualifiedNameOfDirectory.Args<QualifiedName>): QualifiedName {
    const { initial, remainingDirectories } = splitQualifieidName({ convertToQualifiedName, prefix, pathToDirectory });

    return remainingDirectories.reduce<QualifiedName>((qualifiedReference, directory) => {
        if (directory.exportDeclaration?.namespaceExport != null) {
            return constructQualifiedName(qualifiedReference, directory.exportDeclaration.namespaceExport);
        }
        return qualifiedReference;
    }, initial);
}

function splitQualifieidName<QualifiedName>({
    convertToQualifiedName,
    pathToDirectory,
    prefix,
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
