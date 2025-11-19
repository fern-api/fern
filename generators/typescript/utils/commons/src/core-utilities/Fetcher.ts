import { ts } from "ts-morph";

import { DependencyManager, DependencyType } from "../dependency-manager/DependencyManager";
import { CoreUtility } from "./CoreUtility";
import { MANIFEST as LoggingManifest } from "./Logging";
import { MANIFEST as RuntimeManifest } from "./Runtime";
import { MANIFEST as UrlManifest } from "./UrlUtils";

export interface Fetcher {
    readonly Fetcher: {
        Args: {
            _getReferenceToType: () => ts.TypeNode;
            properties: {
                url: "url";
                method: "method";
                headers: "headers";
                contentType: "contentType";
                queryParameters: "queryParameters";
                body: "body";
                abortSignal: "abortSignal";
                withCredentials: "withCredentials";
                timeoutInSeconds: "timeoutInSeconds";
                maxRetries: "maxRetries";
                requestType: "requestType";
                responseType: "responseType";
                duplex: "duplex";
                timeoutMs: "timeoutMs";
                endpointMetadata: "endpointMetadata";
                fetchFn: "fetchFn";
                logging: "logging";
            };
        };
        Error: {
            _getReferenceToType: () => ts.TypeNode;
            reason: "reason";
        };
        FailedStatusCodeError: {
            _getReferenceToType: () => ts.TypeNode;
            _reasonLiteralValue: "status-code";
            statusCode: "statusCode";
            body: "body";
        };
        NonJsonError: {
            _getReferenceToType: () => ts.TypeNode;
            _reasonLiteralValue: "non-json";
            statusCode: "statusCode";
            rawBody: "rawBody";
        };
        TimeoutSdkError: {
            _getReferenceToType: () => ts.TypeNode;
            _reasonLiteralValue: "timeout";
        };
        UnknownError: {
            _getReferenceToType: () => ts.TypeNode;
            _reasonLiteralValue: "unknown";
            message: "errorMessage";
        };
    };

    readonly fetcher: {
        _getReferenceTo: () => ts.Expression;
        _invoke: (
            args: Fetcher.Args,
            { referenceToFetcher, cast }: { referenceToFetcher: ts.Expression; cast: ts.TypeNode | undefined }
        ) => ts.Expression;
    };

    readonly APIResponse: {
        _getReferenceToType: (successType: ts.TypeNode, failureType: ts.TypeNode) => ts.TypeNode;

        ok: string;

        SuccessfulResponse: {
            _build: (
                body: ts.Expression,
                headers?: ts.Expression,
                rawResponse?: ts.Expression
            ) => ts.ObjectLiteralExpression;
            body: string;
            headers: string;
            rawResponse: string;
        };

        FailedResponse: {
            _build: (error: ts.Expression, rawResponse: ts.Expression) => ts.ObjectLiteralExpression;
            error: string;
            rawResponse: string;
        };
    };

    readonly BinaryResponse: {
        _getReferenceToType: () => ts.TypeNode;
        getBinaryResponse: (response: ts.Expression) => ts.Expression;
    };

    readonly Supplier: {
        _getReferenceToType: (suppliedType: ts.TypeNode) => ts.TypeNode;
        get: (supplier: ts.Expression) => ts.Expression;
    };

    readonly EndpointSupplier: {
        _getReferenceToType: (suppliedType: ts.TypeNode) => ts.TypeNode;
        get: (supplier: ts.Expression, metadata: ts.Expression) => ts.Expression;
    };

    readonly SupplierOrEndpointSupplier: {
        _getReferenceToType: (suppliedType: ts.TypeNode) => ts.TypeNode;
        get: (supplier: ts.Expression, metadata: ts.Expression) => ts.Expression;
    };

    readonly EndpointMetadata: {
        _getReferenceToType: () => ts.TypeNode;
    };

    readonly getHeader: {
        _invoke: (args: { referenceToResponseHeaders: ts.Expression; header: string }) => ts.Expression;
    };

    readonly FetchFunction: {
        _getReferenceToType: () => ts.TypeNode;
    };

    readonly RawResponse: {
        readonly RawResponse: {
            _getReferenceToType: () => ts.TypeNode;
        };
        readonly toRawResponse: {
            _getReferenceToType: () => ts.TypeNode;
        };
        readonly WithRawResponse: {
            _getReferenceToType: (typeArg?: ts.TypeNode) => ts.TypeNode;
        };
    };

    readonly HttpResponsePromise: {
        _getReferenceToType: (typeArg?: ts.TypeNode) => ts.TypeNode;
        fromPromise: (promise: ts.Expression) => ts.Expression;
        interceptFunction: (fn: ts.Expression) => ts.Expression;
    };
}

export declare namespace Fetcher {
    export interface Args {
        url: ts.Expression;
        method: ts.Expression;
        headers: ts.Expression;
        contentType?: string | ts.Expression;
        queryParameters: ts.Expression | undefined;
        body: ts.Expression | undefined;
        abortSignal: ts.Expression | undefined;
        withCredentials: boolean;
        timeoutInSeconds: ts.Expression;
        maxRetries?: ts.Expression;
        requestType?: "json" | "file" | "bytes" | "form" | "other";
        responseType?: "json" | "blob" | "sse" | "streaming" | "text" | "binary-response";
        duplex?: ts.Expression;
        endpointMetadata?: ts.Expression;
        fetchFn?: ts.Expression;
        logging?: ts.Expression;
    }
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "fetcher",
    pathInCoreUtilities: { nameOnDisk: "fetcher", exportDeclaration: { exportAll: true } },
    addDependencies: (dependencyManager: DependencyManager, { formDataSupport, streamType, fetchSupport }): void => {
        if (formDataSupport === "Node16") {
            dependencyManager.addDependency("form-data", "^4.0.4");
            dependencyManager.addDependency("formdata-node", "^6.0.3");
        }

        if (fetchSupport === "node-fetch") {
            dependencyManager.addDependency("node-fetch", "^2.7.0");
            dependencyManager.addDependency("@types/node-fetch", "^2.6.12", {
                type: DependencyType.DEV
            });
        }

        if (streamType === "wrapper") {
            dependencyManager.addDependency("readable-stream", "^4.5.2");
        }

        if (streamType === "wrapper") {
            dependencyManager.addDependency("@types/readable-stream", "^4.0.18", {
                type: DependencyType.DEV
            });
        }
        dependencyManager.addDependency("webpack", "^5.97.1", {
            type: DependencyType.DEV
        });
        dependencyManager.addDependency("ts-loader", "^9.5.1", {
            type: DependencyType.DEV
        });
    },
    dependsOn: [LoggingManifest, RuntimeManifest, UrlManifest],
    getFilesPatterns: (options) => {
        const ignore: string[] = [];
        if (options.streamType !== "wrapper") {
            ignore.push("src/core/fetcher/stream-wrappers/**", "tests/unit/fetcher/stream-wrappers/**");
        }
        if (options.fetchSupport === "native") {
            ignore.push("tests/unit/fetcher/getFetchFn.test.ts");
        }
        return {
            patterns: ["src/core/fetcher/**", "tests/unit/fetcher/**", "tests/setup.template.ts"],
            ignore
        };
    }
};

export class FetcherImpl extends CoreUtility implements Fetcher {
    public readonly MANIFEST = MANIFEST;
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
                duplex: "duplex",
                timeoutInSeconds: "timeoutInSeconds",
                endpointMetadata: "endpointMetadata",
                fetchFn: "fetchFn",
                logging: "logging"
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
                ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.method, args.method),
                ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.headers, args.headers)
            ];
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
            if (args.endpointMetadata != null) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.Fetcher.Args.properties.endpointMetadata,
                        args.endpointMetadata
                    )
                );
            }
            if (args.fetchFn != null) {
                properties.push(
                    ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.fetchFn, args.fetchFn)
                );
            }
            if (args.logging != null) {
                properties.push(
                    ts.factory.createPropertyAssignment(this.Fetcher.Args.properties.logging, args.logging)
                );
            }

            return ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(referenceToFetcher, cast != null ? [cast] : [], [
                    ts.factory.createObjectLiteralExpression(properties, true)
                ])
            );
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
            _build: (
                body: ts.Expression,
                headers?: ts.Expression,
                rawResponse?: ts.Expression
            ): ts.ObjectLiteralExpression =>
                ts.factory.createObjectLiteralExpression(
                    [
                        ts.factory.createPropertyAssignment(this.APIResponse.ok, ts.factory.createTrue()),
                        ts.factory.createPropertyAssignment(this.APIResponse.SuccessfulResponse.body, body),
                        ...(headers
                            ? [
                                  ts.factory.createPropertyAssignment(
                                      this.APIResponse.SuccessfulResponse.headers,
                                      headers
                                  )
                              ]
                            : []),
                        ...(rawResponse
                            ? [
                                  ts.factory.createPropertyAssignment(
                                      this.APIResponse.SuccessfulResponse.rawResponse,
                                      rawResponse
                                  )
                              ]
                            : [])
                    ],
                    true
                ),
            body: "body",
            headers: "headers",
            rawResponse: "rawResponse"
        },

        FailedResponse: {
            _build: (error: ts.Expression, rawResponse: ts.Expression): ts.ObjectLiteralExpression =>
                ts.factory.createObjectLiteralExpression(
                    [
                        ts.factory.createPropertyAssignment(this.APIResponse.ok, ts.factory.createFalse()),
                        ts.factory.createPropertyAssignment(this.APIResponse.FailedResponse.error, error),
                        ts.factory.createPropertyAssignment(this.APIResponse.FailedResponse.rawResponse, rawResponse)
                    ],
                    true
                ),
            error: "error",
            rawResponse: "rawResponse"
        }
    };

    public readonly BinaryResponse = {
        _getReferenceToType: this.withExportedName(
            "BinaryResponse",
            (BinaryResponse) => () => BinaryResponse.getTypeNode()
        ),
        getBinaryResponse: this.withExportedName(
            "getBinaryResponse",
            (getBinaryResponse) => (response: ts.Expression) =>
                ts.factory.createCallExpression(getBinaryResponse.getExpression(), undefined, [response])
        )
    };

    public SupplierOrEndpointSupplier = {
        _getReferenceToType: (suppliedType: ts.TypeNode): ts.TypeNode => {
            if (this.generateEndpointMetadata) {
                return this.EndpointSupplier._getReferenceToType(suppliedType);
            }
            return this.Supplier._getReferenceToType(suppliedType);
        },
        get: (supplier: ts.Expression, metadata: ts.Expression): ts.Expression => {
            if (this.generateEndpointMetadata) {
                return this.EndpointSupplier.get(supplier, metadata);
            }
            return this.Supplier.get(supplier);
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

    public EndpointSupplier = {
        _getReferenceToType: this.withExportedName(
            "EndpointSupplier",
            (EndpointSupplier) => (suppliedType: ts.TypeNode) => {
                return ts.factory.createTypeReferenceNode(EndpointSupplier.getEntityName(), [suppliedType]);
            }
        ),

        get: this.withExportedName(
            "EndpointSupplier",
            (EndpointSupplier) => (endpointSupplier: ts.Expression, metadata: ts.Expression) => {
                return ts.factory.createAwaitExpression(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(EndpointSupplier.getExpression(), "get"),
                        undefined,
                        [endpointSupplier, metadata]
                    )
                );
            }
        )
    };

    public EndpointMetadata = {
        _getReferenceToType: this.withExportedName(
            "EndpointMetadata",
            (EndpointMetadata) => () => EndpointMetadata.getTypeNode()
        )
    };

    public Websocket = {
        _getReferenceToType: this.withExportedName("Websocket", (Websocket) => (suppliedType: ts.TypeNode) => {
            return ts.factory.createTypeReferenceNode(Websocket.getEntityName(), [suppliedType]);
        }),

        get: this.withExportedName("Websocket", (Websocket) => (websocket: ts.Expression) => {
            return ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(Websocket.getExpression(), "get"),
                    undefined,
                    [websocket]
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

    public readonly RawResponse = {
        RawResponse: {
            _getReferenceToType: this.withExportedName("RawResponse", (RawResponse) => () => RawResponse.getTypeNode())
        },
        toRawResponse: {
            _getReferenceToType: this.withExportedName(
                "toRawResponse",
                (RawResponse) => () => RawResponse.getTypeNode()
            )
        },
        WithRawResponse: {
            _getReferenceToType: (typeArg?: ts.TypeNode): ts.TypeNode => {
                return this.withExportedName(
                    "WithRawResponse",
                    (RawResponse) => () =>
                        ts.factory.createTypeReferenceNode(RawResponse.getEntityName(), typeArg ? [typeArg] : undefined)
                )();
            }
        }
    };
    public readonly HttpResponsePromise = {
        _getReferenceToType: (typeArg?: ts.TypeNode): ts.TypeNode => {
            return this.withExportedName(
                "HttpResponsePromise",
                (HttpResponsePromise) => () =>
                    ts.factory.createTypeReferenceNode(
                        HttpResponsePromise.getEntityName(),
                        typeArg ? [typeArg] : undefined
                    )
            )();
        },
        fromPromise: (promise: ts.Expression): ts.Expression => {
            return this.withExportedName(
                "HttpResponsePromise",
                (HttpResponsePromise) => () =>
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            HttpResponsePromise.getExpression(),
                            ts.factory.createIdentifier("fromPromise")
                        ),
                        undefined,
                        [promise]
                    )
            )();
        },
        interceptFunction: (fn: ts.Expression): ts.Expression => {
            return this.withExportedName(
                "HttpResponsePromise",
                (HttpResponsePromise) => () =>
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            HttpResponsePromise.getExpression(),
                            ts.factory.createIdentifier("interceptFunction")
                        ),
                        undefined,
                        [fn]
                    )
            )();
        }
    };
}
