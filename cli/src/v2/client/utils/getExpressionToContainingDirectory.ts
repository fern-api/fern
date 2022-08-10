import { ts } from "ts-morph";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getQualifiedNameOfContainingDirectory } from "./getQualifiedNameOfContainingDirectory";

export declare namespace getExpressionToContainingDirectory {
    export interface Args {
        pathToFile: ExportedFilePath;
    }
}

export function getExpressionToContainingDirectory({
    pathToFile,
}: getExpressionToContainingDirectory.Args): ts.Expression {
    return getQualifiedNameOfContainingDirectory<ts.Expression>({
        pathToFile,
        constructQualifiedName: (left, right) => ts.factory.createPropertyAccessExpression(left, right),
        convertToQualifiedName: (value) => ts.factory.createIdentifier(value),
    });
}
