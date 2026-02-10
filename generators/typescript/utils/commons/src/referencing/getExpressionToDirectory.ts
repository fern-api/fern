import { ts } from "ts-morph";

import { ExportedDirectory, ExportsManager } from "../exports-manager/index.js";
import { getQualifiedNameOfDirectory } from "./getQualifiedNameOfDirectory.js";

export declare namespace getExpressionToDirectory {
    export interface Args {
        pathToDirectory: ExportedDirectory[];
        prefix?: ts.Expression;
        exportsManager: ExportsManager;
    }
}

export function getExpressionToDirectory({
    pathToDirectory,
    prefix,
    exportsManager
}: getExpressionToDirectory.Args): ts.Expression {
    return getQualifiedNameOfDirectory<ts.Expression>({
        pathToDirectory,
        constructQualifiedName: (left, right) => ts.factory.createPropertyAccessExpression(left, right),
        convertToQualifiedName: (value) => ts.factory.createIdentifier(value),
        prefix,
        exportsManager
    });
}
