import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility";
import { MANIFEST as FetcherManifest } from "./Fetcher";

export interface Pagination {
    readonly Page: {
        _construct: (args: {
            itemType: ts.TypeNode;
            responseType: ts.TypeNode;
            response: ts.Expression;
            rawResponse: ts.Expression;
            hasNextPage: ts.Expression;
            getItems: ts.Expression;
            loadPage: ts.Expression;
        }) => ts.Expression;
        _getReferenceToType: (responseType: ts.TypeNode, itemType: ts.TypeNode) => ts.TypeNode;
    };
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "pagination",
    pathInCoreUtilities: { nameOnDisk: "pagination", exportDeclaration: { exportAll: true } },
    addDependencies: (): void => {
        return;
    },
    dependsOn: [FetcherManifest],
    getFilesPatterns: () => {
        return { patterns: "src/core/pagination/**" };
    }
};

export class PaginationImpl extends CoreUtility implements Pagination {
    public readonly MANIFEST = MANIFEST;
    public Page = {
        _construct: this.withExportedName(
            "Page",
            (Page) =>
                ({
                    itemType,
                    responseType,
                    response,
                    rawResponse,
                    hasNextPage,
                    getItems,
                    loadPage
                }: {
                    itemType: ts.TypeNode;
                    responseType: ts.TypeNode;
                    response: ts.Expression;
                    rawResponse: ts.Expression;
                    hasNextPage: ts.Expression;
                    getItems: ts.Expression;
                    loadPage: ts.Expression;
                }): ts.Expression => {
                    return ts.factory.createNewExpression(
                        Page.getExpression(),
                        [itemType, responseType],
                        [
                            ts.factory.createObjectLiteralExpression(
                                [
                                    ts.factory.createPropertyAssignment(
                                        ts.factory.createIdentifier("response"),
                                        response
                                    ),
                                    ts.factory.createPropertyAssignment(
                                        ts.factory.createIdentifier("rawResponse"),
                                        rawResponse
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
            "Page",
            (APIResponse) => (itemType: ts.TypeNode, responseType: ts.TypeNode) =>
                ts.factory.createTypeReferenceNode(APIResponse.getEntityName(), [itemType, responseType])
        )
    };
}
