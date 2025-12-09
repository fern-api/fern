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
    readonly CustomPager: {
        _create: (args: {
            itemType: ts.TypeNode;
            requestType: ts.TypeNode;
            responseType: ts.TypeNode;
            context: ts.Expression;
            parser: ts.Expression;
        }) => ts.Expression;
        _getReferenceToType: (
            itemType: ts.TypeNode,
            requestType: ts.TypeNode,
            responseType: ts.TypeNode
        ) => ts.TypeNode;
        _getParserType: (itemType: ts.TypeNode, requestType: ts.TypeNode, responseType: ts.TypeNode) => ts.TypeNode;
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
    public readonly Page: Pagination["Page"];
    public readonly CustomPager: Pagination["CustomPager"];

    constructor(init: CoreUtility.Init & { customPagerName?: string }) {
        super(init);
        const customPagerName = init.customPagerName ?? "CustomPager";
        const customPagerParserName = init.customPagerName ? `${init.customPagerName}Parser` : "CustomPagerParser";

        this.Page = {
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

        this.CustomPager = {
            _create: this.withExportedName(
                customPagerName,
                (CustomPager) =>
                    ({
                        itemType,
                        requestType,
                        responseType,
                        context,
                        parser
                    }: {
                        itemType: ts.TypeNode;
                        requestType: ts.TypeNode;
                        responseType: ts.TypeNode;
                        context: ts.Expression;
                        parser: ts.Expression;
                    }): ts.Expression => {
                        return ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                CustomPager.getExpression(),
                                ts.factory.createIdentifier("create")
                            ),
                            [itemType, requestType, responseType],
                            [
                                ts.factory.createObjectLiteralExpression(
                                    [
                                        ts.factory.createPropertyAssignment(
                                            ts.factory.createIdentifier("context"),
                                            context
                                        ),
                                        ts.factory.createPropertyAssignment(
                                            ts.factory.createIdentifier("parser"),
                                            parser
                                        )
                                    ],
                                    true
                                )
                            ]
                        );
                    }
            ),
            _getReferenceToType: this.withExportedName(
                customPagerName,
                (CustomPager) => (itemType: ts.TypeNode, requestType: ts.TypeNode, responseType: ts.TypeNode) =>
                    ts.factory.createTypeReferenceNode(CustomPager.getEntityName(), [
                        itemType,
                        requestType,
                        responseType
                    ])
            ),
            _getParserType: this.withExportedName(
                customPagerParserName,
                (CustomPagerParser) => (itemType: ts.TypeNode, requestType: ts.TypeNode, responseType: ts.TypeNode) =>
                    ts.factory.createTypeReferenceNode(CustomPagerParser.getEntityName(), [
                        itemType,
                        requestType,
                        responseType
                    ])
            )
        };
    }
}
