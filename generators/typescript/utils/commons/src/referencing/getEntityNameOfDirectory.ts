import { ts } from "ts-morph";

import { ExportedDirectory } from "../exports-manager/ExportedFilePath";
import { getQualifiedNameOfDirectory } from "./getQualifiedNameOfDirectory";

export declare namespace getEntityNameOfDirectory {
    export interface Args {
        pathToDirectory: ExportedDirectory[];
        prefix?: ts.EntityName;
    }
}

export function getEntityNameOfDirectory({ pathToDirectory, prefix }: getEntityNameOfDirectory.Args): ts.EntityName {
    return getQualifiedNameOfDirectory<ts.EntityName>({
        pathToDirectory,
        constructQualifiedName: (left, right) => ts.factory.createQualifiedName(left, right),
        convertToQualifiedName: (value) => ts.factory.createIdentifier(value),
        prefix
    });
}
