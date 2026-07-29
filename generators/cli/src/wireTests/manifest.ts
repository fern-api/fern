import { getOriginalName, getWireValue } from "@fern-api/ir-utils";
import { isEqualToMatcher, WireMock, WireMockMapping, WireMockStubMapping } from "@fern-api/mock-utils";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * A single wire-test case: enough to drive the generated CLI binary once
 * and assert "request X → response Y". The Rust harness reads a list of
 * these from `wiremock/wire-test-cases.json`.
 *
 * The case is deliberately *naming-independent*: it carries the HTTP
 * method + operation path (not a resource/method command chain). The
 * harness resolves the command chain by loading the same baked OpenAPI
 * spec the CLI runs on and matching `(method, path)` against its own
 * discovery tree — so the TS side never has to reproduce the CLI's
 * kebab-casing / `x-fern-sdk-*` command-naming rules.
 */
export interface WireTestCase {
    /** Stable, unique, snake_case-safe identifier used to name the Rust test fn. */
    id: string;
    /** Uppercase HTTP method (GET, POST, …). */
    method: string;
    /**
     * Operation path template as the IR sees it, with `{param}` placeholders,
     * e.g. `/users/{userId}`. Used by the harness to (a) resolve the command
     * chain against the baked spec and (b) assert the request landed on the
     * right path.
     */
    path: string;
    /**
     * Path/query/header parameter values keyed by wire name. Handed to the CLI
     * verbatim via `--params <JSON>`; `collect_params_from_flags` substitutes
     * path params into the URL and appends query/header params.
     */
    params: Record<string, unknown>;
    /** Request body JSON handed to `--json`, or null when the endpoint has no body. */
    body: unknown | null;
    /**
     * Scalar query parameters the mock must match on, so a request that omits or
     * mis-serializes them fails (the mock won't respond) instead of silently
     * passing on a path-only match — the same guarantee the SDK wire tests get
     * from WireMock stub matching. Derived from the `mock-utils` mapping's
     * single-value (`equalTo`) query matchers; multi-value/array params are
     * intentionally excluded (their wire serialization — comma-joined vs
     * repeated vs exploded — can legitimately differ between the CLI and
     * `mock-utils`, which would cause false failures).
     */
    queryMatchers: Array<{ name: string; value: string }>;
    /**
     * Auth-header matchers the mock must match on, so a request missing its
     * credential header fails. Derived from the `mock-utils` mapping's auth
     * headers: `regex` for presence-only schemes (bearer/header → `.+`),
     * `equalTo` for the exact Basic value.
     */
    headerMatchers: Array<{ name: string; equalTo?: string; matches?: string }>;
    /** Expected response the mock serves and the CLI is expected to render. */
    response: {
        status: number;
        /** Response body exactly as the mock serves it (already JSON-encoded text). */
        body: string;
    };
}

/**
 * The full manifest emitted alongside the generated CLI. Everything the
 * generic Rust harness needs to stand up mocks and drive the binary.
 */
export interface WireTestManifest {
    /** The generated binary's name — used for `env!("CARGO_BIN_EXE_<binaryName>")`. */
    binaryName: string;
    /**
     * `customConfig.rootGroup`, when set: every spec command nests one level
     * under this namespace (`<bin> <rootGroup> <resource> <method>`). Null
     * when unset.
     */
    rootGroup: string | null;
    /**
     * The baked spec files (relative to the crate root) in binding order, each
     * with its per-spec `namespace:` (from `generators.yml`), if any. The
     * harness loads these to resolve command chains.
     */
    specs: Array<{ file: string; namespace: string | null }>;
    /**
     * Environment variable names the harness sets to dummy values before
     * invoking the binary, so auth-gated endpoints don't bail out on a
     * missing credential.
     */
    authEnvVars: string[];
    /**
     * When the CLI declares OAuth client-credentials auth, the token endpoint
     * the harness must stub on every mock server. The generated CLI performs
     * a real token exchange before each authenticated request, and the token
     * URL honors the `--base-url` override — so without this stub every
     * authenticated endpoint's test 404s on the token fetch before reaching
     * the endpoint under test. Null for non-OAuth CLIs.
     */
    authMock: AuthMock | null;
    /**
     * For public-client login flows (authorization-code / device-code), there is no per-request
     * token exchange to stub — the CLI reads a token from the keyring that `auth login` populated.
     * The harness can't drive the interactive browser/device login headlessly, so instead it seeds
     * a token via the universal `auth login --with-token` paste (which the request-time provider
     * reads identically), then asserts business requests carry `Authorization: Bearer <token>`.
     * Null for client-credentials / non-login-flow CLIs.
     */
    loginTokenSetup: LoginTokenSetup | null;
    cases: WireTestCase[];
}

/** Instructs the harness to seed a keyring token before driving business requests. */
export interface LoginTokenSetup {
    /** The auth scheme key to log into (passed as `--scheme` when the CLI has multiple schemes). */
    schemeName: string;
    /** The literal token to paste via `auth login --with-token`; also the expected bearer value. */
    token: string;
}

/**
 * A canned OAuth token-endpoint stub. The harness mounts this on every mock
 * server so the CLI's client-credentials exchange succeeds with a fake token.
 * The business-endpoint mocks don't match on the `Authorization` header, so
 * any token value satisfies them.
 */
export interface AuthMock {
    /** Uppercase HTTP method of the token exchange (e.g. "POST"). */
    method: string;
    /** Token endpoint path (e.g. "/v1/oauth/token"). */
    path: string;
    /** JSON response body carrying a fake access token at the configured path. */
    responseBody: string;
}

/** The token-endpoint contract the harness needs, as resolved by detectAuth. */
export interface OAuthTokenEndpoint {
    method: string;
    path: string;
    accessTokenPath: string[];
    expiresInPath: string[] | null;
}

/**
 * mock-utils and the CLI generator resolve `@fern-fern/ir-sdk` to
 * different (structurally compatible) versions, so the nominal `FernIr`
 * types don't unify. This narrows the call site to that single seam —
 * mirrors the Rust SDK's `WireTestSetupGenerator.getWiremockConfigContent`.
 */
function convertToWireMock(ir: FernIr.IntermediateRepresentation): WireMockStubMapping {
    // @ts-expect-error Nominal IR-SDK version mismatch between mock-utils and
    // the CLI generator; the shapes are compatible at runtime.
    return new WireMock().convertToWireMock(ir);
}

const DATETIME_WITH_ZERO_MILLIS_IN_BODY = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.000(Z|[+-]\d{2}:\d{2})/g;

/**
 * Build the wire-test manifest from the IR.
 *
 * The WireMock stub mappings (method/path/query/response) come from the
 * shared `mock-utils` engine every SDK generator uses, so the mock
 * responses stay identical to the SDK wire suites. We then pair each
 * mapping back to its IR endpoint + example to recover the concrete
 * `--params` / `--json` inputs the CLI needs.
 */
export function buildWireTestManifest(
    ir: FernIr.IntermediateRepresentation,
    options: {
        binaryName: string;
        rootGroup: string | null;
        specs: Array<{ file: string; namespace: string | null }>;
        authEnvVars: string[];
        /**
         * The OAuth client-credentials token endpoint, when the CLI declares
         * one. Turned into the shared `authMock` the harness mounts on every
         * server so token exchanges succeed.
         */
        oauthTokenEndpoint?: OAuthTokenEndpoint | null;
        /**
         * Scheme keys of public-client login flows (authorization-code / device-code). When present,
         * the harness seeds a token via `auth login --with-token` and asserts bearer injection.
         */
        loginFlowSchemes?: string[];
    }
): WireTestManifest {
    const stub = convertToWireMock(ir);
    // Reuse the Rust SDK's response post-processing so the CLI (also Rust,
    // also chrono/serde) renders the mocked bodies identically.
    stripDatetimeMilliseconds(stub);

    // Index endpoints by their WireMock key so we can pair a mapping to the
    // example inputs it was built from.
    const endpointsByKey = indexEndpointsByMethodAndPath(ir);
    const authHeaderNames = collectAuthHeaderNames(ir);
    // Endpoints the OAuth machinery consumes internally (token + refresh). The
    // generated CLI does NOT expose these as user commands — they're driven by
    // the auth layer — so a wire-test case for them would resolve to a
    // subcommand clap rejects. Skip them.
    const authEndpointIds = collectOAuthEndpointIds(ir);

    const cases: WireTestCase[] = [];
    const usedIds = new Set<string>();
    for (const mapping of stub.mappings) {
        const key = `${mapping.request.method}:${mapping.request.urlPathTemplate}`;
        const endpoint = endpointsByKey.get(key);
        if (endpoint == null) {
            continue;
        }
        if (authEndpointIds.has(endpoint.id)) {
            continue;
        }
        const example = firstExample(endpoint);
        if (example == null) {
            continue;
        }
        const testCase = buildCase({ mapping, endpoint, example, authHeaderNames, usedIds });
        if (testCase != null) {
            cases.push(testCase);
        }
    }

    return {
        binaryName: options.binaryName,
        rootGroup: options.rootGroup,
        specs: options.specs,
        authEnvVars: options.authEnvVars,
        authMock: buildAuthMock(options.oauthTokenEndpoint ?? null),
        loginTokenSetup: buildLoginTokenSetup(options.loginFlowSchemes ?? []),
        cases
    };
}

/**
 * Seed setup for a public-client login flow. The CLI supports one login-flow scheme at a time; we
 * take the first and pair it with a fixed literal token the harness both pastes and asserts as the
 * injected bearer. Null when there is no login-flow scheme.
 */
function buildLoginTokenSetup(loginFlowSchemes: string[]): LoginTokenSetup | null {
    const schemeName = loginFlowSchemes[0];
    if (schemeName == null) {
        return null;
    }
    return { schemeName, token: "wire-test-token" };
}

/**
 * Synthesize the OAuth token-endpoint stub from the resolved token endpoint.
 * The response body sets a fake access token (and expiry) at exactly the paths
 * the generated CLI reads (`access_token_path` / `expires_in_path`), so the
 * client-credentials exchange succeeds regardless of what the endpoint's own
 * IR example happened to contain.
 */
function buildAuthMock(tokenEndpoint: OAuthTokenEndpoint | null): AuthMock | null {
    if (tokenEndpoint == null) {
        return null;
    }
    const body: Record<string, unknown> = {};
    setNested(body, tokenEndpoint.accessTokenPath, "test-access-token");
    if (tokenEndpoint.expiresInPath != null) {
        setNested(body, tokenEndpoint.expiresInPath, 3600);
    }
    return {
        method: tokenEndpoint.method.toUpperCase(),
        path: tokenEndpoint.path,
        responseBody: JSON.stringify(body)
    };
}

/** Set `value` at a nested `path` in `target`, creating intermediate objects. */
function setNested(target: Record<string, unknown>, path: string[], value: unknown): void {
    if (path.length === 0) {
        return;
    }
    let cursor = target;
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key == null) {
            return;
        }
        const existing = cursor[key];
        if (typeof existing !== "object" || existing === null) {
            cursor[key] = {};
        }
        cursor = cursor[key] as Record<string, unknown>;
    }
    const last = path[path.length - 1];
    if (last != null) {
        cursor[last] = value;
    }
}

function buildCase(args: {
    mapping: WireMockMapping;
    endpoint: FernIr.HttpEndpoint;
    example: FernIr.ExampleEndpointCall;
    authHeaderNames: Set<string>;
    usedIds: Set<string>;
}): WireTestCase | null {
    const { mapping, endpoint, example, authHeaderNames, usedIds } = args;

    const params: Record<string, unknown> = {};

    // Path parameters (root + service + endpoint), keyed by original name.
    for (const param of [
        ...example.rootPathParameters,
        ...example.servicePathParameters,
        ...example.endpointPathParameters
    ]) {
        const name = getOriginalName(param.name);
        if (name != null && name !== "") {
            params[name] = param.value.jsonExample;
        }
    }

    // Query parameters, keyed by wire name.
    for (const param of example.queryParameters) {
        const name = param.name != null ? getWireValue(param.name) : undefined;
        if (name != null && name !== "") {
            params[name] = param.value.jsonExample;
        }
    }

    // Header parameters (service + endpoint), keyed by wire name. Skip
    // auth-scheme headers — those are supplied via env vars, not --params.
    for (const header of [...example.serviceHeaders, ...example.endpointHeaders]) {
        const name = header.name != null ? getWireValue(header.name) : undefined;
        if (name != null && name !== "" && !authHeaderNames.has(name)) {
            params[name] = header.value.jsonExample;
        }
    }

    const body = example.request != null ? (example.request.jsonExample ?? null) : null;

    return {
        id: uniqueId(caseIdBase(endpoint), usedIds),
        method: mapping.request.method,
        path: mapping.request.urlPathTemplate,
        params,
        body,
        queryMatchers: extractQueryMatchers(mapping),
        headerMatchers: extractHeaderMatchers(mapping),
        response: {
            status: mapping.response.status,
            body: mapping.response.body
        }
    };
}

const DATETIME_WITH_ZERO_MILLIS_IN_VALUE = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.000(Z|[+-]\d{2}:\d{2})$/;

/**
 * Pull the single-value query matchers off the `mock-utils` mapping. Only
 * `equalTo` (scalar) matchers are carried — array (`hasExactly`) matchers are
 * skipped because the CLI and `mock-utils` can serialize repeated/exploded/
 * comma-joined arrays differently, which would fail the mock on a request that
 * is actually correct. Datetime milliseconds are stripped to match the CLI's
 * chrono `SecondsFormat::Secs` rendering (same fix the response body gets).
 */
function extractQueryMatchers(mapping: WireMockMapping): Array<{ name: string; value: string }> {
    const matchers: Array<{ name: string; value: string }> = [];
    for (const [name, matcher] of Object.entries(mapping.request.queryParameters ?? {})) {
        if (!isEqualToMatcher(matcher)) {
            continue;
        }
        matchers.push({ name, value: matcher.equalTo.replace(DATETIME_WITH_ZERO_MILLIS_IN_VALUE, "$1$2") });
    }
    return matchers;
}

/** Pull the auth-header matchers (`equalTo` exact, or `matches` regex) off the mapping. */
function extractHeaderMatchers(mapping: WireMockMapping): Array<{ name: string; equalTo?: string; matches?: string }> {
    const matchers: Array<{ name: string; equalTo?: string; matches?: string }> = [];
    for (const [name, matcher] of Object.entries(mapping.request.headers ?? {})) {
        if (matcher.equalTo != null) {
            matchers.push({ name, equalTo: matcher.equalTo });
        } else if (matcher.matches != null) {
            matchers.push({ name, matches: matcher.matches });
        }
    }
    return matchers;
}

/**
 * Build the `(method, path)` → endpoint index using the same URL-path
 * template mock-utils produces, so mapping keys line up exactly.
 */
function indexEndpointsByMethodAndPath(ir: FernIr.IntermediateRepresentation): Map<string, FernIr.HttpEndpoint> {
    const index = new Map<string, FernIr.HttpEndpoint>();
    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            const key = `${endpoint.method}:${buildUrlPathTemplate(endpoint)}`;
            // First writer wins — mirrors mock-utils, which emits one mapping
            // per (method, path) from the first matching endpoint.
            if (!index.has(key)) {
                index.set(key, endpoint);
            }
        }
    }
    return index;
}

/** Mirrors `mock-utils`' `buildUrlPathTemplate` so keys match its mappings. */
function buildUrlPathTemplate(endpoint: FernIr.HttpEndpoint): string {
    let path = endpoint.fullPath.head;
    for (const part of endpoint.fullPath.parts ?? []) {
        path += `{${part.pathParameter}}${part.tail}`;
    }
    if (!path.startsWith("/")) {
        path = `/${path}`;
    }
    const fragmentIndex = path.indexOf("#");
    if (fragmentIndex !== -1) {
        path = path.substring(0, fragmentIndex);
    }
    return path;
}

function firstExample(endpoint: FernIr.HttpEndpoint): FernIr.ExampleEndpointCall | undefined {
    return (endpoint.userSpecifiedExamples[0] ?? endpoint.autogeneratedExamples[0])?.example;
}

/** Wire names of `header` auth schemes — excluded from `--params`. */
function collectAuthHeaderNames(ir: FernIr.IntermediateRepresentation): Set<string> {
    const names = new Set<string>();
    for (const scheme of ir.auth.schemes) {
        if (scheme.type === "header" && scheme.name != null) {
            names.add(getWireValue(scheme.name));
        }
    }
    return names;
}

/**
 * IR endpoint ids consumed internally by an OAuth client-credentials scheme —
 * the token endpoint and (if declared) the refresh endpoint. These are never
 * surfaced as invokable CLI commands, so they must not produce wire-test cases.
 */
function collectOAuthEndpointIds(ir: FernIr.IntermediateRepresentation): Set<string> {
    const ids = new Set<string>();
    for (const scheme of ir.auth.schemes) {
        if (scheme.type !== "oauth") {
            continue;
        }
        if (scheme.configuration.type !== "clientCredentials") {
            continue;
        }
        const { configuration } = scheme;
        ids.add(configuration.tokenEndpoint.endpointReference.endpointId);
        if (configuration.refreshEndpoint != null) {
            ids.add(configuration.refreshEndpoint.endpointReference.endpointId);
        }
    }
    return ids;
}

function caseIdBase(endpoint: FernIr.HttpEndpoint): string {
    const raw = endpoint.name != null ? getOriginalName(endpoint.name) : endpoint.id;
    const sanitized = raw
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase();
    return sanitized.length > 0 ? sanitized : "endpoint";
}

function uniqueId(base: string, used: Set<string>): string {
    let candidate = base;
    let suffix = 1;
    while (used.has(candidate)) {
        candidate = `${base}_${suffix}`;
        suffix += 1;
    }
    used.add(candidate);
    return candidate;
}

/**
 * Strip `.000` milliseconds from datetime strings in response bodies.
 * Rust's chrono serializes with `SecondsFormat::Secs` (no milliseconds),
 * but JS `Date.toISOString()` always includes `.000`, so the CLI-rendered
 * body would otherwise differ from the mock body. Mirrors the Rust SDK's
 * `WireTestSetupGenerator.stripDatetimeMilliseconds`.
 */
function stripDatetimeMilliseconds(stub: WireMockStubMapping): void {
    for (const mapping of stub.mappings ?? []) {
        if (typeof mapping.response.body === "string") {
            mapping.response.body = mapping.response.body.replace(DATETIME_WITH_ZERO_MILLIS_IN_BODY, "$1$2");
        }
    }
}
