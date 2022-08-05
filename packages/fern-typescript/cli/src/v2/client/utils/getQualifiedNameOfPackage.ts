import path from "path";

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
        .filter((part) => part.length > 0 && part !== ".")
        .reduce<QualifiedName>((qualifiedReference, fernFilepathItem) => {
            return constructQualifiedName(qualifiedReference, fernFilepathItem);
        }, apiName);
}
