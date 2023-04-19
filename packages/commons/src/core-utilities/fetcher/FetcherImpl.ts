import { RelativeFilePath } from "@fern-api/fs-utils";
import { ts } from "ts-morph";
import { DependencyManager } from "../../dependency-manager/DependencyManager";
import { CoreUtility } from "../CoreUtility";
import { Fetcher } from "./Fetcher";

export class FetcherImpl extends CoreUtility implements Fetcher {
    public readonly MANIFEST = {
        name: "fetcher",
        repoInfoForTesting: {
            path: RelativeFilePath.of("packages/core-utilities/fetcher/src"),
        },
        originalPathOnDocker: "/assets/fetcher" as const,
        pathInCoreUtilities: [{ nameOnDisk: "fetcher", exportDeclaration: { exportAll: true } }],
        addDependencies: (dependencyManager: DependencyManager): void => {
            dependencyManager.addDependency("axios", "0.27.2");
            dependencyManager.addDependency("@ungap/url-search-params", "0.2.2");
        },
    };

    public readonly Fetcher: Fetcher["Fetcher"] = {
        Args: {
            properties: {
                url: "url",
                method: "method",
                headers: "headers",
                contentType: "contentType",
                queryParameters: "queryParameters",
                body: "body",
                timeoutMs: "timeoutMs",
                withCredentials: "withCredentials",
                adapter: "adapter",
            },
            _getReferenceToType: this.getReferenceToTypeInFetcherModule("Args"),
        },
        Error: {
            _getReferenceToType: this.getReferenceToTypeInFetcherModule("Error"),
            reason: "reason",
        },
        FailedStatusCodeError: {
            _getReferenceToType: this.getReferenceToTypeInFetcherModule("FailedStatusCodeError"),
            _reasonLiteralValue: "status-code",
            statusCode: "statusCode",
            body: "body",
        },
        NonJsonError: {
            _getReferenceToType: this.getReferenceToTypeInFetcherModule("NonJsonError"),
            _reasonLiteralValue: "non-json",
            statusCode: "statusCode",
            rawBody: "rawBody",
        },
        TimeoutSdkError: {
            _getReferenceToType: this.getReferenceToTypeInFetcherModule("TimeoutSdkError"),
            _reasonLiteralValue: "timeout",
        },
        UnknownError: {
            _getReferenceToType: this.getReferenceToTypeInFetcherModule("UnknownError"),
            _reasonLiteralValue: "unknown",
            message: "errorMessage",
        },
    };

    public readonly fetcher = {
        _getReferenceTo: this.withExportedName("fetcher", (fetcher) => () => fetcher.getExpression()),
        _invoke: (args: Fetcher.Args, { referenceToFetcher }: { referenceToFetcher: ts.Expression }): ts.Expression => {
            const properties: ts.PropertyAssignment[] = [
                ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.url, args.url),
                ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.method, args.method),
            ];
            if (args.headers.length > 0) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.Fetcher.Args.properties.headers,
                        ts.factory.createObjectLiteralExpression(args.headers, true)
                    )
                );
            }
            properties.push(
                ts.factory.createPropertyAssignment(
                    this.Fetcher.Args.properties.contentType,
                    typeof args.contentType === "string"
                        ? ts.factory.createStringLiteral(args.contentType)
                        : args.contentType
                )
            );
            if (args.queryParameters != null) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.Fetcher.Args.properties.queryParameters,
                        args.queryParameters
                    )
                );
            }
            if (args.body != null) {
                properties.push(ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.body, args.body));
            }
            if (args.timeoutMs != null) {
                properties.push(
                    ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.timeoutMs, args.timeoutMs)
                );
            }
            if (args.withCredentials) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.Fetcher.Args.properties.withCredentials,
                        ts.factory.createTrue()
                    )
                );
            }

            return ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(referenceToFetcher, undefined, [
                    ts.factory.createObjectLiteralExpression(properties, true),
                ])
            );
        },
    };

    public readonly APIResponse = {
        _getReferenceToType: this.withExportedName(
            "APIResponse",
            (APIResponse) => (successResponse: ts.TypeNode, failureResponse: ts.TypeNode) =>
                ts.factory.createTypeReferenceNode(APIResponse.getEntityName(), [successResponse, failureResponse])
        ),

        ok: "ok",

        SuccessfulResponse: {
            _build: (body: ts.Expression): ts.ObjectLiteralExpression =>
                ts.factory.createObjectLiteralExpression(
                    [
                        ts.factory.createPropertyAssignment(this.APIResponse.ok, ts.factory.createTrue()),
                        ts.factory.createPropertyAssignment(this.APIResponse.SuccessfulResponse.body, body),
                    ],
                    true
                ),
            body: "body",
        },

        FailedResponse: {
            _build: (error: ts.Expression): ts.ObjectLiteralExpression =>
                ts.factory.createObjectLiteralExpression(
                    [
                        ts.factory.createPropertyAssignment(this.APIResponse.ok, ts.factory.createFalse()),
                        ts.factory.createPropertyAssignment(this.APIResponse.FailedResponse.error, error),
                    ],
                    true
                ),
            error: "error",
        },
    };

    public Supplier = {
        _getReferenceToType: this.withExportedName("Supplier", (Supplier) => (suppliedType: ts.TypeNode) => {
            return ts.factory.createTypeReferenceNode(Supplier.getEntityName(), [suppliedType]);
        }),

        get: this.withExportedName("Supplier", (Supplier) => (supplier: ts.Expression) => {
            return ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(Supplier.getExpression(), "get"),
                    undefined,
                    [supplier]
                )
            );
        }),
    };

    public FetchFunction = {
        _getReferenceToType: this.withExportedName(
            "FetchFunction",
            (FetchFunction) => () => FetchFunction.getTypeNode()
        ),
    };

    private getReferenceToTypeInFetcherModule(typeName: string) {
        return this.withExportedName(
            "Fetcher",
            (Fetcher) => () =>
                ts.factory.createTypeReferenceNode(ts.factory.createQualifiedName(Fetcher.getEntityName(), typeName))
        );
    }
}
