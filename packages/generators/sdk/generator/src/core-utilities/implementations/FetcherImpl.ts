import { RelativeFilePath } from "@fern-api/fs-utils";
import { Fetcher } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { DependencyManager } from "../../dependency-manager/DependencyManager";
import { CoreUtility } from "../CoreUtility";

export class FetcherImpl extends CoreUtility implements Fetcher {
    public readonly MANIFEST = {
        name: "fetcher",
        repoInfoForTesting: {
            path: RelativeFilePath.of("packages/core-utilities/fetcher/src"),
        },
        originalPathOnDocker: "/assets/fetcher" as const,
        pathInCoreUtilities: [{ nameOnDisk: "fetcher", exportDeclaration: { exportAll: true } }],
        addDependencies: (dependencyManager: DependencyManager): void => {
            dependencyManager.addDependency("axios", "^0.27.2");
        },
    };

    public readonly Fetcher = {
        Args: {
            url: "url",
            method: "method",
            headers: "headers",
            authHeader: "authHeader",
            queryParameters: "queryParameters",
            body: "body",
            timeoutMs: "timeoutMs",
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
            rawBody: "body",
        },
        TimeoutError: {
            _getReferenceToType: this.getReferenceToTypeInFetcherModule("TimeoutError"),
            _reasonLiteralValue: "timeout",
        },
        UnknownError: {
            _getReferenceToType: this.getReferenceToTypeInFetcherModule("UnknownError"),
            _reasonLiteralValue: "unknown",
            message: "message",
        },
        _invoke: this.withExportedName("fetcher", (fetcher) => (args: Fetcher.Args) => {
            const properties: ts.PropertyAssignment[] = [
                ts.factory.createPropertyAssignment(this.Fetcher.Args.url, args.url),
                ts.factory.createPropertyAssignment(this.Fetcher.Args.method, args.method),
            ];
            if (args.headers.length > 0) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.Fetcher.Args.headers,
                        ts.factory.createObjectLiteralExpression(args.headers, true)
                    )
                );
            }
            if (args.queryParameters != null) {
                properties.push(
                    ts.factory.createPropertyAssignment(this.Fetcher.Args.queryParameters, args.queryParameters)
                );
            }
            if (args.body != null) {
                properties.push(ts.factory.createPropertyAssignment(this.Fetcher.Args.body, args.body));
            }
            if (args.timeoutMs != null) {
                properties.push(ts.factory.createPropertyAssignment(this.Fetcher.Args.timeoutMs, args.timeoutMs));
            }

            return ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(fetcher.getExpression(), undefined, [
                    ts.factory.createObjectLiteralExpression(properties, true),
                ])
            );
        }),
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

    private getReferenceToTypeInFetcherModule(typeName: string) {
        return this.withExportedName(
            "Fetcher",
            (Fetcher) => () =>
                ts.factory.createTypeReferenceNode(ts.factory.createQualifiedName(Fetcher.getEntityName(), typeName))
        );
    }
}
