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
    /** Auth kind for documentation purposes. */
    kind: "bearer" | "header" | "basic" | "oauth-client-credentials";
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
 *     `.auth(OAuth2Auth::new(...)...)`. The token URL is resolved from
 *     the IR: the configuration's `tokenEndpoint` reference is looked up
 *     in `services` and joined onto the default environment's base URL.
 *     Client id/secret env vars come from the IR (`clientIdEnvVar` /
 *     `clientSecretEnvVar`), falling back to `<BIN>_CLIENT_ID` /
 *     `<BIN>_CLIENT_SECRET`. If the token URL can't be resolved (no
 *     environment/server, or the token endpoint isn't in the IR), the
 *     scheme is skipped rather than emitting an unusable builder.
 *     Interactive flows (PKCE, device-code) are not modeled by the IR and
 *     are not emitted.
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
    return scheme._visit<DetectedAuthBinding | null>({
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
                    kind: "basic"
                };
            }
            if (basic.usernameOmit) {
                return {
                    schemeName: basic.key,
                    rustCall: `.auth_provider("${basic.key}", BasicAuthProvider::password_only("${basic.key}", AuthCredentialSource::from_env("${passwordEnv}")))`,
                    placement: "binding",
                    authTypeImport: "AuthCredentialSource, BasicAuthProvider",
                    envVars: [passwordEnv],
                    kind: "basic"
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
                kind: "basic"
            };
        },
        // OAuth: the IR only models the client-credentials flow. Lower it
        // to the SDK's `OAuth2Auth` builder, resolving the token URL from
        // the IR (token endpoint reference + default environment). Any
        // other/unknown configuration is skipped.
        oauth: (oauth) =>
            oauth.configuration._visit<DetectedAuthBinding | null>({
                clientCredentials: (clientCredentials) =>
                    clientCredentialsBinding({ key: oauth.key, clientCredentials, envPrefix, services, environments }),
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
    const tokenUrl = resolveTokenUrl({
        endpointReference: clientCredentials.tokenEndpoint.endpointReference,
        services,
        environments
    });
    // If the token URL can't be resolved (the API declares no
    // environment/server, or the token endpoint isn't in the IR), fall
    // back to the pre-OAuth behavior of skipping the scheme rather than
    // emitting a builder the runtime can't satisfy. This keeps generation
    // working for specs that declare OAuth but no server.
    if (tokenUrl == null) {
        return null;
    }

    let rustCall = `.auth(OAuth2Auth::new(${rustString(key)})`;
    rustCall += `.token_url(${rustString(tokenUrl)})`;
    rustCall += `.client_id_env(${rustString(clientIdEnv)})`;
    rustCall += `.client_secret_env(${rustString(clientSecretEnv)})`;
    const scopes = clientCredentials.scopes ?? [];
    if (scopes.length > 0) {
        rustCall += `.scopes([${scopes.map(rustString).join(", ")}])`;
    }
    rustCall += ")";

    return {
        schemeName: key,
        rustCall,
        placement: "root",
        authTypeImport: "OAuth2Auth",
        envVars: [clientIdEnv, clientSecretEnv],
        kind: "oauth-client-credentials"
    };
}

/**
 * Resolve the absolute OAuth token URL from the IR. The
 * client-credentials configuration references the token endpoint by id;
 * we look it up in `services` for its path and join it onto the default
 * environment's base URL.
 *
 * Returns `undefined` when the endpoint can't be found or no base URL is
 * declared — the caller then skips the OAuth binding rather than emitting
 * a builder the runtime couldn't satisfy. (A runtime `--base-url` override
 * does not move the token endpoint; resolving it at request time would
 * require SDK support and is deliberately out of scope here.)
 */
function resolveTokenUrl(args: {
    endpointReference: FernIr.EndpointReference;
    services: Record<string, FernIr.HttpService>;
    environments: FernIr.EnvironmentsConfig | undefined;
}): string | undefined {
    const { endpointReference, services, environments } = args;
    const endpoint = services[endpointReference.serviceId]?.endpoints.find(
        (candidate) => candidate.id === endpointReference.endpointId
    );
    if (endpoint == null) {
        return undefined;
    }
    const baseUrl = resolveDefaultBaseUrl({ environments, baseUrlId: endpoint.baseUrl });
    if (baseUrl == null) {
        return undefined;
    }
    return joinUrl(baseUrl, renderFullPath(endpoint.fullPath));
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
    return environments.environments._visit<string | undefined>({
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
