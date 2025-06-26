import { ts } from "ts-morph";

import { ExportedDirectory, ExportsManager } from "../exports-manager";
import { getQualifiedNameOfDirectory } from "./getQualifiedNameOfDirectory";

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
