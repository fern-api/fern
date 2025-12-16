import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility";
import { MANIFEST as FetcherManifest } from "./Fetcher";

export interface CustomPagination {
    readonly CustomPager: {
        _create: (args: {
            itemType: ts.TypeNode;
            responseType: ts.TypeNode;
            sendRequest: ts.Expression;
            initialHttpRequest: ts.Expression;
            clientOptions: ts.Expression;
            requestOptions: ts.Expression;
        }) => ts.Expression;
        _getReferenceToType: (itemType: ts.TypeNode, responseType: ts.TypeNode) => ts.TypeNode;
    };
}

export declare namespace CustomPagination {
    export interface ApplyCustomizationsArgs {
        pathToSrc: string;
        customPagerName: string;
    }
}

export class CustomPaginationImpl extends CoreUtility implements CustomPagination {
    public readonly MANIFEST: CoreUtility.Manifest;
    public readonly CustomPager: CustomPagination["CustomPager"];

    constructor({ customPagerName, ...init }: CoreUtility.Init & { customPagerName: string }) {
        super(init);
        const createFunctionName = `create${customPagerName}`;

        this.MANIFEST = {
            name: "customPagination",
            pathInCoreUtilities: {
                nameOnDisk: `pagination/${customPagerName}`,
                exportDeclaration: {
                    namedExports: [
                        createFunctionName,
                        {
                            name: customPagerName,
                            type: "type"
                        }
                    ]
                }
            },
            addDependencies: (): void => {
                return;
            },
            dependsOn: [FetcherManifest],
            getFilesPatterns: () => ({ patterns: [] })
        };

        this.CustomPager = {
            _create: this.withExportedName(
                createFunctionName,
                (createFunction) =>
                    ({
                        itemType,
                        responseType,
                        sendRequest,
                        initialHttpRequest,
                        clientOptions,
                        requestOptions
                    }: {
                        itemType: ts.TypeNode;
                        responseType: ts.TypeNode;
                        sendRequest: ts.Expression;
                        initialHttpRequest: ts.Expression;
                        clientOptions: ts.Expression;
                        requestOptions: ts.Expression;
                    }): ts.Expression => {
                        return ts.factory.createCallExpression(
                            createFunction.getExpression(),
                            [itemType, responseType],
                            [
                                ts.factory.createObjectLiteralExpression(
                                    [
                                        ts.factory.createPropertyAssignment("sendRequest", sendRequest),
                                        ts.factory.createPropertyAssignment("initialHttpRequest", initialHttpRequest),
                                        ts.factory.createPropertyAssignment("clientOptions", clientOptions),
                                        ts.factory.createPropertyAssignment("requestOptions", requestOptions)
                                    ],
                                    false
                                )
                            ]
                        );
                    }
            ),
            _getReferenceToType: this.withExportedName(
                customPagerName,
                (CustomPager) => (itemType: ts.TypeNode, responseType: ts.TypeNode) =>
                    ts.factory.createTypeReferenceNode(CustomPager.getEntityName(), [itemType, responseType])
            )
        };
    }
}
