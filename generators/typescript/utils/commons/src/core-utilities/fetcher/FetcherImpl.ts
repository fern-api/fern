import { ts } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { DependencyManager, DependencyType } from "../../dependency-manager/DependencyManager";
import { CoreUtility } from "../CoreUtility";
import { Fetcher } from "./Fetcher";

export class FetcherImpl extends CoreUtility implements Fetcher {
    public readonly MANIFEST = {
        name: "fetcher",
        repoInfoForTesting: {
            path: RelativeFilePath.of("generators/typescript/utils/core-utilities/fetcher/src/fetcher")
        },
        unitTests: {
            fromDirectory: RelativeFilePath.of("__test__"),
            findAndReplace: {
                "../createRequestUrl": "../../../src/core/fetcher/createRequestUrl",
                "../Fetcher": "../../../src/core/fetcher/Fetcher",
                "../../runtime": "../../../src/core/runtime",
                "../getFetchFn": "../../../src/core/fetcher/getFetchFn",
                "../getRequestBody": "../../../src/core/fetcher/getRequestBody",
                "../getResponseBody": "../../../src/core/fetcher/getResponseBody",
                "../makeRequest": "../../../src/core/fetcher/makeRequest",
                "../requestWithRetries": "../../../src/core/fetcher/requestWithRetries",
                "../signals": "../../../src/core/fetcher/signals",
                "../../stream-wrappers/Node18UniversalStreamWrapper":
                    "../../../../src/core/fetcher/stream-wrappers/Node18UniversalStreamWrapper",
                "../../stream-wrappers/NodePre18StreamWrapper":
                    "../../../../src/core/fetcher/stream-wrappers/NodePre18StreamWrapper",
                "../../stream-wrappers/UndiciStreamWrapper":
                    "../../../../src/core/fetcher/stream-wrappers/UndiciStreamWrapper",
                "../../stream-wrappers/chooseStreamWrapper":
                    "../../../../src/core/fetcher/stream-wrappers/chooseStreamWrapper",
                "../stream-wrappers/chooseStreamWrapper":
                    "../../../src/core/fetcher/stream-wrappers/chooseStreamWrapper"
            }
        },
        originalPathOnDocker: AbsoluteFilePath.of("/assets/fetcher/fetcher"),
        pathInCoreUtilities: [{ nameOnDisk: "fetcher", exportDeclaration: { exportAll: true } }],
        addDependencies: (dependencyManager: DependencyManager): void => {
            dependencyManager.addDependency("form-data", "^4.0.0");
            dependencyManager.addDependency("formdata-node", "^6.0.3");
            dependencyManager.addDependency("node-fetch", "^2.7.0");
            dependencyManager.addDependency("qs", "^6.13.1");
            dependencyManager.addDependency("readable-stream", "^4.5.2");
            dependencyManager.addDependency("@types/qs", "^6.9.17", {
                type: DependencyType.DEV
            });
            dependencyManager.addDependency("@types/node-fetch", "^2.6.12", {
                type: DependencyType.DEV
            });
            dependencyManager.addDependency("@types/readable-stream", "^4.0.18", {
                type: DependencyType.DEV
            });
            dependencyManager.addDependency("webpack", "^5.97.1", {
                type: DependencyType.DEV
            });
            dependencyManager.addDependency("ts-loader", "^9.5.1", {
                type: DependencyType.DEV
            });
        }
    };
    public readonly Fetcher: Fetcher["Fetcher"] = {
        Args: {
            properties: {
                url: "url",
                method: "method",
                headers: "headers",
                contentType: "contentType",
                queryParameters: "queryParameters",
                maxRetries: "maxRetries",
                body: "body",
                timeoutMs: "timeoutMs",
                withCredentials: "withCredentials",
                requestType: "requestType",
                responseType: "responseType",
                abortSignal: "abortSignal",
                duplex: "duplex"
            },
            _getReferenceToType: this.getReferenceToTypeInFetcherModule("Args")
        },
        Error: {
            _getReferenceToType: this.getReferenceToTypeInFetcherModule("Error"),
            reason: "reason"
        },
        FailedStatusCodeError: {
            _getReferenceToType: this.getReferenceToTypeInFetcherModule("FailedStatusCodeError"),
            _reasonLiteralValue: "status-code",
            statusCode: "statusCode",
            body: "body"
        },
        NonJsonError: {
            _getReferenceToType: this.getReferenceToTypeInFetcherModule("NonJsonError"),
            _reasonLiteralValue: "non-json",
            statusCode: "statusCode",
            rawBody: "rawBody"
        },
        TimeoutSdkError: {
            _getReferenceToType: this.getReferenceToTypeInFetcherModule("TimeoutSdkError"),
            _reasonLiteralValue: "timeout"
        },
        UnknownError: {
            _getReferenceToType: this.getReferenceToTypeInFetcherModule("UnknownError"),
            _reasonLiteralValue: "unknown",
            message: "errorMessage"
        }
    };

    public readonly fetcher = {
        _getReferenceTo: this.withExportedName("fetcher", (fetcher) => () => fetcher.getExpression()),
        _invoke: (
            args: Fetcher.Args,
            { referenceToFetcher, cast }: { referenceToFetcher: ts.Expression; cast: ts.TypeNode | undefined }
        ): ts.Expression => {
            const properties: ts.PropertyAssignment[] = [
                ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.url, args.url),
                ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.method, args.method)
            ];
            if (args.headers.length > 0) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.Fetcher.Args.properties.headers,
                        ts.factory.createObjectLiteralExpression(args.headers, true)
                    )
                );
            }
            if (args.contentType != null) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.Fetcher.Args.properties.contentType,
                        typeof args.contentType === "string"
                            ? ts.factory.createStringLiteral(args.contentType)
                            : args.contentType
                    )
                );
            }
            if (args.queryParameters != null) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.Fetcher.Args.properties.queryParameters,
                        args.queryParameters
                    )
                );
            }
            if (args.requestType != null && args.responseType !== "json") {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.Fetcher.Args.properties.requestType,
                        ts.factory.createStringLiteral(args.requestType)
                    )
                );
            }
            if (args.duplex != null) {
                properties.push(ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.duplex, args.duplex));
            }
            if (args.body != null) {
                properties.push(ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.body, args.body));
            }
            if (args.responseType != null && args.responseType !== "json") {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.Fetcher.Args.properties.responseType,
                        ts.factory.createStringLiteral(args.responseType)
                    )
                );
            }
            properties.push(
                ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.timeoutMs, args.timeoutInSeconds)
            );
            if (args.maxRetries != null) {
                properties.push(
                    ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.maxRetries, args.maxRetries)
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
            if (args.abortSignal) {
                properties.push(
                    ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.abortSignal, args.abortSignal)
                );
            }

            return ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(referenceToFetcher, cast != null ? [cast] : [], [
                    ts.factory.createObjectLiteralExpression(properties, true)
                ])
            );
        }
    };

    public readonly RUNTIME = {
        type: {
            _getReferenceTo: this.withExportedName(
                "RUNTIME",
                (RUNTIME) => () => ts.factory.createPropertyAccessExpression(RUNTIME.getExpression(), "type")
            )
        },
        version: {
            _getReferenceTo: this.withExportedName(
                "RUNTIME",
                (RUNTIME) => () => ts.factory.createPropertyAccessExpression(RUNTIME.getExpression(), "version")
            )
        }
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
                        ts.factory.createPropertyAssignment(this.APIResponse.SuccessfulResponse.body, body)
                    ],
                    true
                ),
            body: "body",
            headers: "headers"
        },

        FailedResponse: {
            _build: (error: ts.Expression): ts.ObjectLiteralExpression =>
                ts.factory.createObjectLiteralExpression(
                    [
                        ts.factory.createPropertyAssignment(this.APIResponse.ok, ts.factory.createFalse()),
                        ts.factory.createPropertyAssignment(this.APIResponse.FailedResponse.error, error)
                    ],
                    true
                ),
            error: "error"
        }
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
        })
    };

    public FetchFunction = {
        _getReferenceToType: this.withExportedName(
            "FetchFunction",
            (FetchFunction) => () => FetchFunction.getTypeNode()
        )
    };

    public getHeader = {
        _invoke: this.withExportedName(
            "getHeader",
            (getHeader) =>
                ({
                    referenceToResponseHeaders,
                    header
                }: {
                    referenceToResponseHeaders: ts.Expression;
                    header: string;
                }) =>
                    ts.factory.createCallExpression(getHeader.getExpression(), undefined, [
                        referenceToResponseHeaders,
                        ts.factory.createStringLiteral(header)
                    ])
        )
    };

    private getReferenceToTypeInFetcherModule(typeName: string) {
        return this.withExportedName(
            "Fetcher",
            (Fetcher) => () =>
                ts.factory.createTypeReferenceNode(ts.factory.createQualifiedName(Fetcher.getEntityName(), typeName))
        );
    }
}
