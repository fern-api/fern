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
                        clientOptions
                    }: {
                        itemType: ts.TypeNode;
                        responseType: ts.TypeNode;
                        sendRequest: ts.Expression;
                        initialHttpRequest: ts.Expression;
                        clientOptions: ts.Expression;
                    }): ts.Expression => {
                        return ts.factory.createCallExpression(
                            createFunction.getExpression(),
                            [itemType, responseType],
                            [sendRequest, initialHttpRequest, clientOptions]
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
