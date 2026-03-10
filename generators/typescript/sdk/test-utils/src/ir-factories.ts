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
        services: opts?.services ?? {}
        // biome-ignore lint/suspicious/noExplicitAny: minimal IR mock for auth provider tests
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
        explode: undefined
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
        explode: undefined
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
    opts?: { wireValue?: string; env?: string }
): FernIr.HttpHeader {
    return {
        name: createNameAndWireValue(name, opts?.wireValue),
        valueType,
        env: opts?.env,
        v2Examples: undefined,
        docs: undefined,
        availability: undefined
    };
}
