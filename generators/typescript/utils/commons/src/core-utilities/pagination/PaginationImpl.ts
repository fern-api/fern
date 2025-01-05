import { ts } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { CoreUtility } from "../CoreUtility";
import { Pagination } from "./Pagination";

export class PaginationImpl extends CoreUtility implements Pagination {
    public readonly MANIFEST = {
        name: "pagination",
        repoInfoForTesting: {
            path: RelativeFilePath.of("generators/typescript/utils/core-utilities/fetcher/src/pagination")
        },
        originalPathOnDocker: AbsoluteFilePath.of("/assets/fetcher/pagination"),
        pathInCoreUtilities: [{ nameOnDisk: "pagination", exportDeclaration: { exportAll: true } }],
        addDependencies: (): void => {
            return;
        }
    };

    public Page = {
        _getReferenceToType: this.withExportedName(
            "Page",
            (APIResponse) => (itemType: ts.TypeNode) =>
                ts.factory.createTypeReferenceNode(APIResponse.getEntityName(), [itemType])
        )
    };
    public Pageable = {
        _construct: this.withExportedName(
            "Pageable",
            (Pageable) =>
                ({
                    responseType,
                    itemType,
                    response,
                    hasNextPage,
                    getItems,
                    loadPage
                }: {
                    responseType: ts.TypeNode;
                    itemType: ts.TypeNode;
                    response: ts.Expression;
                    hasNextPage: ts.Expression;
                    getItems: ts.Expression;
                    loadPage: ts.Expression;
                }): ts.Expression => {
                    return ts.factory.createNewExpression(
                        Pageable.getExpression(),
                        [responseType, itemType],
                        [
                            ts.factory.createObjectLiteralExpression(
                                [
                                    ts.factory.createPropertyAssignment(
                                        ts.factory.createIdentifier("response"),
                                        response
                                    ),
                                    ts.factory.createPropertyAssignment(
                                        ts.factory.createIdentifier("hasNextPage"),
                                        hasNextPage
                                    ),
                                    ts.factory.createPropertyAssignment(
                                        ts.factory.createIdentifier("getItems"),
                                        getItems
                                    ),
                                    ts.factory.createPropertyAssignment(
                                        ts.factory.createIdentifier("loadPage"),
                                        loadPage
                                    )
                                ],
                                true
                            )
                        ]
                    );
                }
        ),
        _getReferenceToType: this.withExportedName(
            "Pageable",
            (APIResponse) => (itemType: ts.TypeNode, response: ts.TypeNode) =>
                ts.factory.createTypeReferenceNode(APIResponse.getEntityName(), [response, itemType])
        )
    };
}
