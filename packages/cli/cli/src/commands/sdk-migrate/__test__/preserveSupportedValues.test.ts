import type { FernDefinition } from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { describe, expect, it } from "vitest";
import YAML from "yaml";

import { mapFernDefinitionToSdkConfigApi, mapFernGroupToSdkConfig } from "../mapFernGroupToSdkConfig.js";
import { mergeSdkConfig } from "../mergeSdkConfig.js";

type RootContents = FernDefinition["rootApiFile"]["contents"];
type AuthSchemes = NonNullable<RootContents["auth-schemes"]>;
type DefinitionService = FernDefinition["namedDefinitionFiles"][RelativeFilePath]["contents"]["service"];

const TYPESCRIPT_GENERATOR = "fernapi/fern-typescript-sdk";

const CLIENT_CREDENTIALS: AuthSchemes[string] = {
    scheme: "oauth",
    type: "client-credentials",
    "client-id-env": "ACME_CLIENT_ID",
    "client-secret-env": "ACME_CLIENT_SECRET",
    "token-header": "X-Access-Token",
    "token-prefix": "Token",
    scopes: ["read:pets", "write:pets"],
    docs: "Client credentials",
    "get-token": {
        endpoint: "POST /oauth/token",
        "request-properties": {
            "client-id": "$request.client_id",
            "client-secret": "$request.client_secret",
            scopes: "$request.scope"
        },
        "response-properties": {
            "access-token": "$response.access_token",
            "expires-in": "$response.expires_in",
            "refresh-token": "$response.refresh_token"
        }
    },
    "refresh-token": {
        endpoint: "POST /oauth/refresh/",
        "request-properties": { "refresh-token": "$request.refresh_token" }
    }
};

const AUTHORIZATION_CODE: AuthSchemes[string] = {
    scheme: "oauth",
    type: "authorization-code",
    "client-id": "public-client",
    "authorization-url": "https://auth.example.com/authorize",
    "token-url": "https://auth.example.com/token"
};

const BEARER: AuthSchemes[string] = { scheme: "bearer", token: { env: "BEARER_TOKEN" } };
const API_KEY: AuthSchemes[string] = { header: "X-Api-Key", type: "string", env: "API_KEY_VALUE", prefix: "Key" };
const SUPPORTED_SCHEMES: AuthSchemes = {
    BasicAuth: { scheme: "basic", username: { env: "ACME_USER" }, password: { env: "ACME_PASSWORD" } },
    BearerAuth: BEARER,
    ApiKey: API_KEY,
    OAuth2: CLIENT_CREDENTIALS
};

const MIGRATED_SUPPORTED_SCHEMES = [
    {
        id: "BasicAuth",
        type: "basic",
        username: { environmentVariable: "ACME_USER" },
        password: { environmentVariable: "ACME_PASSWORD" }
    },
    { id: "BearerAuth", type: "bearer", environmentVariable: "BEARER_TOKEN" },
    {
        id: "ApiKey",
        type: "api-key",
        location: "header",
        name: "X-Api-Key",
        prefix: "Key",
        environmentVariable: "API_KEY_VALUE"
    },
    {
        id: "OAuth2",
        type: "oauth2",
        flows: [
            {
                type: "client-credentials",
                tokenUrl: "/oauth/token",
                refreshUrl: "/oauth/refresh",
                scopes: [{ name: "read:pets" }, { name: "write:pets" }]
            }
        ],
        clientId: { environmentVariable: "ACME_CLIENT_ID" },
        clientSecret: { environmentVariable: "ACME_CLIENT_SECRET" },
        tokenHeader: "X-Access-Token",
        tokenPrefix: "Token",
        description: "Client credentials"
    }
];

describe("fern sdk migrate auth", () => {
    it("preserves the complete auth block when every scheme is representable", () => {
        const result = mapFernDefinitionToSdkConfigApi(
            createDefinition({
                auth: { any: ["BasicAuth", "BearerAuth", "ApiKey", "OAuth2"] },
                "auth-schemes": SUPPORTED_SCHEMES
            })
        );

        expect(result.api.auth).toEqual({
            schemes: MIGRATED_SUPPORTED_SCHEMES,
            requirements: [
                { schemes: ["BasicAuth"] },
                { schemes: ["BearerAuth"] },
                { schemes: ["ApiKey"] },
                { schemes: ["OAuth2"] }
            ]
        });
        expect(result.diagnostics).toEqual([]);
    });

    it("keeps supported schemes and names the omitted scheme and affected fields", () => {
        const result = mapFernDefinitionToSdkConfigApi(
            createDefinition({
                auth: { any: ["ApiKey", "BrowserLogin", "OAuth2"] },
                "auth-schemes": { ApiKey: API_KEY, BrowserLogin: AUTHORIZATION_CODE, OAuth2: CLIENT_CREDENTIALS }
            })
        );

        expect(result.api.auth?.schemes.map((scheme) => scheme.id)).toEqual(["ApiKey", "OAuth2"]);
        expect(result.api.auth?.requirements).toEqual([{ schemes: ["ApiKey"] }, { schemes: ["OAuth2"] }]);
        expect(result.diagnostics).toEqual([
            {
                code: "FERN_API_AUTH_SCHEME_OMITTED",
                severity: "warning",
                path: ["auth-schemes", "BrowserLogin"],
                reason: "Fern auth scheme 'BrowserLogin' was omitted because OAuth authorization-code needs a public client ID, which SDK Config v1 api.auth cannot hold yet. api.auth keeps ApiKey, OAuth2; affected: api.auth.schemes, api.auth.requirements.",
                sdkConfigPath: ["api", "auth", "schemes"],
                suggestedAction:
                    "Add 'BrowserLogin' to api.auth.schemes and api.auth.requirements manually, or keep this API on generators.yml until SDK Config supports it."
            }
        ]);
    });

    it("keeps supported schemes under endpoint security", () => {
        const result = mapFernDefinitionToSdkConfigApi(
            createDefinition({
                auth: { "endpoint-security": {} },
                "auth-schemes": { BearerAuth: BEARER, Inferred: inferredBearer() }
            })
        );

        expect(result.api.auth).toEqual({
            endpointSecurity: true,
            schemes: [{ id: "BearerAuth", type: "bearer", environmentVariable: "BEARER_TOKEN" }]
        });
        expect(result.diagnostics).toEqual([
            expect.objectContaining({
                code: "FERN_API_AUTH_SCHEME_OMITTED",
                path: ["auth-schemes", "Inferred"],
                reason: expect.stringContaining("affected: api.auth.schemes, endpoint security requirements")
            })
        ]);
    });

    it("omits api.auth with a review diagnostic only when no scheme is representable", () => {
        const result = mapFernDefinitionToSdkConfigApi(
            createDefinition({ auth: "BrowserLogin", "auth-schemes": { BrowserLogin: AUTHORIZATION_CODE } })
        );

        expect(result.api.auth).toBeUndefined();
        expect(result.diagnostics).toEqual([
            expect.objectContaining({
                code: "FERN_API_AUTH_REQUIRES_REVIEW",
                path: ["api", "auth"],
                reason: expect.stringContaining("BrowserLogin (OAuth authorization-code needs a public client ID")
            })
        ]);
    });

    it("migrates OAuth client credentials while reporting each field SDK Config cannot hold", () => {
        const result = mapFernDefinitionToSdkConfigApi(
            createDefinition({
                auth: "OAuth2",
                "auth-schemes": {
                    OAuth2: {
                        scheme: "oauth",
                        type: "client-credentials",
                        "token-prefix": "",
                        "token-parameters": { audience: "https://api.example.com" },
                        "get-token": {
                            endpoint: "POST /token",
                            "request-properties": { "client-id": "$request.clientKey" },
                            "response-properties": { "access-token": "$response.token" }
                        }
                    }
                }
            })
        );

        expect(result.api.auth?.schemes).toEqual([
            { id: "OAuth2", type: "oauth2", flows: [{ type: "client-credentials", tokenUrl: "/token" }] }
        ]);
        expect(result.diagnostics.map(({ code, path, sdkConfigPath }) => ({ code, path, sdkConfigPath }))).toEqual([
            {
                code: "FERN_API_AUTH_FIELD_UNSUPPORTED",
                path: ["auth-schemes", "OAuth2", "token-parameters"],
                sdkConfigPath: ["api", "auth", "schemes", 0]
            },
            {
                code: "FERN_API_AUTH_FIELD_UNSUPPORTED",
                path: ["auth-schemes", "OAuth2", "get-token", "request-properties", "client-id"],
                sdkConfigPath: ["api", "auth", "schemes", 0]
            },
            {
                code: "FERN_API_AUTH_FIELD_UNSUPPORTED",
                path: ["auth-schemes", "OAuth2", "get-token", "response-properties", "access-token"],
                sdkConfigPath: ["api", "auth", "schemes", 0]
            },
            {
                code: "FERN_API_AUTH_FIELD_UNSUPPORTED",
                path: ["auth-schemes", "OAuth2", "token-prefix"],
                sdkConfigPath: ["api", "auth", "schemes", 0]
            }
        ]);
    });

    it("resolves Fern definition token endpoint references to request paths", () => {
        const definition = createDefinition({
            imports: { auth: "auth.yml" },
            "base-path": "/v1",
            auth: "OAuth2",
            "auth-schemes": {
                OAuth2: {
                    scheme: "oauth",
                    type: "client-credentials",
                    "get-token": { endpoint: "auth.getToken" },
                    "refresh-token": {
                        endpoint: "auth.refresh",
                        "request-properties": { "refresh-token": "$request.refresh_token" }
                    }
                }
            }
        });
        definition.namedDefinitionFiles[RelativeFilePath.of("auth.yml")] = {
            absoluteFilePath: AbsoluteFilePath.of("/tmp/fern/definition/auth.yml"),
            defaultUrl: undefined,
            rawContents: "",
            contents: {
                service: {
                    auth: false,
                    "base-path": "/oauth",
                    endpoints: {
                        getToken: { method: "POST", path: "/token" },
                        refresh: { method: "POST", path: "/token/{grant}" }
                    }
                }
            }
        };

        const result = mapFernDefinitionToSdkConfigApi(definition);

        expect(result.api.auth?.schemes).toEqual([
            {
                id: "OAuth2",
                type: "oauth2",
                flows: [
                    { type: "client-credentials", tokenUrl: "/v1/oauth/token", refreshUrl: "/v1/oauth/token/{grant}" }
                ]
            }
        ]);
        expect(result.diagnostics).toEqual([]);
    });

    it("omits an OAuth scheme whose token endpoint cannot be resolved", () => {
        const result = mapFernDefinitionToSdkConfigApi(
            createDefinition({
                auth: { any: ["ApiKey", "OAuth2"] },
                "auth-schemes": {
                    ApiKey: API_KEY,
                    OAuth2: {
                        scheme: "oauth",
                        type: "client-credentials",
                        "get-token": { endpoint: "missing.getToken" }
                    }
                }
            })
        );

        expect(result.api.auth?.schemes.map((scheme) => scheme.id)).toEqual(["ApiKey"]);
        expect(result.diagnostics).toEqual([
            expect.objectContaining({
                code: "FERN_API_AUTH_SCHEME_OMITTED",
                path: ["auth-schemes", "OAuth2"],
                reason: expect.stringContaining("'missing.getToken' could not be resolved")
            })
        ]);
    });

    it("lets an endpoint base-path replace the root and service base paths, as the IR does", () => {
        const definition = createDefinition({
            imports: { auth: "auth.yml" },
            "base-path": "/v1",
            auth: "OAuth2",
            "auth-schemes": { OAuth2: oauthWithTokenEndpoint("auth.getToken") }
        });
        addService(definition, "auth.yml", {
            "base-path": "/oauth",
            endpoints: { getToken: { method: "POST", path: "/token", "base-path": "/identity" } }
        });

        expect(tokenUrls(mapFernDefinitionToSdkConfigApi(definition))).toEqual(["/identity/token"]);
    });

    it.each([
        ["billing/auth.yml", "auth.yml"],
        ["auth.yml", "billing/auth.yml"]
    ])("resolves namespaced method and path references by namespace, not file order (%s, %s)", (...filePaths) => {
        const definition = createDefinition({
            auth: "OAuth2",
            "auth-schemes": { OAuth2: oauthWithTokenEndpoint("billing::POST /token") }
        });
        for (const filePath of filePaths) {
            addService(definition, filePath, {
                "base-path": filePath.startsWith("billing/") ? "/billing/oauth" : "/oauth",
                endpoints: { getToken: { method: "POST", path: "/token" } }
            });
        }

        const result = mapFernDefinitionToSdkConfigApi(definition);

        expect(tokenUrls(result)).toEqual(["/billing/oauth/token"]);
        expect(result.diagnostics).toEqual([]);
    });

    it("picks the endpoint the IR's EndpointResolver picks when a route is declared in several files", () => {
        const definition = createDefinition({
            auth: "OAuth2",
            "auth-schemes": { OAuth2: oauthWithTokenEndpoint("POST /token") }
        });
        definition.packageMarkers[RelativeFilePath.of("__package__.yml")] = {
            defaultUrl: undefined,
            rawContents: "",
            contents: {
                service: {
                    auth: false,
                    "base-path": "/root",
                    endpoints: { getToken: { method: "POST", path: "/token" } }
                }
            }
        };
        addService(definition, "auth.yml", {
            "base-path": "/oauth",
            endpoints: { getToken: { method: "POST", path: "/token" } }
        });

        expect(tokenUrls(mapFernDefinitionToSdkConfigApi(definition))).toEqual(["/root/token"]);
    });

    it("omits a method and path reference that Fern's endpoint reference parser rejects", () => {
        const result = mapFernDefinitionToSdkConfigApi(
            createDefinition({ auth: "OAuth2", "auth-schemes": { OAuth2: oauthWithTokenEndpoint("POST oauth/token") } })
        );

        expect(result.api.auth).toBeUndefined();
        expect(result.diagnostics).toEqual([
            expect.objectContaining({
                code: "FERN_API_AUTH_REQUIRES_REVIEW",
                reason: expect.stringContaining("'POST oauth/token' could not be resolved to an endpoint")
            })
        ]);
    });

    it("writes an absolute token URL when the token endpoint's URL override is the same in every environment", () => {
        const definition = createDefinition({
            "default-url": "api",
            environments: {
                Production: { urls: { api: "https://api.acme.test", auth: "https://login.acme.test/" } },
                Staging: { urls: { api: "https://api.staging.acme.test", auth: "https://login.acme.test/" } }
            },
            auth: "OAuth2",
            "auth-schemes": {
                OAuth2: { ...oauthWithTokenEndpoint("POST /token"), "refresh-token": { endpoint: "POST /refresh" } }
            }
        });
        addService(definition, "auth.yml", {
            url: "auth",
            "base-path": "/oauth",
            endpoints: {
                getToken: { method: "POST", path: "/token" },
                refresh: { method: "POST", path: "/refresh", url: "api" }
            }
        });

        const result = mapFernDefinitionToSdkConfigApi(definition);

        expect(result.api.auth?.schemes[0]).toMatchObject({
            flows: [{ tokenUrl: "https://login.acme.test/oauth/token", refreshUrl: "/oauth/refresh" }]
        });
        expect(result.diagnostics).toEqual([]);
    });

    it("omits an OAuth scheme whose token endpoint URL override differs across environments", () => {
        const definition = createDefinition({
            environments: {
                Production: { urls: { api: "https://api.acme.test", auth: "https://login.acme.test" } },
                Staging: { urls: { api: "https://api.staging.acme.test", auth: "https://login.staging.acme.test" } }
            },
            auth: { any: ["ApiKey", "OAuth2"] },
            "auth-schemes": { ApiKey: API_KEY, OAuth2: oauthWithTokenEndpoint("POST /token") }
        });
        addService(definition, "auth.yml", {
            "base-path": "",
            endpoints: { getToken: { method: "POST", path: "/token", url: "auth" } }
        });

        const result = mapFernDefinitionToSdkConfigApi(definition);

        expect(result.api.auth?.schemes.map((scheme) => scheme.id)).toEqual(["ApiKey"]);
        expect(result.api.auth?.requirements).toEqual([{ schemes: ["ApiKey"] }]);
        expect(result.diagnostics).toEqual([
            expect.objectContaining({
                code: "FERN_API_AUTH_SCHEME_OMITTED",
                path: ["auth-schemes", "OAuth2"],
                reason: expect.stringContaining(
                    "its get-token endpoint 'POST /token' uses environment URL 'auth', which differs across environments (Production: https://login.acme.test, Staging: https://login.staging.acme.test), so flows[].tokenUrl cannot be set"
                )
            })
        ]);
    });

    it("drops only refreshUrl when the refresh endpoint's URL override cannot be resolved", () => {
        const definition = createDefinition({
            environments: { Production: { urls: { api: "https://api.acme.test" } } },
            auth: "OAuth2",
            "auth-schemes": {
                OAuth2: { ...oauthWithTokenEndpoint("POST /token"), "refresh-token": { endpoint: "POST /refresh" } }
            }
        });
        addService(definition, "auth.yml", {
            "base-path": "",
            endpoints: {
                getToken: { method: "POST", path: "/token" },
                refresh: { method: "POST", path: "/refresh", url: "auth" }
            }
        });

        const result = mapFernDefinitionToSdkConfigApi(definition);

        expect(result.api.auth?.schemes[0]).toMatchObject({ flows: [{ tokenUrl: "/token" }] });
        expect(result.diagnostics).toEqual([
            expect.objectContaining({
                code: "FERN_API_AUTH_FIELD_UNSUPPORTED",
                path: ["auth-schemes", "OAuth2", "refresh-token", "endpoint"],
                reason: expect.stringContaining(
                    "uses environment URL 'auth', which is missing from environments Production"
                )
            })
        ]);
    });

    it("explains that nested token response selectors are unsupported", () => {
        const result = mapFernDefinitionToSdkConfigApi(
            createDefinition({
                auth: "OAuth2",
                "auth-schemes": {
                    OAuth2: {
                        ...oauthWithTokenEndpoint("POST /token"),
                        "get-token": {
                            endpoint: "POST /token",
                            "response-properties": { "access-token": "$response.data.access_token" }
                        }
                    }
                }
            })
        );

        expect(result.diagnostics).toEqual([
            expect.objectContaining({
                path: ["auth-schemes", "OAuth2", "get-token", "response-properties", "access-token"],
                reason: expect.stringContaining(
                    "cannot select the nested token property 'data.access_token'; consumers read the top-level RFC 6749 property"
                )
            })
        ]);
    });
});

function oauthWithTokenEndpoint(endpoint: string): Extract<AuthSchemes[string], { scheme: "oauth" }> {
    return { scheme: "oauth", type: "client-credentials", "get-token": { endpoint } };
}

function addService(
    definition: FernDefinition,
    filePath: string,
    service: Omit<NonNullable<DefinitionService>, "auth"> & { auth?: boolean }
): void {
    definition.namedDefinitionFiles[RelativeFilePath.of(filePath)] = {
        absoluteFilePath: AbsoluteFilePath.of(`/tmp/fern/definition/${filePath}`),
        defaultUrl: undefined,
        rawContents: "",
        contents: { service: { auth: false, ...service } }
    };
}

function tokenUrls(result: ReturnType<typeof mapFernDefinitionToSdkConfigApi>): string[] {
    return (result.api.auth?.schemes ?? []).flatMap((scheme) =>
        scheme.type === "oauth2" ? scheme.flows.map((flow) => ("tokenUrl" in flow ? flow.tokenUrl : "")) : []
    );
}

describe("fern sdk migrate idempotency", () => {
    it("produces identical SDK Config on a second migration without mutating its inputs", () => {
        const definition = createDefinition({
            auth: { any: ["BasicAuth", "BearerAuth", "ApiKey", "OAuth2", "BrowserLogin"] },
            "auth-schemes": { ...SUPPORTED_SCHEMES, BrowserLogin: AUTHORIZATION_CODE }
        });
        const generators = [createGenerator(TYPESCRIPT_GENERATOR, "typescript", {})];
        const definitionBefore = structuredClone(definition.rootApiFile.contents);
        const configBefore = structuredClone(generators[0]?.config);

        const first = migrate(generators, definition);
        const second = migrate(generators, definition);

        expect(first.sdkConfig.api?.auth?.schemes).toEqual(MIGRATED_SUPPORTED_SCHEMES);
        expect(second).toEqual(first);
        expect(definition.rootApiFile.contents).toEqual(definitionBefore);
        expect(generators[0]?.config).toEqual(configBefore);
        expect(mergeSdkConfig({ existingContents: undefined, mapped: second, outputPath: "sdk-config.yml" })).toBe(
            mergeSdkConfig({ existingContents: undefined, mapped: first, outputPath: "sdk-config.yml" })
        );
    });

    it("round-trips migrated auth through the written SDK Config without loss", () => {
        const first = migrate(
            [createGenerator(TYPESCRIPT_GENERATOR, "typescript", {})],
            createDefinition({ auth: { "endpoint-security": {} }, "auth-schemes": SUPPORTED_SCHEMES })
        );
        const written = mergeSdkConfig({ existingContents: undefined, mapped: first, outputPath: "sdk-config.yml" });
        const reread = validateSdkConfigV1(YAML.parse(written));

        expect(reread.api?.auth).toEqual({ endpointSecurity: true, schemes: MIGRATED_SUPPORTED_SCHEMES });
        expect(reread.api?.auth).toEqual(first.sdkConfig.api?.auth);
    });
});

function migrate(
    generators: generatorsYml.GeneratorInvocation[],
    definition: FernDefinition
): ReturnType<typeof mapFernGroupToSdkConfig> {
    return mapFernGroupToSdkConfig({
        fernWorkspace: { definition },
        group: { audiences: { type: "select", audiences: [] }, generators, groupName: "cli", reviewers: undefined },
        source: { specs: [{ id: "api", type: "openapi" as const, path: "./openapi.yml" }] }
    });
}

function inferredBearer(): AuthSchemes[string] {
    return {
        scheme: "bearer",
        "get-token": { endpoint: "POST /token" }
    } as unknown as AuthSchemes[string];
}

function createDefinition(contents: Partial<RootContents>): FernDefinition {
    return {
        absoluteFilePath: AbsoluteFilePath.of("/tmp/fern/definition"),
        importedDefinitions: {},
        namedDefinitionFiles: {},
        packageMarkers: {},
        rootApiFile: {
            defaultUrl: "https://api.example.com",
            rawContents: "",
            contents: { name: "acme", ...contents }
        }
    };
}

function createGenerator(
    name: string,
    language: generatorsYml.GenerationLanguage | undefined,
    config: unknown
): generatorsYml.GeneratorInvocation {
    return {
        absolutePathToLocalOutput: undefined,
        absolutePathToLocalSnippets: undefined,
        automation: { generate: true, preview: true, upgrade: true, verify: true },
        config,
        containerImage: undefined,
        disableExamples: false,
        idempotencyKeyGenerationConfig: undefined,
        irVersionOverride: undefined,
        keywords: undefined,
        language,
        name,
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
        publishMetadata: undefined,
        raw: { name, version: "0.49.0" } as generatorsYml.GeneratorInvocationSchema,
        readme: undefined,
        settings: undefined,
        smartCasing: true,
        smartCasingDigitWordBoundary: false,
        version: "0.49.0"
    };
}
