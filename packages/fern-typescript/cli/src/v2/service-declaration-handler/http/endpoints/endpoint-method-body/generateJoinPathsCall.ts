import { ts } from "ts-morph";
import { File } from "../../../../client/types";

const DEFAULT_IMPORT = "urlJoin";

export function generateJoinUrlPathsCall({ file, paths }: { file: File; paths: ts.Expression[] }): ts.Expression {
    file.addDependency("url-join", "4.0.1");
    file.addDependency("@types/url-join", "4.0.1");
    return ts.factory.createCallExpression(ts.factory.createIdentifier(DEFAULT_IMPORT), undefined, paths);
}
