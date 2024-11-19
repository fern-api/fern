import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { ts } from "ts-morph";
import { DependencyManager } from "../../dependency-manager/DependencyManager";
import { CoreUtility } from "../CoreUtility";
import { APIPromise } from "./APIPromise";

export class APIPromiseImpl extends CoreUtility implements APIPromise {
    public readonly MANIFEST = {
        name: "api-promise",
        repoInfoForTesting: {
            path: RelativeFilePath.of("generators/typescript/utils/core-utilities/fetcher/src/runtime")
        },
        originalPathOnDocker: AbsoluteFilePath.of("/assets/fetcher/api-promise"),
        pathInCoreUtilities: [{ nameOnDisk: "api-promise", exportDeclaration: { exportAll: true } }],
        addDependencies: (dependencyManager: DependencyManager): void => {
            return;
        },
    };

    public _getReferenceToType = (response: ts.TypeNode): ts.TypeNode => {
        return ts.factory.createTypeReferenceNode("APIPromise", [response]);
    };

    public from = (body: ts.Statement[]): ts.Expression => {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("APIPromise"),
                ts.factory.createIdentifier("from")
            ),
            undefined,
            [
                ts.factory.createCallExpression(
                    ts.factory.createParenthesizedExpression(
                        ts.factory.createArrowFunction(
                            [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
                            undefined,
                            [],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createBlock(body, true)
                        )
                    ),
                    undefined,
                    []
                )
            ]
        );
    };
}
