import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";

export declare namespace getQualifiedNameOfContainingDirectory {
    export interface Args<QualifiedName> {
        apiName: QualifiedName;
        constructQualifiedName: (left: QualifiedName, right: string) => QualifiedName;
        pathToFile: ExportedFilePath;
    }
}

export function getQualifiedNameOfContainingDirectory<QualifiedName>({
    pathToFile,
    constructQualifiedName,
    apiName,
}: getQualifiedNameOfContainingDirectory.Args<QualifiedName>): QualifiedName {
    return pathToFile.directories.reduce<QualifiedName>((qualifiedReference, directory) => {
        if (directory.exportDeclaration?.namespaceExport != null) {
            return constructQualifiedName(qualifiedReference, directory.exportDeclaration.namespaceExport);
        }
        return qualifiedReference;
    }, apiName);
}
