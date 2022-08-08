import { ts } from "ts-morph";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getQualifiedNameOfContainingDirectory } from "./getQualifiedNameOfContainingDirectory";

export declare namespace getExpressionToContainingDirectory {
    export interface Args {
        apiName: string;
        pathToFile: ExportedFilePath;
    }
}

export function getExpressionToContainingDirectory({
    pathToFile,
    apiName,
}: getExpressionToContainingDirectory.Args): ts.Expression {
    return getQualifiedNameOfContainingDirectory<ts.Expression>({
        apiName: ts.factory.createIdentifier(apiName),
        pathToFile,
        constructQualifiedName: (left, right) => ts.factory.createPropertyAccessExpression(left, right),
    });
}
