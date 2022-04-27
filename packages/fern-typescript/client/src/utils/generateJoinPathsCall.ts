import { SourceFile, ts } from "ts-morph";

const FUNCTION_NAME = "joinPaths";

export function generateJoinPathsCall({
    file,
    paths,
}: {
    file: SourceFile;
    paths: readonly ts.Expression[];
}): ts.CallExpression {
    file.addImportDeclaration({
        namedImports: [FUNCTION_NAME],
        moduleSpecifier: "@fern-typescript/service-utils",
    });
    return ts.factory.createCallExpression(ts.factory.createIdentifier(FUNCTION_NAME), undefined, paths);
}
