import { ts } from "ts-morph";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getQualifiedNameOfContainingDirectory } from "./getQualifiedNameOfContainingDirectory";

export declare namespace getEntityNameOfContainingDirectory {
    export interface Args {
        apiName: string;
        pathToFile: ExportedFilePath;
    }
}

export function getEntityNameOfContainingDirectory({
    pathToFile,
    apiName,
}: getEntityNameOfContainingDirectory.Args): ts.EntityName {
    return getQualifiedNameOfContainingDirectory<ts.EntityName>({
        apiName: ts.factory.createIdentifier(apiName),
        pathToFile,
        constructQualifiedName: (left, right) => ts.factory.createQualifiedName(left, right),
    });
}
