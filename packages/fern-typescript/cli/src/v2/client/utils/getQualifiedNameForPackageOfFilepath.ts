import path from "path";
import { ts } from "ts-morph";
import { convertDirectoryNameToExportedNamespace } from "../exports-manager/ExportsManager";

export declare namespace getQualifiedNameForPackageOfFilepath {
    export interface Args {
        apiName: string;
        exportedFromPath: string;
    }
}

export function getQualifiedNameForPackageOfFilepath({
    exportedFromPath,
    apiName,
}: getQualifiedNameForPackageOfFilepath.Args): ts.EntityName {
    return path
        .dirname(exportedFromPath)
        .split(path.sep)
        .map((part) => convertDirectoryNameToExportedNamespace(part))
        .filter((part) => part.length > 0)
        .reduce<ts.EntityName>((qualifiedReference, fernFilepathItem) => {
            return ts.factory.createQualifiedName(qualifiedReference, fernFilepathItem);
        }, ts.factory.createIdentifier(apiName));
}
