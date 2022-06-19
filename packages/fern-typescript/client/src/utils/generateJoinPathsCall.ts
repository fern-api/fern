import { SourceFileManager } from "@fern-typescript/commons";
import { ts } from "ts-morph";

export function generateJoinPathsCall({
    file,
    paths,
}: {
    file: SourceFileManager;
    paths: readonly ts.Expression[];
}): ts.CallExpression {
    file.addImportDeclaration({
        defaultImport: "path",
        moduleSpecifier: "path",
    });
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("path"), "join"),
        undefined,
        paths
    );
}
