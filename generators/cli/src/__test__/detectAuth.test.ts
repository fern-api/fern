import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import {
    detectAuthBindings,
    joinUrl,
    renderFullPath,
    renderRequestProperty,
    resolveDefaultBaseUrl
} from "../detectAuth.js";

/**
 * Coverage for the IR → auth binding mapping. The IR SDK's
 * `AuthScheme` constructors preserve the typed union shape consumed by
 * `detectAuth`, so we always go through them — never hand-assemble raw
 * `{ type: "bearer", ... }` objects.
 *
 * Helpers below skip the noise fields (docs/placeholder/etc.) the
 * generator doesn't read so each test reads as the auth shape being
 * exercised.
 */

const bearer = (overrides: { key: string; tokenEnvVar?: string }): FernIr.AuthScheme =>
    FernIr.AuthScheme.bearer({
        key: overrides.key,
        token: "token",
        tokenEnvVar: overrides.tokenEnvVar,
        tokenPlaceholder: undefined,
        docs: undefined
    });

const header = (overrides: { key: string; headerName?: string; headerEnvVar?: string }): FernIr.AuthScheme =>
    FernIr.AuthScheme.header({
        key: overrides.key,
        name: overrides.headerName ?? "X-Api-Key",
        prefix: undefined,
        headerEnvVar: overrides.headerEnvVar,
        headerPlaceholder: undefined,
        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
        docs: undefined
    });

const basic = (overrides: {
    key: string;
    usernameEnvVar?: string;
    passwordEnvVar?: string;
    usernameOmit?: boolean;
    passwordOmit?: boolean;
}): FernIr.AuthScheme =>
    FernIr.AuthScheme.basic({
        key: overrides.key,
        username: "username",
        usernameEnvVar: overrides.usernameEnvVar,
        usernameOmit: overrides.usernameOmit,
        usernamePlaceholder: undefined,
        password: "password",
        passwordEnvVar: overrides.passwordEnvVar,
        passwordOmit: overrides.passwordOmit,
        passwordPlaceholder: undefined,
        docs: undefined
    });

const auth = (...schemes: FernIr.AuthScheme[]) => ({ schemes });

describe("detectAuthBindings", () => {
    it("no schemes → no bindings", () => {
        expect(detectAuthBindings({ auth: auth(), binaryName: "acme" })).toEqual([]);
    });

    it("bearer with tokenEnvVar uses the IR-supplied env var verbatim", () => {
        const bindings = detectAuthBindings({
            auth: auth(bearer({ key: "OAuth2", tokenEnvVar: "ACME_OAUTH_TOKEN" })),
            binaryName: "acme"
        });
        expect(bindings).toHaveLength(1);
        expect(bindings[0]?.rustCall).toBe('.auth(BearerAuth::new("OAuth2").env("ACME_OAUTH_TOKEN"))');
        expect(bindings[0]?.placement).toBe("root");
        expect(bindings[0]?.authTypeImport).toBe("BearerAuth");
    });

    it("bearer without tokenEnvVar falls back to <BIN>_TOKEN (clean, no scheme noise)", () => {
        const bindings = detectAuthBindings({
            auth: auth(bearer({ key: "OAuth2" })),
            binaryName: "close"
        });
        expect(bindings[0]?.rustCall).toBe('.auth(BearerAuth::new("OAuth2").env("CLOSE_TOKEN"))');
    });

    it("header scheme with headerEnvVar uses the IR value", () => {
        const bindings = detectAuthBindings({
            auth: auth(header({ key: "ApiKey", headerEnvVar: "CLOSE_API_KEY" })),
            binaryName: "close"
        });
        expect(bindings[0]?.rustCall).toBe(
            '.auth(ApiKeyAuth::new("ApiKey").source(AuthCredentialSource::any(vec![AuthCredentialSource::cli("api-key"), AuthCredentialSource::from_env("CLOSE_API_KEY")])))'
        );
        expect(bindings[0]?.placement).toBe("root");
        expect(bindings[0]?.authTypeImport).toBe("ApiKeyAuth, AuthCredentialSource");
    });

    it("header scheme without headerEnvVar falls back to <BIN>_API_KEY", () => {
        const bindings = detectAuthBindings({
            auth: auth(header({ key: "ApiKey" })),
            binaryName: "close"
        });
        expect(bindings[0]?.rustCall).toBe(
            '.auth(ApiKeyAuth::new("ApiKey").source(AuthCredentialSource::any(vec![AuthCredentialSource::cli("api-key"), AuthCredentialSource::from_env("CLOSE_API_KEY")])))'
        );
    });

    it("multiple header schemes disambiguate the CLI flag from each key", () => {
        const bindings = detectAuthBindings({
            auth: auth(
                header({ key: "ApiKey", headerEnvVar: "CLOSE_API_KEY" }),
                header({ key: "AdminToken", headerEnvVar: "CLOSE_ADMIN_TOKEN" })
            ),
            binaryName: "close"
        });
        // No shared `--api-key`: each scheme gets a key-derived flag so they
        // don't collapse onto one clap arg.
        expect(bindings[0]?.rustCall).toBe(
            '.auth(ApiKeyAuth::new("ApiKey").source(AuthCredentialSource::any(vec![AuthCredentialSource::cli("api-key"), AuthCredentialSource::from_env("CLOSE_API_KEY")])))'
        );
        expect(bindings[1]?.rustCall).toBe(
            '.auth(ApiKeyAuth::new("AdminToken").source(AuthCredentialSource::any(vec![AuthCredentialSource::cli("admin-token"), AuthCredentialSource::from_env("CLOSE_ADMIN_TOKEN")])))'
        );
    });

    it("basic auth (both halves): root-level BasicAuth builder so auth status enumerates it [FER-11474]", () => {
        const bindings = detectAuthBindings({
            auth: auth(basic({ key: "BasicAuth", usernameEnvVar: "CLOSE_USER", passwordEnvVar: "CLOSE_PASS" })),
            binaryName: "close"
        });
        expect(bindings[0]?.rustCall).toBe(
            '.auth(BasicAuth::new("BasicAuth").username_env("CLOSE_USER").password_env("CLOSE_PASS"))'
        );
        expect(bindings[0]?.placement).toBe("root");
        expect(bindings[0]?.authTypeImport).toBe("BasicAuth");
        // `envVars` order is load-bearing: the wire-test manifest pairs
        // `envVars[0]` with mock-utils' `test-username` and `envVars[1]` with
        // `test-password` to satisfy its exact `Authorization: Basic <base64>`
        // matcher. Reordering these silently makes every basic-auth wire case
        // unmatchable.
        expect(bindings[0]?.basicHalf).toBe("both");
        expect(bindings[0]?.envVars).toEqual(["CLOSE_USER", "CLOSE_PASS"]);
    });

    it("basic auth with passwordOmit (Close pattern): emits auth_provider with BasicAuthProvider::username_only", () => {
        const bindings = detectAuthBindings({
            auth: auth(basic({ key: "ApiKeyAuth", usernameEnvVar: "CLOSE_API_KEY", passwordOmit: true })),
            binaryName: "close"
        });
        expect(bindings[0]?.rustCall).toBe(
            '.auth_provider("ApiKeyAuth", BasicAuthProvider::username_only("ApiKeyAuth", AuthCredentialSource::from_env("CLOSE_API_KEY")))'
        );
        expect(bindings[0]?.placement).toBe("binding");
        expect(bindings[0]?.authTypeImport).toBe("AuthCredentialSource, BasicAuthProvider");
        // Only the username half is bound, so the manifest must seed
        // `test-username` here — seeding the password value would build
        // `Basic base64("test-password:")` and never match.
        expect(bindings[0]?.basicHalf).toBe("username");
    });

    it("basic auth with usernameOmit: emits auth_provider with BasicAuthProvider::password_only", () => {
        const bindings = detectAuthBindings({
            auth: auth(basic({ key: "BasicAuth", usernameOmit: true, passwordEnvVar: "ACME_PASS" })),
            binaryName: "acme"
        });
        expect(bindings[0]?.rustCall).toBe(
            '.auth_provider("BasicAuth", BasicAuthProvider::password_only("BasicAuth", AuthCredentialSource::from_env("ACME_PASS")))'
        );
        expect(bindings[0]?.basicHalf).toBe("password");
    });

    it("basic auth with both halves omitted: skipped — nothing left to bind", () => {
        const bindings = detectAuthBindings({
            auth: auth(basic({ key: "BasicAuth", usernameOmit: true, passwordOmit: true })),
            binaryName: "acme"
        });
        expect(bindings).toEqual([]);
    });

    it("basic auth with no env vars falls back to <BIN>_USERNAME / <BIN>_PASSWORD", () => {
        const bindings = detectAuthBindings({
            auth: auth(basic({ key: "BasicAuth" })),
            binaryName: "acme"
        });
        expect(bindings[0]?.rustCall).toBe(
            '.auth(BasicAuth::new("BasicAuth").username_env("ACME_USERNAME").password_env("ACME_PASSWORD"))'
        );
        expect(bindings[0]?.placement).toBe("root");
    });

    it("multiple schemes all produce bindings, in declared order", () => {
        const bindings = detectAuthBindings({
            auth: auth(
                basic({ key: "ApiKeyAuth", usernameEnvVar: "CLOSE_API_KEY", passwordOmit: true }),
                bearer({ key: "OAuth2" })
            ),
            binaryName: "close"
        });
        expect(bindings).toHaveLength(2);
        expect(bindings[0]?.rustCall).toContain('.auth_provider("ApiKeyAuth", BasicAuthProvider::username_only(');
        expect(bindings[0]?.placement).toBe("binding");
        expect(bindings[1]?.rustCall).toBe('.auth(BearerAuth::new("OAuth2").env("CLOSE_TOKEN"))');
        expect(bindings[1]?.placement).toBe("root");
    });

    // The complete client-credentials binding is covered end-to-end by the
    // `cli-oauth` seed, which exercises a real parsed IR. Focused descriptor
    // rendering and endpoint resolution helpers are tested below.

    it("skips an oauth client-credentials scheme when its token endpoint can't be resolved (no throw)", () => {
        const bodyProp = (wireValue: string): FernIr.RequestProperty => ({
            propertyPath: undefined,
            property: FernIr.RequestPropertyValue.body({
                name: wireValue,
                valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                propertyAccess: undefined,
                availability: undefined,
                docs: undefined,
                defaultValue: undefined,
                v2Examples: undefined
            })
        });
        const responseProp = (wireValue: string): FernIr.ResponseProperty => ({
            propertyPath: undefined,
            property: {
                name: wireValue,
                valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                propertyAccess: undefined,
                availability: undefined,
                docs: undefined,
                defaultValue: undefined,
                v2Examples: undefined
            }
        });
        const oauth = FernIr.AuthScheme.oauth({
            key: "OAuth2",
            docs: undefined,
            configuration: FernIr.OAuthConfiguration.clientCredentials({
                clientIdEnvVar: undefined,
                clientSecretEnvVar: undefined,
                tokenPrefix: undefined,
                tokenHeader: undefined,
                scopes: undefined,
                tokenEndpoint: {
                    endpointReference: { endpointId: "missing", serviceId: "svc", subpackageId: undefined },
                    requestProperties: {
                        clientId: bodyProp("client_id"),
                        clientSecret: bodyProp("client_secret"),
                        scopes: undefined,
                        customProperties: undefined
                    },
                    responseProperties: {
                        accessToken: responseProp("access_token"),
                        expiresIn: undefined,
                        refreshToken: undefined
                    }
                },
                refreshEndpoint: undefined
            })
        });
        // `services` is empty, so the token endpoint reference can't be resolved.
        // The scheme is skipped rather than throwing and aborting generation.
        expect(
            detectAuthBindings({ auth: auth(oauth), binaryName: "acme", services: {}, environments: undefined })
        ).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// OAuth descriptor rendering and endpoint resolution helpers
// ---------------------------------------------------------------------------

describe("renderRequestProperty", () => {
    it("renders nested body request paths", () => {
        expect(
            renderRequestProperty({
                location: "body",
                path: ["credentials", "client_id"],
                value: "OAuth2RequestValue::ClientId"
            })
        ).toBe('OAuth2RequestProperty::body(["credentials", "client_id"], OAuth2RequestValue::ClientId)');
    });

    it("preserves repeated query parameter serialization", () => {
        expect(
            renderRequestProperty({
                location: "query",
                path: ["audience"],
                value: "OAuth2RequestValue::ScopesList",
                allowMultiple: true
            })
        ).toBe('OAuth2RequestProperty::query_multiple("audience", OAuth2RequestValue::ScopesList)');
    });
});

const singleEnv = (args: { url: string; id?: string; defaultEnvironment?: string }): FernIr.EnvironmentsConfig => ({
    defaultEnvironment: args.defaultEnvironment,
    environments: FernIr.Environments.singleBaseUrl({
        environments: [
            {
                id: args.id ?? "prod",
                name: "Production",
                url: args.url,
                audiences: undefined,
                defaultUrl: undefined,
                urlTemplate: undefined,
                urlVariables: undefined,
                docs: undefined
            }
        ]
    })
});

const multiEnv = (args: { urls: Record<string, string>; defaultEnvironment?: string }): FernIr.EnvironmentsConfig => ({
    defaultEnvironment: args.defaultEnvironment,
    environments: FernIr.Environments.multipleBaseUrls({
        baseUrls: Object.keys(args.urls).map((id) => ({ id, name: id })),
        environments: [
            {
                id: args.defaultEnvironment ?? "prod",
                name: "Production",
                urls: args.urls,
                audiences: undefined,
                defaultUrls: undefined,
                urlTemplates: undefined,
                urlVariables: undefined,
                docs: undefined
            }
        ]
    })
});

describe("resolveDefaultBaseUrl", () => {
    it("returns the pinned default single-base-url environment's URL", () => {
        expect(
            resolveDefaultBaseUrl({
                environments: singleEnv({ url: "https://api.example.com", id: "prod", defaultEnvironment: "prod" }),
                baseUrlId: undefined
            })
        ).toBe("https://api.example.com");
    });

    it("falls back to the first environment when no default is pinned", () => {
        expect(
            resolveDefaultBaseUrl({
                environments: singleEnv({ url: "https://api.example.com", defaultEnvironment: undefined }),
                baseUrlId: undefined
            })
        ).toBe("https://api.example.com");
    });

    it("returns undefined when the API declares no environment", () => {
        expect(resolveDefaultBaseUrl({ environments: undefined, baseUrlId: undefined })).toBeUndefined();
    });

    it("selects the endpoint's pinned base URL from a multi-base-url environment", () => {
        expect(
            resolveDefaultBaseUrl({
                environments: multiEnv({
                    urls: { auth: "https://auth.example.com", api: "https://api.example.com" },
                    defaultEnvironment: "prod"
                }),
                baseUrlId: "auth"
            })
        ).toBe("https://auth.example.com");
    });
});

describe("renderFullPath", () => {
    it("ensures a leading slash", () => {
        expect(renderFullPath({ head: "identity/token", parts: [] })).toBe("/identity/token");
    });

    it("renders path parameters inline", () => {
        expect(renderFullPath({ head: "/orgs/", parts: [{ pathParameter: "orgId", tail: "/token" }] })).toBe(
            "/orgs/{orgId}/token"
        );
    });
});

describe("joinUrl", () => {
    it("joins base URL and path with a single slash", () => {
        expect(joinUrl("https://api.example.com/", "/token")).toBe("https://api.example.com/token");
        expect(joinUrl("https://api.example.com", "token")).toBe("https://api.example.com/token");
    });

    it("preserves a base-path segment on the base URL", () => {
        expect(joinUrl("https://api.example.com/v1", "/token")).toBe("https://api.example.com/v1/token");
    });
});

describe("detectAuthBindings — public-client OAuth login flows", () => {
    const authorizationCode = (overrides: {
        clientId?: FernIr.OAuthPublicClientId;
        redirectUri?: string;
        redirectUriBackupPorts?: number[];
        scopes?: string[];
        authorizationParameters?: Record<string, string>;
        tokenParameters?: Record<string, string>;
    }): FernIr.AuthScheme =>
        FernIr.AuthScheme.oauth({
            key: "MyOAuth",
            docs: undefined,
            configuration: FernIr.OAuthConfiguration.authorizationCode({
                clientId: overrides.clientId ?? FernIr.OAuthPublicClientId.literal("public-client-id"),
                authorizationUrl: "https://auth.example.com/authorize",
                tokenUrl: "https://auth.example.com/token",
                refreshUrl: undefined,
                redirectUri: overrides.redirectUri,
                redirectUriBackupPorts: overrides.redirectUriBackupPorts,
                scopes: overrides.scopes,
                pkce: { method: FernIr.OAuthPkceMethod.S256 },
                authorizationParameters: overrides.authorizationParameters,
                tokenParameters: overrides.tokenParameters,
                refreshParameters: undefined,
                tokenHeader: undefined,
                tokenPrefix: undefined
            })
        });

    const deviceCode = (overrides: { scopes?: string[] }): FernIr.AuthScheme =>
        FernIr.AuthScheme.oauth({
            key: "MyOAuth",
            docs: undefined,
            configuration: FernIr.OAuthConfiguration.deviceCode({
                clientId: FernIr.OAuthPublicClientId.literal("public-client-id"),
                deviceAuthorizationUrl: "https://auth.example.com/device/code",
                tokenUrl: "https://auth.example.com/token",
                refreshUrl: undefined,
                scopes: overrides.scopes,
                deviceAuthorizationParameters: undefined,
                tokenParameters: undefined,
                refreshParameters: undefined,
                tokenHeader: undefined,
                tokenPrefix: undefined
            })
        });

    it("emits a root PkceLoginFlow for the authorization-code flow", () => {
        const [binding, ...rest] = detectAuthBindings({
            auth: auth(
                authorizationCode({
                    scopes: ["openid", "offline_access"],
                    redirectUri: "http://127.0.0.1:8484/callback"
                })
            ),
            binaryName: "acme"
        });
        expect(rest).toEqual([]);
        expect(binding?.placement).toBe("root");
        expect(binding?.authTypeImport).toBe("PkceLoginFlow");
        expect(binding?.kind).toBe("oauth-authorization-code");
        expect(binding?.envVars).toEqual([]);
        expect(binding?.rustCall).toBe(
            '.login_flow(PkceLoginFlow::new("MyOAuth")' +
                '.client_id("public-client-id")' +
                '.authorization_url("https://auth.example.com/authorize")' +
                '.token_url("https://auth.example.com/token")' +
                '.scopes(["openid", "offline_access"])' +
                ".redirect_port(8484))"
        );
    });

    it("omits redirect_port when no redirect-uri is configured (ephemeral)", () => {
        const [binding] = detectAuthBindings({ auth: auth(authorizationCode({})), binaryName: "acme" });
        expect(binding?.rustCall).not.toContain("redirect_port");
        expect(binding?.rustCall).toContain('PkceLoginFlow::new("MyOAuth")');
    });

    it("emits redirect_ports (primary + backups) when backup ports are configured", () => {
        const [binding] = detectAuthBindings({
            auth: auth(
                authorizationCode({
                    redirectUri: "http://127.0.0.1:8484/callback",
                    redirectUriBackupPorts: [8483, 8482]
                })
            ),
            binaryName: "acme"
        });
        expect(binding?.rustCall).toContain(".redirect_ports([8484, 8483, 8482])");
        // The single-port setter must not also be emitted.
        expect(binding?.rustCall).not.toContain(".redirect_port(");
    });

    it("emits redirect_host and redirect_path when a non-default loopback host/path is configured", () => {
        const [binding] = detectAuthBindings({
            auth: auth(
                authorizationCode({
                    redirectUri: "http://localhost:8484/oauth/callback",
                    redirectUriBackupPorts: [8483]
                })
            ),
            binaryName: "acme"
        });
        expect(binding?.rustCall).toContain('.redirect_host("localhost")');
        expect(binding?.rustCall).toContain('.redirect_path("/oauth/callback")');
        expect(binding?.rustCall).toContain(".redirect_ports([8484, 8483])");
    });

    it("omits redirect_host and redirect_path for the default 127.0.0.1/callback loopback", () => {
        const [binding] = detectAuthBindings({
            auth: auth(authorizationCode({ redirectUri: "http://127.0.0.1:8484/callback" })),
            binaryName: "acme"
        });
        expect(binding?.rustCall).not.toContain(".redirect_host(");
        expect(binding?.rustCall).not.toContain(".redirect_path(");
    });

    it("emits no param setters when no extra params are configured (byte-identical output)", () => {
        const [binding] = detectAuthBindings({
            auth: auth(authorizationCode({ scopes: ["openid"] })),
            binaryName: "acme"
        });
        expect(binding?.rustCall).not.toContain("authorization_params");
        expect(binding?.rustCall).not.toContain("token_params");
        expect(binding?.rustCall).not.toContain("refresh_params");
    });

    it("emits authorization_params and token_params (e.g. Auth0 audience) when configured", () => {
        const [binding] = detectAuthBindings({
            auth: auth(
                authorizationCode({
                    authorizationParameters: { audience: "https://api.acme.io" },
                    tokenParameters: { audience: "https://api.acme.io" }
                })
            ),
            binaryName: "acme"
        });
        expect(binding?.rustCall).toContain('.authorization_params([("audience", "https://api.acme.io")])');
        expect(binding?.rustCall).toContain('.token_params([("audience", "https://api.acme.io")])');
    });

    it("skips the authorization-code flow when the client ID is an environment variable (unsupported)", () => {
        const bindings = detectAuthBindings({
            auth: auth(
                authorizationCode({ clientId: FernIr.OAuthPublicClientId.environmentVariable("ACME_CLIENT_ID") })
            ),
            binaryName: "acme"
        });
        expect(bindings).toEqual([]);
    });

    it("emits a root DeviceCodeLoginFlow for the device-code flow", () => {
        const [binding, ...rest] = detectAuthBindings({
            auth: auth(deviceCode({ scopes: ["openid"] })),
            binaryName: "acme"
        });
        expect(rest).toEqual([]);
        expect(binding?.placement).toBe("root");
        expect(binding?.authTypeImport).toBe("DeviceCodeLoginFlow");
        expect(binding?.kind).toBe("oauth-device-code");
        expect(binding?.rustCall).toBe(
            '.login_flow(DeviceCodeLoginFlow::new("MyOAuth")' +
                '.client_id("public-client-id")' +
                '.device_authorization_url("https://auth.example.com/device/code")' +
                '.token_url("https://auth.example.com/token")' +
                '.scopes(["openid"]))'
        );
    });
});
