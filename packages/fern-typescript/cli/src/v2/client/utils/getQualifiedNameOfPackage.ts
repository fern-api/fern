import path from "path";
import { convertDirectoryNameToExportedNamespace } from "../../exports-manager/ExportsManager";

export declare namespace getQualifiedNameForPackageOfFilepath {
    export interface Args<QualifiedName> {
        apiName: QualifiedName;
        constructQualifiedName: (left: QualifiedName, right: string) => QualifiedName;
        pathToFileInPackage: string;
    }
}

export function getQualifiedNameOfPackage<QualifiedName>({
    pathToFileInPackage,
    constructQualifiedName,
    apiName,
}: getQualifiedNameForPackageOfFilepath.Args<QualifiedName>): QualifiedName {
    return path
        .dirname(pathToFileInPackage)
        .split(path.sep)
        .map((part) => convertDirectoryNameToExportedNamespace(part))
        .filter((part) => part.length > 0)
        .reduce<QualifiedName>((qualifiedReference, fernFilepathItem) => {
            return constructQualifiedName(qualifiedReference, fernFilepathItem);
        }, apiName);
}
