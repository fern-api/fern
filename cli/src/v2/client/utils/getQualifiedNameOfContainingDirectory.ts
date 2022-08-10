import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";

export declare namespace getQualifiedNameOfContainingDirectory {
    export interface Args<QualifiedName> {
        convertToQualifiedName: (value: string) => QualifiedName;
        constructQualifiedName: (left: QualifiedName, right: string) => QualifiedName;
        pathToFile: ExportedFilePath;
    }
}

export function getQualifiedNameOfContainingDirectory<QualifiedName>({
    pathToFile,
    convertToQualifiedName,
    constructQualifiedName,
}: getQualifiedNameOfContainingDirectory.Args<QualifiedName>): QualifiedName {
    const [first, ...rest] = pathToFile.directories;
    if (first == null) {
        throw new Error("Cannot get qualified name because path is empty: " + pathToFile.file.nameOnDisk);
    }
    if (first.exportDeclaration?.namespaceExport == null) {
        throw new Error(
            "Cannot get qualified name because path is not namespace-exported: " + pathToFile.file.nameOnDisk
        );
    }

    return rest.reduce<QualifiedName>((qualifiedReference, directory) => {
        if (directory.exportDeclaration?.namespaceExport != null) {
            return constructQualifiedName(qualifiedReference, directory.exportDeclaration.namespaceExport);
        }
        return qualifiedReference;
    }, convertToQualifiedName(first.exportDeclaration.namespaceExport));
}
