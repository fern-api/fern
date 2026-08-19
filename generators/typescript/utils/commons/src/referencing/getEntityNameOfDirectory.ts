import { ts } from "ts-morph";

import { ExportedDirectory, ExportsManager } from "../exports-manager/index.js";
import { getQualifiedNameOfDirectory } from "./getQualifiedNameOfDirectory.js";

export declare namespace getEntityNameOfDirectory {
    export interface Args {
        pathToDirectory: ExportedDirectory[];
        prefix?: ts.EntityName;
        exportsManager: ExportsManager;
    }
}

export function getEntityNameOfDirectory({
    pathToDirectory,
    prefix,
    exportsManager
}: getEntityNameOfDirectory.Args): ts.EntityName {
    return getQualifiedNameOfDirectory<ts.EntityName>({
        pathToDirectory,
        constructQualifiedName: (left, right) => ts.factory.createQualifiedName(left, right),
        convertToQualifiedName: (value) => ts.factory.createIdentifier(value),
        prefix,
        exportsManager
    });
}
