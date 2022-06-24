import { DependencyManager } from "@fern-typescript/commons";
import { SourceFile, ts } from "ts-morph";
import { ServerConstants } from "../constants";

export function getExpressCall({
    file,
    dependencyManager,
}: {
    file: SourceFile;
    dependencyManager: DependencyManager;
}): ts.CallExpression {
    addExpressImport({ file, dependencyManager, defaultImport: ServerConstants.Express.DEFAULT_IMPORT });
    return ts.factory.createCallExpression(
        ts.factory.createIdentifier(ServerConstants.Express.DEFAULT_IMPORT),
        undefined,
        []
    );
}

export function getExpressType({
    file,
    dependencyManager,
}: {
    file: SourceFile;
    dependencyManager: DependencyManager;
}): ts.TypeReferenceNode {
    addExpressImport({ file, dependencyManager, namedImports: [ServerConstants.Express.EXPRESS_TYPE] });
    return ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(ServerConstants.Express.EXPRESS_TYPE));
}

function addExpressImport({
    file,
    dependencyManager,
    defaultImport,
    namedImports,
}: {
    file: SourceFile;
    dependencyManager: DependencyManager;
    defaultImport?: string;
    namedImports?: string[];
}): void {
    file.addImportDeclaration({
        defaultImport,
        namedImports,
        moduleSpecifier: "express",
    });
    dependencyManager.addDependency("express", "^4.18.1", { preferPeer: true });
    dependencyManager.addDependency("@types/express", "^4.17.13", { preferPeer: true });
}
