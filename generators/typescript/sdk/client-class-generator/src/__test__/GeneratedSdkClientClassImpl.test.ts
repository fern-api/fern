import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";
import {
    caseConverter,
    casingsGenerator,
    createHttpEndpoint,
    createMinimalIR,
    createNameAndWireValue
} from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { assert, describe, expect, it } from "vitest";

import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl.js";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function serializeExpression(expr: ts.Expression): string {
    return getTextOfTsNode(expr);
}

/**
 * Creates a minimal IR with optional service, auth, headers, and subpackages.
 */
function createIR(opts?: {
    service?: FernIr.HttpService;
    authSchemes?: FernIr.AuthScheme[];
    authRequirement?: FernIr.AuthSchemesRequirement;
    headers?: FernIr.HttpHeader[];
    variables?: FernIr.VariableDeclaration[];
    subpackages?: Record<string, FernIr.Subpackage>;
    rootPackage?: Partial<FernIr.Package>;
    errors?: Record<string, FernIr.ErrorDeclaration>;
}): FernIr.IntermediateRepresentation {
    const ir = createMinimalIR();

    if (opts?.authSchemes || opts?.authRequirement) {
        ir.auth = {
            docs: undefined,
            requirement: opts?.authRequirement ?? "ALL",
            schemes: opts?.authSchemes ?? []
        };
    }
    if (opts?.headers) {
        ir.headers = opts.headers;
    }
    if (opts?.variables) {
        ir.variables = opts.variables;
    }
    if (opts?.subpackages) {
        ir.subpackages = opts.subpackages;
    }
    if (opts?.errors) {
        ir.errors = opts.errors;
    }

    // Set up root package with optional service
    const serviceId = "service_test";
    if (opts?.service) {
        ir.services = { [serviceId]: opts.service };
        ir.rootPackage = {
            ...ir.rootPackage,
            service: serviceId,
            ...opts?.rootPackage
        };
    }
    if (opts?.rootPackage) {
        ir.rootPackage = {
            ...ir.rootPackage,
            ...opts.rootPackage
        };
    }

    return ir;
}

/**
 * Creates a mock ImportsManager.
 */
// biome-ignore lint/suspicious/noExplicitAny: test mock
function createMockImportsManager(): any {
    return {
        addImport: () => undefined,
        addImportFromRoot: () => undefined
    };
}

/**
 * Creates a mock ExportsManager.
 */
// biome-ignore lint/suspicious/noExplicitAny: test mock
function createMockExportsManager(): any {
    return {
        addExport: () => undefined,
        addExportsForFilepath: () => undefined
    };
}

/**
 * Creates a GeneratedSdkClientClassImpl with configurable options.
 */
function createClientClass(opts?: {
    ir?: FernIr.IntermediateRepresentation;
    isRoot?: boolean;
    serviceClassName?: string;
    neverThrowErrors?: boolean;
    includeCredentialsOnCrossOriginRequests?: boolean;
    allowCustomFetcher?: boolean;
    generateWebSocketClients?: boolean;
    requireDefaultEnvironment?: boolean;
    defaultTimeoutInSeconds?: number | "infinity" | undefined;
    includeContentHeadersOnFileDownloadResponse?: boolean;
    includeSerdeLayer?: boolean;
    retainOriginalCasing?: boolean;
    inlineFileProperties?: boolean;
    omitUndefined?: boolean;
    allowExtraFields?: boolean;
    streamType?: "wrapper" | "web";
    fileResponseType?: "stream" | "binary-response";
    formDataSupport?: "Node16" | "Node18";
    useDefaultRequestParameterValues?: boolean;
    generateEndpointMetadata?: boolean;
    parameterNaming?: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    offsetSemantics?: "item-index" | "page-index";
}): GeneratedSdkClientClassImpl {
    const ir = opts?.ir ?? createIR();
    return new GeneratedSdkClientClassImpl({
        caseConverter,
        isRoot: opts?.isRoot ?? true,
        importsManager: createMockImportsManager(),
        exportsManager: createMockExportsManager(),
        intermediateRepresentation: ir,
        packageId: { isRoot: true } as PackageId,
        serviceClassName: opts?.serviceClassName ?? "TestClient",
        errorResolver: new ErrorResolver(ir),
        packageResolver: new PackageResolver(ir),
        neverThrowErrors: opts?.neverThrowErrors ?? false,
        includeCredentialsOnCrossOriginRequests: opts?.includeCredentialsOnCrossOriginRequests ?? false,
        allowCustomFetcher: opts?.allowCustomFetcher ?? false,
        generateWebSocketClients: opts?.generateWebSocketClients ?? false,
        requireDefaultEnvironment: opts?.requireDefaultEnvironment ?? false,
        defaultTimeoutInSeconds: opts?.defaultTimeoutInSeconds,
        includeContentHeadersOnFileDownloadResponse: opts?.includeContentHeadersOnFileDownloadResponse ?? false,
        includeSerdeLayer: opts?.includeSerdeLayer ?? true,
        retainOriginalCasing: opts?.retainOriginalCasing ?? false,
        inlineFileProperties: opts?.inlineFileProperties ?? false,
        omitUndefined: opts?.omitUndefined ?? false,
        allowExtraFields: opts?.allowExtraFields ?? false,
        streamType: opts?.streamType ?? "wrapper",
        fileResponseType: opts?.fileResponseType ?? "stream",
        formDataSupport: opts?.formDataSupport ?? "Node16",
        useDefaultRequestParameterValues: opts?.useDefaultRequestParameterValues ?? false,
        generateEndpointMetadata: opts?.generateEndpointMetadata ?? false,
        parameterNaming: opts?.parameterNaming ?? "default",
        offsetSemantics: opts?.offsetSemantics ?? "item-index"
    });
}

/**
 * Creates a minimal mock FileContext.
 */
// biome-ignore lint/suspicious/noExplicitAny: test mock needs to satisfy complex FileContext interface
function createMockFileContext(opts?: { ir?: FernIr.IntermediateRepresentation }): any {
    return {
        ir: opts?.ir ?? createMinimalIR(),
        sourceFile: {
            addModule: () => undefined,
            addClass: () => undefined
        },
        importsManager: createMockImportsManager(),
        coreUtilities: {
            fetcher: {
                EndpointMetadata: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.EndpointMetadata")
                },
                fetcher: {
                    _getReferenceTo: () => ts.factory.createIdentifier("core.fetcher"),
                    _invoke: (
                        // biome-ignore lint/suspicious/noExplicitAny: test mock
                        _args: any,
                        // biome-ignore lint/suspicious/noExplicitAny: test mock
                        invokeOpts: any
                    ) =>
                        ts.factory.createAwaitExpression(
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    invokeOpts.referenceToFetcher,
                                    ts.factory.createIdentifier("fetch")
                                ),
                                undefined,
                                [ts.factory.createObjectLiteralExpression([], true)]
                            )
                        )
                },
                Supplier: {
                    get: (expr: ts.Expression) =>
                        ts.factory.createAwaitExpression(
                            ts.factory.createCallExpression(
                                ts.factory.createIdentifier("core.Supplier.get"),
                                undefined,
                                [expr]
                            )
                        )
                },
                HttpResponsePromise: {
                    fromPromise: (expr: ts.Expression) =>
                        ts.factory.createCallExpression(
                            ts.factory.createIdentifier("core.HttpResponsePromise.fromPromise"),
                            undefined,
                            [expr]
                        ),
                    _getReferenceToType: (typeArg: ts.TypeNode) =>
                        ts.factory.createTypeReferenceNode("core.HttpResponsePromise", [typeArg])
                },
                RawResponse: {
                    WithRawResponse: {
                        _getReferenceToType: (typeArg: ts.TypeNode) =>
                            ts.factory.createTypeReferenceNode("core.WithRawResponse", [typeArg])
                    }
                },
                BinaryResponse: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.BinaryResponse")
                }
            },
            urlUtils: {
                join: {
                    _invoke: (args: ts.Expression[]) =>
                        ts.factory.createCallExpression(ts.factory.createIdentifier("core.urlJoin"), undefined, args)
                }
            }
        },
        sdkClientClass: {
            getReferenceToClientClass: () => ({
                getExpression: () => ts.factory.createIdentifier("TestClient")
            }),
            getReferenceToBaseClientOptions: () => ({
                getTypeNode: () => ts.factory.createTypeReferenceNode("BaseClientOptions")
            }),
            getReferenceToBaseRequestOptions: () => ({
                getTypeNode: () => ts.factory.createTypeReferenceNode("BaseRequestOptions")
            }),
            getReferenceToBaseIdempotentRequestOptions: () => ({
                getTypeNode: () => ts.factory.createTypeReferenceNode("BaseIdempotentRequestOptions")
            })
        },
        environments: {
            getGeneratedEnvironments: () => ({
                getReferenceToDefaultEnvironment: () => undefined,
                getReferenceToEnvironmentUrl: ({
                    referenceToEnvironmentValue
                }: {
                    referenceToEnvironmentValue: ts.Expression;
                }) => referenceToEnvironmentValue
            }),
            getReferenceToFirstEnvironmentEnum: () => undefined
        },
        baseClient: {
            anyRequiredBaseClientOptions: () => false
        },
        versionContext: {
            getGeneratedVersion: () => undefined
        },
        externalDependencies: {
            stream: {
                Readable: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("Readable")
                }
            }
        },
        case: caseConverter
    };
}

// ========================== Tests ==========================

describe("GeneratedSdkClientClassImpl", () => {
    describe("constructor", () => {
        it("creates client class with no service and no auth", () => {
            const clientClass = createClientClass();
            expect(clientClass.hasAuthProvider()).toBe(false);
            expect(clientClass.hasAnyEndpointsWithAuth()).toBe(false);
            expect(clientClass.getAuthProviderInstance()).toBeUndefined();
        });

        it("creates client class with bearer auth", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        docs: undefined
                    })
                ],
                authRequirement: "ALL",
                service: {
                    availability: undefined,
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    displayName: undefined,
                    basePath: { head: "", parts: [] },
                    endpoints: [
                        {
                            ...createHttpEndpoint(),
                            auth: true
                        }
                    ],
                    headers: [],
                    pathParameters: [],
                    encoding: undefined,
                    transport: undefined,
                    audiences: undefined
                }
            });
            const clientClass = createClientClass({ ir });
            expect(clientClass.hasAuthProvider()).toBe(true);
            expect(clientClass.hasAnyEndpointsWithAuth()).toBe(true);
            expect(clientClass.getAuthProviderInstance()).toBeDefined();
        });

        it("creates client class with basic auth", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.basic({
                        key: "basic",
                        username: casingsGenerator.generateName("username"),
                        usernameEnvVar: undefined,
                        usernameOmit: undefined,
                        password: casingsGenerator.generateName("password"),
                        passwordEnvVar: undefined,
                        passwordOmit: undefined,
                        docs: undefined
                    })
                ],
                authRequirement: "ALL",
                service: {
                    availability: undefined,
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    displayName: undefined,
                    basePath: { head: "", parts: [] },
                    endpoints: [{ ...createHttpEndpoint(), auth: true }],
                    headers: [],
                    pathParameters: [],
                    encoding: undefined,
                    transport: undefined,
                    audiences: undefined
                }
            });
            const clientClass = createClientClass({ ir });
            expect(clientClass.hasAuthProvider()).toBe(true);
        });

        it("creates client class with ANY auth requirement", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        docs: undefined
                    }),
                    FernIr.AuthScheme.header({
                        key: "apiKey",
                        name: createNameAndWireValue("X-API-Key"),
                        prefix: undefined,
                        headerEnvVar: undefined,
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        docs: undefined
                    })
                ],
                authRequirement: "ANY",
                service: {
                    availability: undefined,
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    displayName: undefined,
                    basePath: { head: "", parts: [] },
                    endpoints: [{ ...createHttpEndpoint(), auth: true }],
                    headers: [],
                    pathParameters: [],
                    encoding: undefined,
                    transport: undefined,
                    audiences: undefined
                }
            });
            const clientClass = createClientClass({ ir });
            expect(clientClass.hasAuthProvider()).toBe(true);
        });
    });

    describe("getGenerateEndpointMetadata", () => {
        it("returns false by default", () => {
            const clientClass = createClientClass();
            expect(clientClass.getGenerateEndpointMetadata()).toBe(false);
        });

        it("returns true when configured", () => {
            const clientClass = createClientClass({ generateEndpointMetadata: true });
            expect(clientClass.getGenerateEndpointMetadata()).toBe(true);
        });
    });

    describe("accessFromRootClient", () => {
        it("returns root client reference when at root package", () => {
            const clientClass = createClientClass();
            const ref = clientClass.accessFromRootClient({
                referenceToRootClient: ts.factory.createIdentifier("client")
            });
            // Root package has empty fernFilepath.allParts, so no property access chain
            expect(serializeExpression(ref)).toBe("client");
        });
    });

    describe("instantiate", () => {
        it("creates new expression with options", () => {
            const clientClass = createClientClass();
            const expr = clientClass.instantiate({
                referenceToClient: ts.factory.createIdentifier("TestClient"),
                referenceToOptions: ts.factory.createIdentifier("options")
            });
            expect(serializeExpression(expr)).toBe("new TestClient(options)");
        });
    });

    describe("getReferenceToOptions", () => {
        it("returns this._options", () => {
            const clientClass = createClientClass();
            const ref = clientClass.getReferenceToOptions();
            expect(serializeExpression(ref)).toBe("this._options");
        });
    });

    describe("getReferenceToFetcher", () => {
        it("returns core.fetcher when custom fetcher not allowed", () => {
            const clientClass = createClientClass({ allowCustomFetcher: false });
            const context = createMockFileContext();
            const ref = clientClass.getReferenceToFetcher(context);
            expect(serializeExpression(ref)).toBe("core.fetcher");
        });

        it("returns options.fetcher ?? core.fetcher when custom fetcher allowed", () => {
            const clientClass = createClientClass({ allowCustomFetcher: true });
            const context = createMockFileContext();
            const ref = clientClass.getReferenceToFetcher(context);
            expect(serializeExpression(ref)).toMatchSnapshot();
        });
    });

    describe("getReferenceToFetch", () => {
        it("returns this._options?.fetch", () => {
            const clientClass = createClientClass();
            const ref = clientClass.getReferenceToFetch();
            expect(serializeExpression(ref)).toBe("this._options?.fetch");
        });
    });

    describe("getReferenceToAuthProvider", () => {
        it("returns undefined when no auth provider", () => {
            const clientClass = createClientClass();
            expect(clientClass.getReferenceToAuthProvider()).toBeUndefined();
        });

        it("returns this._options.authProvider when auth is configured", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        docs: undefined
                    })
                ],
                authRequirement: "ALL",
                service: {
                    availability: undefined,
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    displayName: undefined,
                    basePath: { head: "", parts: [] },
                    endpoints: [{ ...createHttpEndpoint(), auth: true }],
                    headers: [],
                    pathParameters: [],
                    encoding: undefined,
                    transport: undefined,
                    audiences: undefined
                }
            });
            const clientClass = createClientClass({ ir });
            const ref = clientClass.getReferenceToAuthProvider();
            assert(ref != null, "Expected auth provider reference to be defined");
            expect(serializeExpression(ref)).toBe("this._options.authProvider");
        });
    });

    describe("getReferenceToAuthProviderOrThrow", () => {
        it("throws when no auth provider", () => {
            const clientClass = createClientClass();
            expect(() => clientClass.getReferenceToAuthProviderOrThrow()).toThrow("Auth provider is not available");
        });

        it("returns reference when auth provider exists", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        docs: undefined
                    })
                ],
                authRequirement: "ALL",
                service: {
                    availability: undefined,
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    displayName: undefined,
                    basePath: { head: "", parts: [] },
                    endpoints: [{ ...createHttpEndpoint(), auth: true }],
                    headers: [],
                    pathParameters: [],
                    encoding: undefined,
                    transport: undefined,
                    audiences: undefined
                }
            });
            const clientClass = createClientClass({ ir });
            const ref = clientClass.getReferenceToAuthProviderOrThrow();
            expect(serializeExpression(ref)).toBe("this._options.authProvider");
        });
    });

    describe("hasAuthProvider", () => {
        it("returns false when no auth", () => {
            const clientClass = createClientClass();
            expect(clientClass.hasAuthProvider()).toBe(false);
        });

        it("returns true when auth is configured", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        docs: undefined
                    })
                ],
                authRequirement: "ALL",
                service: {
                    availability: undefined,
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    displayName: undefined,
                    basePath: { head: "", parts: [] },
                    endpoints: [{ ...createHttpEndpoint(), auth: true }],
                    headers: [],
                    pathParameters: [],
                    encoding: undefined,
                    transport: undefined,
                    audiences: undefined
                }
            });
            const clientClass = createClientClass({ ir });
            expect(clientClass.hasAuthProvider()).toBe(true);
        });
    });

    describe("getReferenceToRequestOptions", () => {
        it("returns non-idempotent type reference for non-idempotent endpoint", () => {
            const endpoint = createHttpEndpoint();
            endpoint.idempotent = false;
            const clientClass = createClientClass({ serviceClassName: "MyClient" });
            const ref = clientClass.getReferenceToRequestOptions(endpoint);
            expect(getTextOfTsNode(ref)).toBe("MyClient.RequestOptions");
        });

        it("returns idempotent type reference for idempotent endpoint", () => {
            const endpoint = createHttpEndpoint();
            endpoint.idempotent = true;
            const clientClass = createClientClass({ serviceClassName: "MyClient" });
            const ref = clientClass.getReferenceToRequestOptions(endpoint);
            expect(getTextOfTsNode(ref)).toBe("MyClient.IdempotentRequestOptions");
        });
    });

    describe("getRequestOptionsType", () => {
        it("returns non-idempotent type string", () => {
            const clientClass = createClientClass({ serviceClassName: "SdkClient" });
            expect(clientClass.getRequestOptionsType(false)).toBe("SdkClient.RequestOptions");
        });

        it("returns idempotent type string", () => {
            const clientClass = createClientClass({ serviceClassName: "SdkClient" });
            expect(clientClass.getRequestOptionsType(true)).toBe("SdkClient.IdempotentRequestOptions");
        });
    });

    describe("getReferenceToTimeoutInSeconds", () => {
        it("returns non-nullable property access", () => {
            const clientClass = createClientClass();
            const ref = clientClass.getReferenceToTimeoutInSeconds({
                referenceToRequestOptions: ts.factory.createIdentifier("requestOptions"),
                isNullable: false
            });
            expect(serializeExpression(ref)).toBe("requestOptions.timeoutInSeconds");
        });

        it("returns nullable property access with optional chaining", () => {
            const clientClass = createClientClass();
            const ref = clientClass.getReferenceToTimeoutInSeconds({
                referenceToRequestOptions: ts.factory.createIdentifier("requestOptions"),
                isNullable: true
            });
            expect(serializeExpression(ref)).toBe("requestOptions?.timeoutInSeconds");
        });
    });

    describe("getReferenceToMaxRetries", () => {
        it("returns non-nullable property access", () => {
            const clientClass = createClientClass();
            const ref = clientClass.getReferenceToMaxRetries({
                referenceToRequestOptions: ts.factory.createIdentifier("requestOptions"),
                isNullable: false
            });
            expect(serializeExpression(ref)).toBe("requestOptions.maxRetries");
        });

        it("returns nullable property access with optional chaining", () => {
            const clientClass = createClientClass();
            const ref = clientClass.getReferenceToMaxRetries({
                referenceToRequestOptions: ts.factory.createIdentifier("requestOptions"),
                isNullable: true
            });
            expect(serializeExpression(ref)).toBe("requestOptions?.maxRetries");
        });
    });

    describe("getReferenceToAbortSignal", () => {
        it("returns optional chaining expression", () => {
            const clientClass = createClientClass();
            const ref = clientClass.getReferenceToAbortSignal({
                referenceToRequestOptions: ts.factory.createIdentifier("requestOptions")
            });
            expect(serializeExpression(ref)).toBe("requestOptions?.abortSignal");
        });
    });

    describe("getReferenceToDefaultTimeoutInSeconds", () => {
        it("returns this._options?.timeoutInSeconds", () => {
            const clientClass = createClientClass();
            const ref = clientClass.getReferenceToDefaultTimeoutInSeconds();
            expect(serializeExpression(ref)).toBe("this._options?.timeoutInSeconds");
        });
    });

    describe("getReferenceToDefaultMaxRetries", () => {
        it("returns this._options?.maxRetries", () => {
            const clientClass = createClientClass();
            const ref = clientClass.getReferenceToDefaultMaxRetries();
            expect(serializeExpression(ref)).toBe("this._options?.maxRetries");
        });
    });

    describe("getReferenceToLogger", () => {
        it("returns this._options.logging", () => {
            const clientClass = createClientClass();
            const context = createMockFileContext();
            const ref = clientClass.getReferenceToLogger(context);
            expect(serializeExpression(ref)).toBe("this._options.logging");
        });
    });

    describe("getReferenceToMetadataForEndpointSupplier", () => {
        it("returns _metadata identifier", () => {
            const clientClass = createClientClass();
            const ref = clientClass.getReferenceToMetadataForEndpointSupplier();
            expect(serializeExpression(ref)).toBe("_metadata");
        });
    });

    describe("getReferenceToOption", () => {
        it("returns this._options.propertyName", () => {
            const clientClass = createClientClass();
            const ref = clientClass.getReferenceToOption("apiKey");
            expect(serializeExpression(ref)).toBe("this._options.apiKey");
        });
    });

    describe("getEndpoint", () => {
        it("returns undefined when no endpoints exist", () => {
            const clientClass = createClientClass();
            const context = createMockFileContext();
            const endpoint = clientClass.getEndpoint({ context, endpointId: "nonexistent" });
            expect(endpoint).toBeUndefined();
        });

        it("finds endpoint by id", () => {
            const httpEndpoint = createHttpEndpoint();
            const ir = createIR({
                service: {
                    availability: undefined,
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    displayName: undefined,
                    basePath: { head: "", parts: [] },
                    endpoints: [httpEndpoint],
                    headers: [],
                    pathParameters: [],
                    encoding: undefined,
                    transport: undefined,
                    audiences: undefined
                }
            });
            const clientClass = createClientClass({ ir });
            const context = createMockFileContext({ ir });
            const endpoint = clientClass.getEndpoint({ context, endpointId: httpEndpoint.id });
            expect(endpoint).toBeDefined();
            expect(endpoint?.endpoint.id).toBe(httpEndpoint.id);
        });
    });

    describe("invokeEndpoint", () => {
        it("returns undefined for nonexistent endpoint", () => {
            const clientClass = createClientClass();
            const context = createMockFileContext();
            const result = clientClass.invokeEndpoint({
                context,
                endpointId: "nonexistent",
                example: createMinimalExampleEndpointCall(),
                clientReference: ts.factory.createIdentifier("client")
            });
            expect(result).toBeUndefined();
        });
    });

    describe("getBaseUrl", () => {
        it("returns baseUrl ?? environment reference", () => {
            const clientClass = createClientClass();
            const context = createMockFileContext();
            const endpoint = createHttpEndpoint();
            const ref = clientClass.getBaseUrl(endpoint, context);
            expect(serializeExpression(ref)).toMatchSnapshot();
        });
    });

    describe("static constants", () => {
        it("exposes static property names", () => {
            expect(GeneratedSdkClientClassImpl.BASE_URL_OPTION_PROPERTY_NAME).toBe("baseUrl");
            expect(GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME).toBe("environment");
            expect(GeneratedSdkClientClassImpl.OPTIONS_INTERFACE_NAME).toBe("Options");
            expect(GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER).toBe("_options");
            expect(GeneratedSdkClientClassImpl.METADATA_FOR_TOKEN_SUPPLIER_VAR).toBe("_metadata");
            expect(GeneratedSdkClientClassImpl.AUTH_PROVIDER_FIELD_NAME).toBe("authProvider");
            expect(GeneratedSdkClientClassImpl.LOGGING_FIELD_NAME).toBe("logging");
        });
    });

    describe("ENDPOINT_SECURITY auth requirement", () => {
        it("creates routing auth provider for ENDPOINT_SECURITY", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        docs: undefined
                    }),
                    FernIr.AuthScheme.header({
                        key: "apiKey",
                        name: createNameAndWireValue("X-API-Key"),
                        prefix: undefined,
                        headerEnvVar: undefined,
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        docs: undefined
                    })
                ],
                authRequirement: "ENDPOINT_SECURITY",
                service: {
                    availability: undefined,
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    displayName: undefined,
                    basePath: { head: "", parts: [] },
                    endpoints: [{ ...createHttpEndpoint(), auth: true }],
                    headers: [],
                    pathParameters: [],
                    encoding: undefined,
                    transport: undefined,
                    audiences: undefined
                }
            });
            const clientClass = createClientClass({ ir });
            expect(clientClass.hasAuthProvider()).toBe(true);
        });
    });

    describe("global authorization header conversion", () => {
        it("converts authorization header to auth scheme", () => {
            const ir = createIR({
                headers: [
                    {
                        name: createNameAndWireValue("Authorization"),
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        env: undefined,
                        docs: undefined,
                        availability: undefined,
                        v2Examples: undefined
                    }
                ],
                authRequirement: "ALL",
                service: {
                    availability: undefined,
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    displayName: undefined,
                    basePath: { head: "", parts: [] },
                    endpoints: [{ ...createHttpEndpoint(), auth: true }],
                    headers: [],
                    pathParameters: [],
                    encoding: undefined,
                    transport: undefined,
                    audiences: undefined
                }
            });
            const clientClass = createClientClass({ ir });
            // The authorization header should be converted to a HeaderAuthScheme
            expect(clientClass.hasAuthProvider()).toBe(true);
        });
    });

    describe("standalone header auth", () => {
        it("creates header auth provider for single header scheme", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.header({
                        key: "apiKey",
                        name: createNameAndWireValue("X-API-Key"),
                        prefix: undefined,
                        headerEnvVar: undefined,
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        docs: undefined
                    })
                ],
                authRequirement: "ALL",
                service: {
                    availability: undefined,
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    displayName: undefined,
                    basePath: { head: "", parts: [] },
                    endpoints: [{ ...createHttpEndpoint(), auth: true }],
                    headers: [],
                    pathParameters: [],
                    encoding: undefined,
                    transport: undefined,
                    audiences: undefined
                }
            });
            const clientClass = createClientClass({ ir });
            expect(clientClass.hasAuthProvider()).toBe(true);
            expect(clientClass.getAuthProviderInstance()).toBeDefined();
        });
    });

    describe("OAuth auth", () => {
        it("creates OAuth auth provider", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.oauth({
                        key: "oauth",
                        docs: undefined,
                        configuration: FernIr.OAuthConfiguration.clientCredentials({
                            tokenPrefix: undefined,
                            tokenHeader: undefined,
                            scopes: undefined,
                            clientIdEnvVar: undefined,
                            clientSecretEnvVar: undefined,
                            tokenEndpoint: {
                                endpointReference: {
                                    endpointId: "endpoint_getToken",
                                    serviceId: "service_auth",
                                    subpackageId: undefined
                                },
                                requestProperties: {
                                    clientId: {
                                        propertyPath: undefined,
                                        property: FernIr.RequestPropertyValue.body({
                                            name: createNameAndWireValue("client_id"),
                                            valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                                            docs: undefined,
                                            availability: undefined,
                                            propertyAccess: undefined,
                                            v2Examples: undefined
                                        })
                                    },
                                    clientSecret: {
                                        propertyPath: undefined,
                                        property: FernIr.RequestPropertyValue.body({
                                            name: createNameAndWireValue("client_secret"),
                                            valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                                            docs: undefined,
                                            availability: undefined,
                                            propertyAccess: undefined,
                                            v2Examples: undefined
                                        })
                                    },
                                    scopes: undefined,
                                    customProperties: undefined
                                },
                                responseProperties: {
                                    accessToken: {
                                        propertyPath: undefined,
                                        property: {
                                            name: createNameAndWireValue("access_token"),
                                            valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                                            docs: undefined,
                                            availability: undefined,
                                            propertyAccess: undefined,
                                            v2Examples: undefined
                                        }
                                    },
                                    expiresIn: undefined,
                                    refreshToken: undefined
                                }
                            },
                            refreshEndpoint: undefined
                        })
                    })
                ],
                authRequirement: "ALL",
                service: {
                    availability: undefined,
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    displayName: undefined,
                    basePath: { head: "", parts: [] },
                    endpoints: [{ ...createHttpEndpoint(), auth: true }],
                    headers: [],
                    pathParameters: [],
                    encoding: undefined,
                    transport: undefined,
                    audiences: undefined
                }
            });
            const clientClass = createClientClass({ ir });
            expect(clientClass.hasAuthProvider()).toBe(true);
        });
    });

    describe("neverThrowErrors", () => {
        it("creates client class with neverThrowErrors enabled", () => {
            const ir = createIR({
                service: {
                    availability: undefined,
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    displayName: undefined,
                    basePath: { head: "", parts: [] },
                    endpoints: [createHttpEndpoint()],
                    headers: [],
                    pathParameters: [],
                    encoding: undefined,
                    transport: undefined,
                    audiences: undefined
                }
            });
            const clientClass = createClientClass({ ir, neverThrowErrors: true });
            const context = createMockFileContext({ ir });
            const endpoint = clientClass.getEndpoint({
                context,
                endpointId: ir.rootPackage.service ? (ir.services[ir.rootPackage.service]?.endpoints[0]?.id ?? "") : ""
            });
            expect(endpoint).toBeDefined();
        });
    });

    describe("requireDefaultEnvironment", () => {
        it("throws when requireDefaultEnvironment is true and no default environment", () => {
            const clientClass = createClientClass({ requireDefaultEnvironment: true });
            const context = createMockFileContext();
            const endpoint = createHttpEndpoint();
            expect(() => clientClass.getEnvironment(endpoint, context)).toThrow(
                "Cannot use default environment because none exists"
            );
        });

        it("returns default environment when requireDefaultEnvironment is true and default exists", () => {
            const clientClass = createClientClass({ requireDefaultEnvironment: true });
            const defaultEnvExpr = ts.factory.createStringLiteral("https://api.example.com");
            // biome-ignore lint/suspicious/noExplicitAny: test mock override
            const context: any = {
                ...createMockFileContext(),
                environments: {
                    getGeneratedEnvironments: () => ({
                        getReferenceToDefaultEnvironment: () => defaultEnvExpr,
                        getReferenceToEnvironmentUrl: ({
                            referenceToEnvironmentValue
                        }: {
                            referenceToEnvironmentValue: ts.Expression;
                        }) => referenceToEnvironmentValue
                    }),
                    getReferenceToFirstEnvironmentEnum: () => undefined
                }
            };
            const endpoint = createHttpEndpoint();
            const ref = clientClass.getEnvironment(endpoint, context);
            expect(serializeExpression(ref)).toBe('"https://api.example.com"');
        });
    });

    describe("getOptionsPropertiesForSnippet", () => {
        it("includes environment property when no default environment and not requireDefaultEnvironment", () => {
            const clientClass = createClientClass({ requireDefaultEnvironment: false });
            const context = createMockFileContext();
            const props = clientClass.getOptionsPropertiesForSnippet(context);
            // Should include environment: "YOUR_BASE_URL" since no default env and no first enum
            expect(props.length).toBeGreaterThan(0);
            const envProp = props.find((p) => {
                const text = getTextOfTsNode(p);
                return text.includes("environment");
            });
            expect(envProp).toBeDefined();
        });

        it("includes auth snippet properties when auth provider exists", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        docs: undefined
                    })
                ],
                authRequirement: "ALL",
                service: {
                    availability: undefined,
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    displayName: undefined,
                    basePath: { head: "", parts: [] },
                    endpoints: [{ ...createHttpEndpoint(), auth: true }],
                    headers: [],
                    pathParameters: [],
                    encoding: undefined,
                    transport: undefined,
                    audiences: undefined
                }
            });
            const clientClass = createClientClass({ ir });
            const context = createMockFileContext({ ir });
            const props = clientClass.getOptionsPropertiesForSnippet(context);
            // Should include both environment and auth token properties
            expect(props.length).toBeGreaterThanOrEqual(1);
        });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// IR factory helpers
// ──────────────────────────────────────────────────────────────────────────────

function createMinimalExampleEndpointCall(): FernIr.ExampleEndpointCall {
    return {
        id: undefined,
        name: undefined,
        url: "/test",
        rootPathParameters: [],
        endpointPathParameters: [],
        servicePathParameters: [],
        endpointHeaders: [],
        serviceHeaders: [],
        queryParameters: [],
        request: undefined,
        response: FernIr.ExampleResponse.ok(FernIr.ExampleEndpointSuccessResponse.body(undefined)),
        docs: undefined
    };
}
