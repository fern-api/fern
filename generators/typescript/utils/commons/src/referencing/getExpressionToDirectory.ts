import { ts } from "ts-morph";

import { ExportedDirectory } from "../exports-manager/ExportedFilePath";
import { getQualifiedNameOfDirectory } from "./getQualifiedNameOfDirectory";

export declare namespace getExpressionToDirectory {
    export interface Args {
        pathToDirectory: ExportedDirectory[];
        prefix?: ts.Expression;
    }
}

export function getExpressionToDirectory({ pathToDirectory, prefix }: getExpressionToDirectory.Args): ts.Expression {
    return getQualifiedNameOfDirectory<ts.Expression>({
        pathToDirectory,
        constructQualifiedName: (left, right) => ts.factory.createPropertyAccessExpression(left, right),
        convertToQualifiedName: (value) => ts.factory.createIdentifier(value),
        prefix
    });
}
