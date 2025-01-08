import { ts } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { DependencyManager } from "../../dependency-manager/DependencyManager";
import { CoreUtility } from "../CoreUtility";
import { PromiseUtils } from "./PromiseUtils";

export class PromiseUtilsImpl extends CoreUtility implements PromiseUtils {
    public readonly MANIFEST = {
        name: "promise",
        repoInfoForTesting: {
            path: RelativeFilePath.of("generators/typescript/utils/core-utilities/fetcher/src/promise")
        },
        originalPathOnDocker: AbsoluteFilePath.of("/assets/fetcher/promise"),
        pathInCoreUtilities: [{ nameOnDisk: "api-promise", exportDeclaration: { exportAll: true } }],
        addDependencies: (dependencyManager: DependencyManager): void => {
            return;
        }
    };

    public APIPromise = {
        _getReferenceToType: this.withExportedName(
            "APIPromise",
            (APIResponse) => (responseType: ts.TypeNode) =>
                ts.factory.createTypeReferenceNode(APIResponse.getEntityName(), [responseType])
        ),
        from: (body: ts.Statement[]): ts.Expression => {
            return ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("core"),
                        ts.factory.createIdentifier("APIPromise")
                    ),
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
        }
    };
}
