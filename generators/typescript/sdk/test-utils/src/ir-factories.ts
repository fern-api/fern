import { FernIr } from "@fern-fern/ir-sdk";

import { casingsGenerator, createNameAndWireValue } from "./casings.js";

/**
 * Creates a BearerAuthScheme IR object for use in tests.
 */
export function createBearerAuthScheme(opts?: {
    tokenName?: string;
    tokenEnvVar?: string;
    docs?: string;
}): FernIr.BearerAuthScheme {
    return {
        docs: opts?.docs,
        token: casingsGenerator.generateName(opts?.tokenName ?? "token"),
        tokenEnvVar: opts?.tokenEnvVar,
        key: "Bearer"
    };
}

/**
 * Creates a BasicAuthScheme IR object for use in tests.
 */
export function createBasicAuthScheme(opts?: {
    username?: string;
    password?: string;
    usernameEnvVar?: string;
    passwordEnvVar?: string;
    docs?: string;
}): FernIr.BasicAuthScheme {
    return {
        docs: opts?.docs,
        username: casingsGenerator.generateName(opts?.username ?? "username"),
        usernameEnvVar: opts?.usernameEnvVar,
        usernameOmit: undefined,
        password: casingsGenerator.generateName(opts?.password ?? "password"),
        passwordEnvVar: opts?.passwordEnvVar,
        passwordOmit: undefined,
        key: "BasicAuth"
    };
}

/**
 * Creates a HeaderAuthScheme IR object for use in tests.
 */
export function createHeaderAuthScheme(opts?: {
    name?: string;
    wireValue?: string;
    headerEnvVar?: string;
    docs?: string;
    prefix?: string;
    key?: string;
}): FernIr.HeaderAuthScheme {
    return {
        docs: opts?.docs,
        name: createNameAndWireValue(opts?.name ?? "apiKey", opts?.wireValue ?? "X-API-Key"),
        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
        prefix: opts?.prefix,
        headerEnvVar: opts?.headerEnvVar,
        key: opts?.key ?? "ApiKey"
    };
}

/**
 * Creates a minimal IR object with auth configuration for use in auth provider tests.
 * Only populates the fields that auth provider generators actually access.
 */
export function createMinimalIR(opts?: {
    authSchemes?: FernIr.AuthScheme[];
    isAuthMandatory?: boolean;
    services?: Record<string, FernIr.HttpService>;
    headers?: FernIr.HttpHeader[];
    idempotencyHeaders?: FernIr.HttpHeader[];
}): FernIr.IntermediateRepresentation {
    return {
        auth: {
            schemes: opts?.authSchemes ?? [],
            docs: undefined,
            requirement: "ALL"
        },
        sdkConfig: {
            isAuthMandatory: opts?.isAuthMandatory ?? false,
            hasStreamingEndpoints: false,
            hasPaginatedEndpoints: false,
            hasFileDownloadEndpoints: false,
            platformHeaders: {
                language: "",
                sdkName: "",
                sdkVersion: "",
                userAgent: undefined
            }
        },
        services: opts?.services ?? {},
        headers: opts?.headers ?? [],
        idempotencyHeaders: opts?.idempotencyHeaders ?? [],
        errors: {},
        types: {},
        subpackages: {},
        variables: [],
        rootPackage: {
            fernFilepath: { allParts: [], packagePath: [], file: undefined },
            service: undefined,
            types: [],
            errors: [],
            subpackages: [],
            hasEndpointsInTree: false,
            docs: undefined,
            websocket: undefined,
            webhooks: undefined,
            navigationConfig: undefined
        },
        errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.statusCode(),
        constants: {
            errorInstanceIdKey: casingsGenerator.generateName("errorInstanceId")
        },
        environments: undefined,
        pathParameters: [],
        webhookGroups: {},
        websocketChannels: {}
        // biome-ignore lint/suspicious/noExplicitAny: minimal IR mock — some rarely-used fields omitted
    } as any;
}

/**
 * Creates a PathParameter IR object for use in tests.
 */
export function createPathParameter(
    name: string,
    location: FernIr.PathParameterLocation = "ENDPOINT"
): FernIr.PathParameter {
    return {
        name: casingsGenerator.generateName(name),
        valueType: FernIr.TypeReference.primitive({
            v1: "STRING",
            v2: undefined
        }),
        location,
        variable: undefined,
        v2Examples: undefined,
        docs: undefined,
        explode: undefined,
        clientDefault: undefined
    };
}

/**
 * Creates a QueryParameter IR object for use in tests.
 */
export function createQueryParameter(
    name: string,
    valueType: FernIr.TypeReference,
    opts?: { allowMultiple?: boolean; wireValue?: string }
): FernIr.QueryParameter {
    return {
        name: createNameAndWireValue(name, opts?.wireValue),
        valueType,
        allowMultiple: opts?.allowMultiple ?? false,
        v2Examples: undefined,
        docs: undefined,
        availability: undefined,
        explode: undefined,
        clientDefault: undefined
    };
}

/**
 * Creates an AuthScheme union variant for use in IR auth configuration.
 * The returned object preserves reference identity with the input scheme object,
 * which is required because generators use identity comparison (=== this.authScheme)
 * to find their scheme in the IR's auth.schemes array.
 */
export function createAuthScheme(
    type: "bearer" | "basic" | "header",
    scheme: FernIr.BearerAuthScheme | FernIr.BasicAuthScheme | FernIr.HeaderAuthScheme,
    key?: string
): FernIr.AuthScheme {
    // We must create the union variant and then mutate the key onto the same object
    // so that identity comparison (scheme === this.authScheme) works in the generators.
    let authScheme: FernIr.AuthScheme;
    switch (type) {
        case "bearer":
            authScheme = FernIr.AuthScheme.bearer(scheme as FernIr.BearerAuthScheme);
            break;
        case "basic":
            authScheme = FernIr.AuthScheme.basic(scheme as FernIr.BasicAuthScheme);
            break;
        case "header":
            authScheme = FernIr.AuthScheme.header(scheme as FernIr.HeaderAuthScheme);
            break;
    }
    // biome-ignore lint/suspicious/noExplicitAny: AuthScheme union type doesn't include key in its type definition but IR objects have it at runtime
    (authScheme as any).key = key ?? (type === "bearer" ? "Bearer" : type === "basic" ? "BasicAuth" : "ApiKey");
    return authScheme;
}

/**
 * Creates an HttpHeader IR object for use in tests.
 */
export function createHttpHeader(
    name: string,
    valueType: FernIr.TypeReference,
    opts?: { wireValue?: string; env?: string; docs?: string }
): FernIr.HttpHeader {
    return {
        name: createNameAndWireValue(name, opts?.wireValue),
        valueType,
        env: opts?.env,
        v2Examples: undefined,
        docs: opts?.docs,
        availability: undefined,
        clientDefault: undefined
    };
}

/**
 * Creates an InlinedRequestBodyProperty IR object for use in tests.
 */
export function createInlinedRequestBodyProperty(
    name: string,
    valueType: FernIr.TypeReference,
    opts?: { wireValue?: string; docs?: string }
): FernIr.InlinedRequestBodyProperty {
    return {
        name: createNameAndWireValue(name, opts?.wireValue),
        valueType,
        docs: opts?.docs,
        availability: undefined,
        v2Examples: undefined,
        propertyAccess: undefined
    };
}

/**
 * Creates an InlinedRequestBody IR object for use in tests.
 */
export function createInlinedRequestBody(opts?: {
    name?: string;
    properties?: FernIr.InlinedRequestBodyProperty[];
    extends?: FernIr.DeclaredTypeName[];
    extraProperties?: boolean;
}): FernIr.InlinedRequestBody {
    return {
        name: casingsGenerator.generateName(opts?.name ?? "MyRequest"),
        properties: opts?.properties ?? [],
        extends: opts?.extends ?? [],
        extraProperties: opts?.extraProperties ?? false,
        extendedProperties: undefined,
        docs: undefined,
        v2Examples: undefined,
        contentType: undefined
    };
}

/**
 * Creates a minimal HttpService IR object for use in tests.
 */
export function createHttpService(opts?: {
    headers?: FernIr.HttpHeader[];
    pathParameters?: FernIr.PathParameter[];
}): FernIr.HttpService {
    return {
        availability: undefined,
        name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
        displayName: undefined,
        basePath: { head: "", parts: [] },
        endpoints: [],
        headers: opts?.headers ?? [],
        pathParameters: opts?.pathParameters ?? [],
        encoding: undefined,
        transport: undefined,
        audiences: undefined
    };
}

/**
 * Creates a minimal HttpEndpoint IR object for use in tests.
 */
export function createHttpEndpoint(opts?: {
    queryParameters?: FernIr.QueryParameter[];
    headers?: FernIr.HttpHeader[];
    pathParameters?: FernIr.PathParameter[];
    allPathParameters?: FernIr.PathParameter[];
    requestBody?: FernIr.HttpRequestBody;
    sdkRequest?: FernIr.SdkRequest;
    docs?: string;
}): FernIr.HttpEndpoint {
    return {
        id: "endpoint_test",
        name: casingsGenerator.generateName("testEndpoint"),
        displayName: undefined,
        method: "POST",
        headers: opts?.headers ?? [],
        responseHeaders: undefined,
        baseUrl: undefined,
        v2BaseUrls: undefined,
        basePath: undefined,
        path: { head: "/test", parts: [] },
        fullPath: { head: "/test", parts: [] },
        pathParameters: opts?.pathParameters ?? [],
        allPathParameters: opts?.allPathParameters ?? opts?.pathParameters ?? [],
        queryParameters: opts?.queryParameters ?? [],
        requestBody: opts?.requestBody,
        v2RequestBodies: undefined,
        sdkRequest: opts?.sdkRequest,
        response: undefined,
        v2Responses: undefined,
        errors: [],
        auth: false,
        security: undefined,
        idempotent: false,
        pagination: undefined,
        userSpecifiedExamples: [],
        autogeneratedExamples: [],
        v2Examples: undefined,
        transport: undefined,
        source: undefined,
        audiences: undefined,
        retries: undefined,
        apiPlayground: undefined,
        docs: opts?.docs,
        availability: undefined
    };
}

/**
 * Creates a DeclaredTypeName IR object for use in tests.
 * Used for inlinedRequestBody.extends and named type references.
 */
export function createDeclaredTypeName(name: string): FernIr.DeclaredTypeName {
    return {
        typeId: `type_${name}`,
        fernFilepath: { allParts: [], packagePath: [], file: undefined },
        name: casingsGenerator.generateName(name),
        displayName: undefined
    };
}

/**
 * Creates a named TypeReference pointing to a DeclaredTypeName.
 */
export function createNamedTypeReference(name: string): FernIr.TypeReference.Named {
    const declaredTypeName = createDeclaredTypeName(name);
    return FernIr.TypeReference.named({
        typeId: declaredTypeName.typeId,
        fernFilepath: declaredTypeName.fernFilepath,
        name: declaredTypeName.name,
        displayName: declaredTypeName.displayName,
        default: undefined,
        inline: undefined
    });
}

/**
 * Creates an ObjectProperty IR object for use in tests.
 */
export function createObjectProperty(
    name: string,
    valueType: FernIr.TypeReference,
    opts?: { wireValue?: string; docs?: string }
): FernIr.ObjectProperty {
    return {
        name: createNameAndWireValue(name, opts?.wireValue),
        valueType,
        docs: opts?.docs,
        availability: undefined,
        v2Examples: undefined,
        propertyAccess: undefined
    };
}

/**
 * Creates an SdkRequest with justRequestBody shape for use in tests.
 */
export function createSdkRequestBody(opts?: {
    requestBodyType?: FernIr.TypeReference;
    contentType?: string;
}): FernIr.SdkRequest {
    return {
        streamParameter: undefined,
        requestParameterName: casingsGenerator.generateName("request"),
        shape: FernIr.SdkRequestShape.justRequestBody(
            FernIr.SdkRequestBodyType.typeReference({
                requestBodyType:
                    opts?.requestBodyType ?? FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                contentType: opts?.contentType,
                docs: undefined,
                v2Examples: undefined
            })
        )
    };
}

/**
 * Creates an SdkRequest with wrapper shape for use in tests.
 */
export function createSdkRequestWrapper(opts?: {
    bodyKey?: string;
    includePathParameters?: boolean;
    onlyPathParameters?: boolean;
}): FernIr.SdkRequest {
    return {
        streamParameter: undefined,
        requestParameterName: casingsGenerator.generateName("request"),
        shape: FernIr.SdkRequestShape.wrapper({
            wrapperName: casingsGenerator.generateName("Request"),
            bodyKey: casingsGenerator.generateName(opts?.bodyKey ?? "body"),
            includePathParameters: opts?.includePathParameters,
            onlyPathParameters: opts?.onlyPathParameters
        })
    };
}
