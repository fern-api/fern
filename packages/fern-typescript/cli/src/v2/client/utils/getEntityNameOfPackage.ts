import { ts } from "ts-morph";
import { getQualifiedNameOfPackage } from "./getQualifiedNameOfPackage";

export declare namespace getEntityNameOfPackage {
    export interface Args {
        apiName: string;
        pathToFileInPackage: string;
    }
}

export function getEntityNameOfPackage({ pathToFileInPackage, apiName }: getEntityNameOfPackage.Args): ts.EntityName {
    return getQualifiedNameOfPackage<ts.EntityName>({
        apiName: ts.factory.createIdentifier(apiName),
        pathToFileInPackage,
        constructQualifiedName: (left, right) => ts.factory.createQualifiedName(left, right),
    });
}
