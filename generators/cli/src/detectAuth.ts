import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { toEnvVarPrefix } from "./identity.js";

/**
 * One auth binding to emit in the generated `main.rs`. The `rustCall`
 * string is the literal method-chain fragment; the rendering layer
 * splices these into the `CliApp::new(...)` builder at either root level
 * (typed builders like `BearerAuth`) or binding level (on `OpenApiBinding`).
 */
export interface DetectedAuthBinding {
    /** Scheme name as declared in `generators.yml`'s `auth-schemes` (the IR's `key`). */
    schemeName: string;
    /** Literal Rust method-chain call, minus the leading whitespace. */
    rustCall: string;
    /** Where this auth binding should be placed in the generated main.rs. */
    placement: "root" | "binding";
    /** Rust type to import from `fern_cli_sdk::auth`, if any. */
    authTypeImport: string | null;
    /** Resolved environment variable names the user must set for this binding. */
    envVars: string[];
    /** Environment variables that add optional auth request properties when set. */
    optionalEnvVars?: string[];
    /** Auth kind for documentation purposes. */
    kind: "bearer" | "header" | "basic" | "oauth-client-credentials" | "oauth-authorization-code" | "oauth-device-code";
    /**
     * For `basic`, which half of the credential {@link DetectedAuthBinding.envVars}
     * supplies — `"both"` means `[username, password]` in that order. The wire-test
     * manifest needs it to seed the *exact* credential `mock-utils` encodes into
     * its `Authorization: Basic <base64>` matcher; seeding the wrong half produces
     * a valid-looking header that can never match.
     */
    basicHalf?: "username" | "password" | "both";
    /**
     * For `oauth-client-credentials`, the resolved token-endpoint contract the
     * generated CLI actually calls at runtime. Consumed by the wire-test
     * generator: because the CLI performs a real token exchange before every
     * authenticated request (and the token URL honors the `--base-url`
     * override), the wire-test mock server must serve this endpoint too, or
     * every authenticated endpoint's test 404s on the token fetch. Present
     * only when the OAuth binding was successfully emitted — a scheme whose
     * token endpoint couldn't be built (skipped, `rustCall` absent) never
     * produces a binding at all, so no mock is needed.
     */
    oauthTokenEndpoint?: {
        /** Uppercase HTTP method the token exchange uses (e.g. "POST"). */
        method: string;
        /** Token endpoint path, `{param}`-free (e.g. "/v1/oauth/token"). */
        path: string;
        /** Dotted path (segments) to the access token in the response JSON. */
        accessTokenPath: string[];
        /** Dotted path to the expiry, or null when the token endpoint omits it. */
        expiresInPath: string[] | null;
    };
}

/**
 * Visit each scheme in the IR's `auth.schemes` and emit a binding
 * for the variants the SDK supports:
 *
 *   - `bearer` → `.auth(BearerAuth::new("<key>").env("<env>"))`
 *   - `header` → `.auth(ApiKeyAuth::new("<key>").source(...))` with a
 *     `--api-key` flag tried first, falling back to the env var
 *   - `basic` (both halves bound) → `.auth(BasicAuth::new("<key>").username_env(...).password_env(...))`
 *     at root, so `auth status` enumerates the scheme [FER-11474]. The
 *     root `BasicAuth` builder lowers to the same `SchemeBinding::Basic`
 *     as the binding-level `.auth_basic_scheme(...)` and still propagates
 *     to the binding via `set_root_auth`, so request-time auth is unchanged.
 *   - `basic` with `passwordOmit: true` →
 *     `.auth_provider("<key>", BasicAuthProvider::username_only(...))` —
 *     stays binding-level; no root path exists for `BasicAuthProvider`.
 *   - `basic` with `usernameOmit: true` → symmetric
 *     `.auth_provider("<key>", BasicAuthProvider::password_only(...))`
 *   - `basic` with both omitted → skipped (nothing to bind)
 *   - `oauth` with a `clientCredentials` configuration → root-level
 *     `.auth(OAuth2Auth::new(...)...)`. Token and refresh endpoint
 *     references, request/response mappings, environment URLs, scopes,
 *     and token application settings are lowered into structured runtime
 *     descriptors. Client id/secret env vars come from the IR
 *     (`clientIdEnvVar` / `clientSecretEnvVar`), falling back to
 *     `<BIN>_CLIENT_ID` / `<BIN>_CLIENT_SECRET`. Required custom request
 *     properties receive deterministic env vars; optional properties are
 *     included only when their generated env vars are set.
 *     Unresolvable or unsupported token-endpoint contracts (missing endpoint,
 *     path params, unsupported content type, nested form body) skip the scheme
 *     rather than failing generation; an unsupported refresh endpoint drops
 *     just the refresh path. Endpoints without a default server use the runtime
 *     base URL. Interactive flows (PKCE, device-code) are not modeled by the IR
 *     and are not emitted.
 *   - `inferred` / unknown → skipped (no runtime provider).
 *
 * Env-var names come from the IR first (`usernameEnvVar`,
 * `passwordEnvVar`, `tokenEnvVar`, `headerEnvVar`). When the IR doesn't
 * pin one, we fall back to `<BIN>_<KIND>`.
 */
export function detectAuthBindings(args: {
    auth: { schemes: FernIr.AuthScheme[] };
    binaryName: string;
    /** IR services, used to resolve an OAuth token endpoint reference to a path. */
    services?: Record<string, FernIr.HttpService>;
    /** IR environments, used to resolve the OAuth token endpoint base URL. */
    environments?: FernIr.EnvironmentsConfig;
}): DetectedAuthBinding[] {
    const { auth, binaryName, services = {}, environments } = args;
    const envPrefix = toEnvVarPrefix(binaryName);

    // When the spec declares more than one `header` API-key scheme, a shared
    // `--api-key` flag would collide (clap dedupes the arg, so both schemes
    // would resolve from the same value). Disambiguate by deriving the flag
    // from each scheme's key in that case; keep the conventional `--api-key`
    // for the overwhelmingly common single-scheme case.
    const multipleHeaderSchemes = auth.schemes.filter((scheme) => scheme.type === "header").length > 1;

    const bindings: DetectedAuthBinding[] = [];
    for (const scheme of auth.schemes) {
        const binding = bindingForScheme({ scheme, envPrefix, multipleHeaderSchemes, services, environments });
        if (binding != null) {
            bindings.push(binding);
        }
    }
    return bindings;
}

function bindingForScheme(args: {
    scheme: FernIr.AuthScheme;
    envPrefix: string;
    multipleHeaderSchemes: boolean;
    services: Record<string, FernIr.HttpService>;
    environments: FernIr.EnvironmentsConfig | undefined;
}): DetectedAuthBinding | null {
    const { scheme, envPrefix, multipleHeaderSchemes, services, environments } = args;
    return visitDiscriminatedUnion(scheme)._visit<DetectedAuthBinding | null>({
        bearer: (bearer) => {
            const env = bearer.tokenEnvVar ?? `${envPrefix}_TOKEN`;
            return {
                schemeName: bearer.key,
                rustCall: `.auth(BearerAuth::new("${bearer.key}").env("${env}"))`,
                placement: "root",
                authTypeImport: "BearerAuth",
                envVars: [env],
                kind: "bearer"
            };
        },
        header: (header) => {
            const env = header.headerEnvVar ?? `${envPrefix}_API_KEY`;
            // `toEnvVarPrefix` is camelCase/Pascal/acronym-aware (unlike
            // `toKebabCase`, which lowercases before splitting), so "ApiKey"
            // becomes "api-key" rather than "apikey".
            const flag = multipleHeaderSchemes
                ? toEnvVarPrefix(header.key).toLowerCase().replace(/_/g, "-")
                : "api-key";
            // Flag-then-env fallback: the flag is tried first, falling back to
            // the env var. `.cli()` and `.env()` on the builder overwrite each
            // other, so the chain has to go through `.source(Chain([...]))`
            // rather than `.cli().env()`.
            return {
                schemeName: header.key,
                rustCall: `.auth(ApiKeyAuth::new("${header.key}").source(AuthCredentialSource::any(vec![AuthCredentialSource::cli("${flag}"), AuthCredentialSource::from_env("${env}")])))`,
                placement: "root",
                authTypeImport: "ApiKeyAuth, AuthCredentialSource",
                envVars: [env],
                kind: "header"
            };
        },
        basic: (basic) => {
            const usernameEnv = basic.usernameEnvVar ?? `${envPrefix}_USERNAME`;
            const passwordEnv = basic.passwordEnvVar ?? `${envPrefix}_PASSWORD`;

            // Both halves omitted → no credential source to bind.
            if (basic.usernameOmit && basic.passwordOmit) {
                return null;
            }
            // password omitted → API key in the username slot.
            if (basic.passwordOmit) {
                return {
                    schemeName: basic.key,
                    rustCall: `.auth_provider("${basic.key}", BasicAuthProvider::username_only("${basic.key}", AuthCredentialSource::from_env("${usernameEnv}")))`,
                    placement: "binding",
                    authTypeImport: "AuthCredentialSource, BasicAuthProvider",
                    envVars: [usernameEnv],
                    kind: "basic",
                    basicHalf: "username"
                };
            }
            if (basic.usernameOmit) {
                return {
                    schemeName: basic.key,
                    rustCall: `.auth_provider("${basic.key}", BasicAuthProvider::password_only("${basic.key}", AuthCredentialSource::from_env("${passwordEnv}")))`,
                    placement: "binding",
                    authTypeImport: "AuthCredentialSource, BasicAuthProvider",
                    envVars: [passwordEnv],
                    kind: "basic",
                    basicHalf: "password"
                };
            }
            // Both halves bound → root-level typed builder. Placed at root
            // (like bearer/header) so the framework `auth` subcommand can
            // enumerate it; `set_root_auth` still propagates it down to the
            // binding for request-time credential resolution [FER-11474].
            return {
                schemeName: basic.key,
                rustCall: `.auth(BasicAuth::new("${basic.key}").username_env("${usernameEnv}").password_env("${passwordEnv}"))`,
                placement: "root",
                authTypeImport: "BasicAuth",
                envVars: [usernameEnv, passwordEnv],
                kind: "basic",
                basicHalf: "both"
            };
        },
        // OAuth: lower each configuration variant to the matching SDK builder.
        //   - client-credentials → `OAuth2Auth` (token exchange, resolved from the IR).
        //   - authorization-code (PKCE) → `PkceLoginFlow` via `.login_flow(...)`, a public-client
        //     browser login. `CliApp::login_flow` also registers the request-time
        //     `OAuth2KeyringProvider` automatically, so no separate `.auth(...)` is needed.
        //   - device-code → `DeviceCodeLoginFlow` via `.login_flow(...)`, same auto-provider wiring.
        oauth: (oauth) =>
            visitDiscriminatedUnion(oauth.configuration)._visit<DetectedAuthBinding | null>({
                clientCredentials: (clientCredentials) =>
                    clientCredentialsBinding({ key: oauth.key, clientCredentials, envPrefix, services, environments }),
                authorizationCode: (authorizationCode) =>
                    authorizationCodeBinding({ key: oauth.key, authorizationCode }),
                deviceCode: (deviceCode) => deviceCodeBinding({ key: oauth.key, deviceCode }),
                _other: () => null
            }),
        inferred: () => null,
        // Future IR auth variants we don't know about yet.
        _other: () => null
    });
}

function clientCredentialsBinding(args: {
    key: string;
    clientCredentials: FernIr.OAuthClientCredentials;
    envPrefix: string;
    services: Record<string, FernIr.HttpService>;
    environments: FernIr.EnvironmentsConfig | undefined;
}): DetectedAuthBinding | null {
    const { key, clientCredentials, envPrefix, services, environments } = args;
    const clientIdEnv = clientCredentials.clientIdEnvVar ?? `${envPrefix}_CLIENT_ID`;
    const clientSecretEnv = clientCredentials.clientSecretEnvVar ?? `${envPrefix}_CLIENT_SECRET`;

    const envVars = [clientIdEnv, clientSecretEnv];
    const optionalEnvVars: string[] = [];

    // Resolve + render the token endpoint. If the endpoint contract can't be
    // faithfully built (missing/path-param endpoint, unsupported content type,
    // nested form body), skip the whole OAuth scheme rather than aborting the
    // entire CLI generation — matching the graceful skip when no base URL is
    // declared. Client-credentials can't work without a usable token endpoint.
    const tokenEndpoint = resolveOAuthEndpoint({
        endpointReference: clientCredentials.tokenEndpoint.endpointReference,
        services,
        environments
    });
    if (tokenEndpoint == null) {
        return null;
    }
    const tokenRendered = renderOAuthEndpoint({
        endpoint: tokenEndpoint,
        requestProperties: [
            requestPropertyBinding(clientCredentials.tokenEndpoint.requestProperties.clientId, "client-id"),
            requestPropertyBinding(clientCredentials.tokenEndpoint.requestProperties.clientSecret, "client-secret"),
            ...(clientCredentials.tokenEndpoint.requestProperties.scopes != null
                ? [requestPropertyBinding(clientCredentials.tokenEndpoint.requestProperties.scopes, "scopes")]
                : []),
            ...(clientCredentials.tokenEndpoint.requestProperties.customProperties ?? []).map((property) => {
                const binding = customRequestPropertyBinding({
                    property,
                    envPrefix,
                    schemeName: key,
                    endpointKind: "TOKEN"
                });
                if (binding.envVar != null) {
                    (binding.optional ? optionalEnvVars : envVars).push(binding.envVar);
                }
                return binding;
            })
        ],
        responseProperties: clientCredentials.tokenEndpoint.responseProperties
    });
    if (tokenRendered == null) {
        return null;
    }

    let rustCall = `.auth(OAuth2Auth::new(${rustString(key)})`;
    rustCall += `.client_id_env(${rustString(clientIdEnv)})`;
    rustCall += `.client_secret_env(${rustString(clientSecretEnv)})`;
    const scopes = clientCredentials.scopes ?? [];
    if (scopes.length > 0) {
        rustCall += `.scopes([${scopes.map(rustString).join(", ")}])`;
    }
    rustCall += `.token_header(${rustString(clientCredentials.tokenHeader ?? "Authorization")})`;
    rustCall += `.token_prefix(${rustString(clientCredentials.tokenPrefix ?? "Bearer")})`;
    rustCall += `.token_endpoint(${tokenRendered})`;

    // The refresh endpoint is optional. If it can't be built, omit just the
    // refresh path and keep the token endpoint — client-credentials still works,
    // re-authenticating on expiry instead of refreshing.
    if (clientCredentials.refreshEndpoint != null) {
        const refreshEndpoint = resolveOAuthEndpoint({
            endpointReference: clientCredentials.refreshEndpoint.endpointReference,
            services,
            environments
        });
        if (refreshEndpoint != null) {
            const refreshProperties = inferRefreshRequestProperties({
                endpoint: refreshEndpoint.endpoint,
                refreshToken: clientCredentials.refreshEndpoint.requestProperties.refreshToken,
                tokenRequestProperties: clientCredentials.tokenEndpoint.requestProperties,
                envPrefix,
                schemeName: key
            });
            const refreshRendered = renderOAuthEndpoint({
                endpoint: refreshEndpoint,
                requestProperties: refreshProperties,
                responseProperties: clientCredentials.refreshEndpoint.responseProperties
            });
            if (refreshRendered != null) {
                for (const property of refreshProperties) {
                    if (property.envVar != null) {
                        (property.optional ? optionalEnvVars : envVars).push(property.envVar);
                    }
                }
                rustCall += `.refresh_endpoint(${refreshRendered})`;
            }
        }
    }
    rustCall += ")";

    const responseProperties = clientCredentials.tokenEndpoint.responseProperties;
    return {
        schemeName: key,
        rustCall,
        placement: "root",
        authTypeImport: "OAuth2Auth, OAuth2Endpoint, OAuth2RequestProperty, OAuth2RequestValue",
        envVars: [...new Set(envVars)],
        optionalEnvVars: [...new Set(optionalEnvVars)],
        kind: "oauth-client-credentials",
        oauthTokenEndpoint: {
            method: String(tokenEndpoint.endpoint.method),
            path: tokenEndpoint.path,
            accessTokenPath: responsePropertyPath(responseProperties.accessToken),
            expiresInPath:
                responseProperties.expiresIn != null ? responsePropertyPath(responseProperties.expiresIn) : null
        }
    };
}

/**
 * Authorization Code + PKCE (public client). Emits a `PkceLoginFlow` registered via
 * `CliApp::login_flow(...)`, which also wires the request-time `OAuth2KeyringProvider` so
 * authenticated requests send `Authorization: Bearer <token>` with refresh-on-expiry.
 *
 * The SDK builder currently consumes `client_id`, `authorization_url`, `token_url`, `scopes`,
 * and the loopback redirect (host, path, and one or more ports). The IR's `refreshUrl` and
 * `tokenHeader`/`tokenPrefix` are not yet consumable by the builder and are intentionally not
 * emitted; an environment-variable client ID is likewise unsupported for now (skip).
 */
function authorizationCodeBinding(args: {
    key: string;
    authorizationCode: FernIr.OAuthAuthorizationCode;
}): DetectedAuthBinding | null {
    const { key, authorizationCode } = args;
    const clientId = literalPublicClientId(authorizationCode.clientId);
    if (clientId == null) {
        return null;
    }

    let rustCall = `.login_flow(PkceLoginFlow::new(${rustString(key)})`;
    rustCall += `.client_id(${rustString(clientId)})`;
    rustCall += `.authorization_url(${rustString(authorizationCode.authorizationUrl)})`;
    rustCall += `.token_url(${rustString(authorizationCode.tokenUrl)})`;
    const scopes = authorizationCode.scopes ?? [];
    if (scopes.length > 0) {
        rustCall += `.scopes([${scopes.map(rustString).join(", ")}])`;
    }
    // When `redirectUri` is set, honor its host/port/path exactly (they must match the server's
    // registration). Otherwise the flow binds an ephemeral (OS-assigned) 127.0.0.1 port per RFC
    // 8252. Backup ports (`redirectUriBackupPorts`) are tried, in order, if the primary is busy.
    // Host/path setters are emitted only when they differ from the runtime defaults (127.0.0.1,
    // /callback), so a conventional config produces byte-identical output.
    const redirect = parseLoopbackRedirect(authorizationCode.redirectUri);
    if (redirect != null) {
        if (redirect.host !== "127.0.0.1") {
            rustCall += `.redirect_host(${rustString(redirect.host)})`;
        }
        if (redirect.path !== "/callback") {
            rustCall += `.redirect_path(${rustString(redirect.path)})`;
        }
        const backupPorts = authorizationCode.redirectUriBackupPorts ?? [];
        if (backupPorts.length > 0) {
            rustCall += `.redirect_ports([${[redirect.port, ...backupPorts].join(", ")}])`;
        } else {
            rustCall += `.redirect_port(${redirect.port})`;
        }
    }
    // Hosted pages the loopback listener redirects the browser to once the callback is handled.
    // Omitted when unset, so the listener keeps rendering its built-in pages.
    if (authorizationCode.successRedirectUrl != null) {
        rustCall += `.success_redirect_url(${rustString(authorizationCode.successRedirectUrl)})`;
    }
    if (authorizationCode.errorRedirectUrl != null) {
        rustCall += `.error_redirect_url(${rustString(authorizationCode.errorRedirectUrl)})`;
    }
    // Extra literal params (e.g. Auth0 `audience`). Optional — emitted only when present, so a
    // config without them produces byte-identical output.
    rustCall += renderParams("authorization_params", authorizationCode.authorizationParameters);
    rustCall += renderParams("token_params", authorizationCode.tokenParameters);
    rustCall += renderParams("refresh_params", authorizationCode.refreshParameters);
    rustCall += ")";

    return {
        schemeName: key,
        rustCall,
        placement: "root",
        authTypeImport: "PkceLoginFlow",
        envVars: [],
        kind: "oauth-authorization-code"
    };
}

/**
 * Device Authorization Grant (RFC 8628, public client). Emits a `DeviceCodeLoginFlow` registered
 * via `CliApp::login_flow(...)` (same auto-wired request-time provider as PKCE). Same builder
 * limitations as {@link authorizationCodeBinding} for refresh/params/token application.
 */
function deviceCodeBinding(args: { key: string; deviceCode: FernIr.OAuthDeviceCode }): DetectedAuthBinding | null {
    const { key, deviceCode } = args;
    const clientId = literalPublicClientId(deviceCode.clientId);
    if (clientId == null) {
        return null;
    }

    let rustCall = `.login_flow(DeviceCodeLoginFlow::new(${rustString(key)})`;
    rustCall += `.client_id(${rustString(clientId)})`;
    rustCall += `.device_authorization_url(${rustString(deviceCode.deviceAuthorizationUrl)})`;
    rustCall += `.token_url(${rustString(deviceCode.tokenUrl)})`;
    const scopes = deviceCode.scopes ?? [];
    if (scopes.length > 0) {
        rustCall += `.scopes([${scopes.map(rustString).join(", ")}])`;
    }
    rustCall += renderParams("device_authorization_params", deviceCode.deviceAuthorizationParameters);
    rustCall += renderParams("token_params", deviceCode.tokenParameters);
    rustCall += renderParams("refresh_params", deviceCode.refreshParameters);
    rustCall += ")";

    return {
        schemeName: key,
        rustCall,
        placement: "root",
        authTypeImport: "DeviceCodeLoginFlow",
        envVars: [],
        kind: "oauth-device-code"
    };
}

/**
 * Resolves a public client ID to its literal string. Environment-variable client IDs are not yet
 * supported by the login-flow builders and yield `undefined` (the caller skips the binding).
 */
function literalPublicClientId(clientId: FernIr.OAuthPublicClientId): string | undefined {
    return visitDiscriminatedUnion(clientId)._visit<string | undefined>({
        literal: (literal) => literal.value,
        environmentVariable: () => undefined,
        _other: () => undefined
    });
}

/**
 * Renders an optional literal-parameter map as a Rust builder call, e.g.
 * `.token_params([("audience", "https://api.example.com")])`. Returns an empty string when the
 * map is absent or empty, so a config without extra params produces byte-identical output. Keys
 * are sorted for deterministic output.
 */
function renderParams(setter: string, params: Record<string, string> | undefined): string {
    if (params == null) {
        return "";
    }
    const entries = Object.entries(params).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    if (entries.length === 0) {
        return "";
    }
    const pairs = entries.map(([key, value]) => `(${rustString(key)}, ${rustString(value)})`).join(", ");
    return `.${setter}([${pairs}])`;
}

/**
 * Extracts the port from a loopback redirect URI (e.g. `http://127.0.0.1:8484/callback` → 8484).
 * Returns undefined when the URI is absent, unparseable, or omits a port (ephemeral).
 */
function parseLoopbackRedirect(
    redirectUri: string | undefined
): { host: string; path: string; port: number } | undefined {
    if (redirectUri == null) {
        return undefined;
    }
    try {
        const parsed = new URL(redirectUri);
        if (parsed.port === "") {
            return undefined;
        }
        const port = Number(parsed.port);
        if (!Number.isInteger(port) || port <= 0 || port >= 65536) {
            return undefined;
        }
        return { host: parsed.hostname, path: parsed.pathname, port };
    } catch {
        return undefined;
    }
}

interface ResolvedOAuthEndpoint {
    endpoint: FernIr.HttpEndpoint;
    defaultUrl: string;
    path: string;
    useBaseUrlOverride: boolean;
}

export interface OAuthRequestPropertyBinding {
    location: "body" | "query";
    path: string[];
    value: string;
    allowMultiple?: boolean;
    envVar?: string;
    optional?: boolean;
}

function resolveOAuthEndpoint(args: {
    endpointReference: FernIr.EndpointReference;
    services: Record<string, FernIr.HttpService>;
    environments: FernIr.EnvironmentsConfig | undefined;
}): ResolvedOAuthEndpoint | null {
    const { endpointReference, services, environments } = args;
    const endpoint = services[endpointReference.serviceId]?.endpoints.find(
        (candidate) => candidate.id === endpointReference.endpointId
    );
    // The token endpoint reference doesn't resolve to an endpoint in the IR.
    if (endpoint == null) {
        return null;
    }
    // The CLI builds the token request internally, so it has no way to source
    // path-parameter values — a token endpoint with path params can't be built.
    if (endpoint.fullPath.parts.length > 0) {
        return null;
    }
    const path = renderFullPath(endpoint.fullPath);
    const baseUrl = resolveDefaultBaseUrl({ environments, baseUrlId: endpoint.baseUrl });
    const useBaseUrlOverride =
        baseUrl == null ||
        (environments != null &&
            visitDiscriminatedUnion(environments.environments)._visit({
                singleBaseUrl: () => true,
                multipleBaseUrls: () => false,
                _other: () => false
            }));
    return {
        endpoint,
        defaultUrl: baseUrl == null ? path : joinUrl(baseUrl, path),
        path,
        useBaseUrlOverride
    };
}

function renderOAuthEndpoint(args: {
    endpoint: ResolvedOAuthEndpoint;
    requestProperties: OAuthRequestPropertyBinding[];
    responseProperties: FernIr.OAuthAccessTokenResponseProperties;
}): string | null {
    const { endpoint, requestProperties, responseProperties } = args;
    const contentType = endpoint.endpoint.requestBody?.contentType ?? "application/json";
    // The runtime can only serialize a JSON or form-urlencoded token body.
    if (
        requestProperties.some((property) => property.location === "body") &&
        contentType !== "application/json" &&
        !contentType.endsWith("+json") &&
        contentType !== "application/x-www-form-urlencoded"
    ) {
        return null;
    }
    // Form encoding is flat `key=value`; a nested body path can't be expressed.
    if (
        contentType === "application/x-www-form-urlencoded" &&
        requestProperties.some((property) => property.location === "body" && property.path.length > 1)
    ) {
        return null;
    }

    let rendered = `OAuth2Endpoint::new(${rustString(endpoint.defaultUrl)}, ${rustString(endpoint.path)})`;
    rendered += `.method(${rustString(String(endpoint.endpoint.method))})`;
    if (endpoint.useBaseUrlOverride) {
        rendered += ".use_base_url_override()";
    }
    if (requestProperties.some((property) => property.location === "body")) {
        rendered +=
            contentType === "application/x-www-form-urlencoded"
                ? ".form_body()"
                : `.json_body(${rustString(contentType)})`;
    }
    for (const property of requestProperties) {
        rendered += `.request_property(${renderRequestProperty(property)})`;
    }
    rendered += `.access_token_path(${renderRustStringArray(responsePropertyPath(responseProperties.accessToken))})`;
    if (responseProperties.expiresIn != null) {
        rendered += `.expires_in_path(${renderRustStringArray(responsePropertyPath(responseProperties.expiresIn))})`;
    }
    if (responseProperties.refreshToken != null) {
        rendered += `.refresh_token_path(${renderRustStringArray(responsePropertyPath(responseProperties.refreshToken))})`;
    }
    return rendered;
}

export function renderRequestProperty(property: OAuthRequestPropertyBinding): string {
    if (property.location === "query") {
        const name = property.path[property.path.length - 1];
        if (name == null) {
            throw new Error("OAuth2 query request property is missing a name");
        }
        const builder = property.allowMultiple ? "query_multiple" : "query";
        return `OAuth2RequestProperty::${builder}(${rustString(name)}, ${property.value})`;
    }
    return `OAuth2RequestProperty::body(${renderRustStringArray(property.path)}, ${property.value})`;
}

function requestPropertyBinding(
    property: FernIr.RequestProperty,
    source: "client-id" | "client-secret" | "scopes" | "refresh-token"
): OAuthRequestPropertyBinding {
    const value = (() => {
        switch (source) {
            case "client-id":
                return "OAuth2RequestValue::ClientId";
            case "client-secret":
                return "OAuth2RequestValue::ClientSecret";
            case "scopes":
                return isListType(property.property.valueType)
                    ? "OAuth2RequestValue::ScopesList"
                    : "OAuth2RequestValue::Scopes";
            case "refresh-token":
                return "OAuth2RequestValue::RefreshToken";
        }
    })();
    return {
        location: property.property.type,
        path:
            property.property.type === "body"
                ? [
                      ...(property.propertyPath ?? []).map((item) => nameValue(item.name)),
                      wireValue(property.property.name)
                  ]
                : [wireValue(property.property.name)],
        allowMultiple: property.property.type === "query" ? property.property.allowMultiple : undefined,
        value
    };
}

function customRequestPropertyBinding(args: {
    property: FernIr.RequestProperty;
    envPrefix: string;
    schemeName: string;
    endpointKind: "TOKEN" | "REFRESH";
}): OAuthRequestPropertyBinding {
    const { property, envPrefix, schemeName, endpointKind } = args;
    const literal = literalValue(property.property.valueType);
    const defaultValue = property.property.defaultValue;
    const base = {
        location: property.property.type,
        path:
            property.property.type === "body"
                ? [
                      ...(property.propertyPath ?? []).map((item) => nameValue(item.name)),
                      wireValue(property.property.name)
                  ]
                : [wireValue(property.property.name)],
        allowMultiple: property.property.type === "query" ? property.property.allowMultiple : undefined
    };
    if (literal !== undefined || defaultValue !== undefined) {
        return {
            ...base,
            value: `OAuth2RequestValue::literal(serde_json::json!(${rustJsonValue(
                literal !== undefined ? literal : defaultValue
            )}))`
        };
    }
    const envVar = [envPrefix, envSegment(schemeName), endpointKind, ...base.path.map(envSegment)].join("_");
    const optional = isOptionalType(property.property.valueType);
    const envBuilder = optional ? "optional_env" : "env";
    return {
        ...base,
        value: `OAuth2RequestValue::${envBuilder}(${rustString(envVar)}, ${!isStringType(property.property.valueType)})`,
        envVar,
        optional
    };
}

function inferRefreshRequestProperties(args: {
    endpoint: FernIr.HttpEndpoint;
    refreshToken: FernIr.RequestProperty;
    tokenRequestProperties: FernIr.OAuthAccessTokenRequestProperties;
    envPrefix: string;
    schemeName: string;
}): OAuthRequestPropertyBinding[] {
    const { endpoint, refreshToken, tokenRequestProperties, envPrefix, schemeName } = args;
    const refreshTokenBinding = requestPropertyBinding(refreshToken, "refresh-token");
    const result: OAuthRequestPropertyBinding[] = [];
    const mappedKey = requestPropertyKey(refreshToken);
    const sourceByWireName = new Map<string, "client-id" | "client-secret" | "scopes">([
        [wireValue(tokenRequestProperties.clientId.property.name), "client-id"],
        [wireValue(tokenRequestProperties.clientSecret.property.name), "client-secret"]
    ]);
    if (tokenRequestProperties.scopes != null) {
        sourceByWireName.set(wireValue(tokenRequestProperties.scopes.property.name), "scopes");
    }

    const candidates: FernIr.RequestProperty[] = [
        ...endpoint.queryParameters.map((property) => ({
            propertyPath: [],
            property: FernIr.RequestPropertyValue.query(property)
        })),
        ...(endpoint.requestBody?.type === "inlinedRequestBody"
            ? endpoint.requestBody.properties.map((property) => ({
                  propertyPath: [],
                  property: FernIr.RequestPropertyValue.body(property)
              }))
            : [])
    ];
    for (const property of candidates) {
        if (requestPropertyKey(property) === mappedKey) {
            continue;
        }
        const source = sourceByWireName.get(wireValue(property.property.name));
        if (source != null) {
            result.push(requestPropertyBinding(property, source));
            continue;
        }
        const custom = customRequestPropertyBinding({
            property,
            envPrefix,
            schemeName,
            endpointKind: "REFRESH"
        });
        result.push(custom);
    }
    result.push(refreshTokenBinding);
    return result;
}

function requestPropertyKey(property: FernIr.RequestProperty): string {
    return `${property.property.type}:${(property.propertyPath ?? [])
        .map((item) => nameValue(item.name))
        .join(".")}:${wireValue(property.property.name)}`;
}

function responsePropertyPath(property: FernIr.ResponseProperty): string[] {
    return [...(property.propertyPath ?? []).map((item) => nameValue(item.name)), wireValue(property.property.name)];
}

function wireValue(name: FernIr.NameAndWireValueOrString): string {
    return typeof name === "string" ? name : name.wireValue;
}

function nameValue(name: FernIr.NameOrString): string {
    return typeof name === "string" ? name : name.originalName;
}

function isOptionalType(type: FernIr.TypeReference): boolean {
    return type.type === "container" && type.container.type === "optional";
}

function unwrapOptional(type: FernIr.TypeReference): FernIr.TypeReference {
    return isOptionalType(type) && type.type === "container" && type.container.type === "optional"
        ? type.container.optional
        : type;
}

function isListType(type: FernIr.TypeReference): boolean {
    const unwrapped = unwrapOptional(type);
    return unwrapped.type === "container" && unwrapped.container.type === "list";
}

function isStringType(type: FernIr.TypeReference): boolean {
    const unwrapped = unwrapOptional(type);
    return (
        unwrapped.type === "primitive" &&
        (unwrapped.primitive.v1 === "STRING" || unwrapped.primitive.v2?.type === "string")
    );
}

function literalValue(type: FernIr.TypeReference): string | boolean | undefined {
    const unwrapped = unwrapOptional(type);
    if (unwrapped.type !== "container" || unwrapped.container.type !== "literal") {
        return undefined;
    }
    return unwrapped.container.literal.type === "string"
        ? unwrapped.container.literal.string
        : unwrapped.container.literal.boolean;
}

function renderRustStringArray(values: string[]): string {
    return `[${values.map(rustString).join(", ")}]`;
}

function rustJsonValue(value: unknown): string {
    return JSON.stringify(value) ?? "null";
}

function envSegment(value: string): string {
    return value
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toUpperCase();
}

export function resolveDefaultBaseUrl(args: {
    environments: FernIr.EnvironmentsConfig | undefined;
    baseUrlId: string | undefined;
}): string | undefined {
    const { environments, baseUrlId } = args;
    if (environments == null) {
        return undefined;
    }
    const defaultEnvironmentId = environments.defaultEnvironment;
    return visitDiscriminatedUnion(environments.environments)._visit<string | undefined>({
        singleBaseUrl: (single) => {
            const chosen =
                single.environments.find((environment) => environment.id === defaultEnvironmentId) ??
                single.environments[0];
            return chosen?.url;
        },
        multipleBaseUrls: (multiple) => {
            const chosen =
                multiple.environments.find((environment) => environment.id === defaultEnvironmentId) ??
                multiple.environments[0];
            if (chosen == null) {
                return undefined;
            }
            // Prefer the base URL the endpoint is pinned to; otherwise take
            // the first declared one.
            if (baseUrlId != null && chosen.urls[baseUrlId] != null) {
                return chosen.urls[baseUrlId];
            }
            return Object.values(chosen.urls)[0];
        },
        _other: () => undefined
    });
}

/** Render an endpoint's `fullPath` (which already includes base paths) to a string. */
export function renderFullPath(fullPath: FernIr.HttpPath): string {
    let path = fullPath.head;
    for (const part of fullPath.parts) {
        path += `{${part.pathParameter}}${part.tail}`;
    }
    return path.startsWith("/") ? path : `/${path}`;
}

export function joinUrl(baseUrl: string, path: string): string {
    const base = baseUrl.replace(/\/+$/, "");
    const suffix = path.startsWith("/") ? path : `/${path}`;
    return `${base}${suffix}`;
}

/** Encode a value as a Rust string literal. */
function rustString(value: string): string {
    return JSON.stringify(value);
}
