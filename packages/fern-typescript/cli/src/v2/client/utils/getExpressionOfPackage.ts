import { ts } from "ts-morph";
import { getQualifiedNameOfPackage } from "./getQualifiedNameOfPackage";

export declare namespace getExpressionOfPackage {
    export interface Args {
        apiName: string;
        pathToFileInPackage: string;
    }
}

export function getExpressionOfPackage({ pathToFileInPackage, apiName }: getExpressionOfPackage.Args): ts.Expression {
    return getQualifiedNameOfPackage<ts.Expression>({
        apiName: ts.factory.createIdentifier(apiName),
        pathToFileInPackage,
        constructQualifiedName: (left, right) => ts.factory.createPropertyAccessExpression(left, right),
    });
}
