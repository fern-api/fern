import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility";

import { FetcherImpl } from "./Fetcher";

const DEFAULT_PACKAGE_PATH = "src";

export interface Pagination {
    readonly Page: {
        _getReferenceToType: (itemType: ts.TypeNode) => ts.TypeNode;
    };

    readonly Pageable: {
        _construct: (args: {
            responseType: ts.TypeNode;
            itemType: ts.TypeNode;
            response: ts.Expression;
            rawResponse: ts.Expression;
            hasNextPage: ts.Expression;
            getItems: ts.Expression;
            loadPage: ts.Expression;
        }) => ts.Expression;
        _getReferenceToType: (response: ts.TypeNode, itemType: ts.TypeNode) => ts.TypeNode;
    };
}

export class PaginationImpl extends CoreUtility implements Pagination {
    private readonly fetcherImpl: FetcherImpl;
    public readonly MANIFEST: CoreUtility.Manifest;

    constructor({ getReferenceToExport, packagePath }: CoreUtility.Init & { packagePath: string }) {
        super({ getReferenceToExport });
        this.fetcherImpl = new FetcherImpl({ getReferenceToExport, packagePath });
        this.MANIFEST = {
            name: "pagination",
            dependsOn: [this.fetcherImpl.MANIFEST],
            pathInCoreUtilities: { nameOnDisk: "pagination", exportDeclaration: { exportAll: true } },
            addDependencies: (): void => {
                return;
            },
            getFilesPatterns: () => {
                return { patterns: [`${this.getRelativePackagePath(packagePath)}/core/pagination/**`] };
            }
        };
    }

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
                    rawResponse,
                    hasNextPage,
                    getItems,
                    loadPage
                }: {
                    responseType: ts.TypeNode;
                    itemType: ts.TypeNode;
                    response: ts.Expression;
                    rawResponse: ts.Expression;
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
            "Pageable",
            (APIResponse) => (itemType: ts.TypeNode, response: ts.TypeNode) =>
                ts.factory.createTypeReferenceNode(APIResponse.getEntityName(), [response, itemType])
        )
    };

    private getRelativePackagePath(packagePath: string): string {
        if (packagePath === DEFAULT_PACKAGE_PATH) {
            return DEFAULT_PACKAGE_PATH;
        }

        return packagePath;
    }
}
