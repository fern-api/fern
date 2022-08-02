import { SourceFile, ts } from "ts-morph";
import { DependencyManager } from "./DependencyManager";

export function generateUuidCall({
    file,
    dependencyManager,
}: {
    file: SourceFile;
    dependencyManager: DependencyManager;
}): ts.CallExpression {
    dependencyManager.addDependency("uuid", "8.3.2");
    dependencyManager.addDependency("@types/uuid", "8.3.4");

    file.addImportDeclaration({
        moduleSpecifier: "uuid",
        namespaceImport: "uuid",
    });

    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier("uuid"),
            ts.factory.createIdentifier("v4")
        ),
        undefined,
        []
    );
}
