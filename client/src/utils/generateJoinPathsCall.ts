import { SourceFile, ts } from "ts-morph";

export function generateJoinPathsCall({
    file,
    paths,
}: {
    file: SourceFile;
    paths: readonly ts.Expression[];
}): ts.CallExpression {
    file.addImportDeclaration({
        namespaceImport: "path",
        moduleSpecifier: "path",
    });
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("path"), "join"),
        undefined,
        paths
    );
}
