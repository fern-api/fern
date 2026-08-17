import { assertNever } from "@fern-api/core-utils";
import { getOriginalName, getWireValue } from "@fern-api/ir-utils";
import { isEqualToMatcher, WireMock, WireMockMapping, WireMockStubMapping } from "@fern-api/mock-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { type RequiredBodyContracts, reconcileRequiredBodyProperties } from "./specRequiredBody.js";

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
    /**
     * Whether this endpoint declares auth, straight from the IR's
     * `endpoint.auth`. The harness only asserts credential injection on cases
     * where it's `true`.
     *
     * The IR is the oracle here for the same reason it is for
     * {@link WireTestCase.multipartFields}: it already resolves the full
     * OpenAPI security picture (root `security`, per-operation overrides, and
     * `security: []` opt-outs), so the harness inherits that instead of
     * re-deriving it. An endpoint that declares no auth cannot be required to
     * carry a credential — a mock that demands one never matches, the CLI gets
     * no response, and the case fails for a reason that has nothing to do with
     * the endpoint under test. The token endpoint of an OAuth flow is the
     * common instance: it authenticates with client credentials in the body and
     * correctly sends no bearer.
     *
     * Deliberately *not* the inverse assertion: `requiresAuth: false` does not
     * forbid a credential header. Specs under-declare security often enough
     * that forbidding it would manufacture failures on correct CLIs.
     */
    requiresAuth: boolean;
    /**
     * multipart/form-data fields, present only when the endpoint's request body
     * is a file upload. Derived from the IR — *not* the runtime's own multipart
     * classifier — so the harness drives each field the way the spec intends: a
     * real temp file for file fields, the example value for text fields. This is
     * what lets a wire test catch a runtime that mis-classifies an (optional)
     * file field and sends its filename as a text part: the harness passes a
     * file and asserts the multipart body actually carries the file's bytes.
     * Absent/empty for non-multipart endpoints. `isOptional` (from the IR) marks
     * fields the request may omit — used to synthesize an "optional file omitted"
     * variant (see {@link WireTestCase.omitOptionalFiles}).
     */
    multipartFields?: MultipartFieldSpec[];
    /**
     * When true, this is a negative twin of a happy-path case: the mock serves a
     * non-2xx response (with a non-empty JSON error body) and the harness asserts
     * the CLI exits non-zero and reports an error — so an SDK path that
     * deserializes an error body and returns it as success (exit 0) fails here.
     * The request matchers (and `expect(1)`) are unchanged, so the CLI must still
     * send exactly the same, correct request.
     */
    expectError?: boolean;
    /**
     * When true, this is a happy-path variant of a multipart case in which the
     * harness omits every optional file field (sending only what's required).
     * It asserts the CLI still succeeds and that the request carries no bogus
     * part for the omitted field — so a runtime that turns an optional file into
     * a required one, or emits an empty/path text part when it's absent, fails.
     */
    omitOptionalFiles?: boolean;
    /**
     * Body properties this manifest supplied from the OpenAPI spec because the
     * IR example omitted them while the spec marks them `required`. Present only
     * when that repair happened, so its mere presence flags an IR/spec
     * disagreement on this endpoint.
     *
     * Recorded rather than silently applied for two reasons: the values are
     * spec-derived, not author-written, which is the first thing worth knowing if
     * such a case ever fails; and it keeps the underlying data-quality problem
     * visible in a diff instead of burying it. See
     * {@link reconcileRequiredBodyProperties}.
     */
    specFilledBodyProperties?: string[];
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
    authEnvVars: Array<{ name: string; value: string }>;
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
    /**
     * True when the IR's auth requirement is `ENDPOINT_SECURITY` — each endpoint
     * declares which scheme it uses, and the CLI sends only that one. The
     * harness then can't assume the login-flow bearer applies to every
     * auth-declaring endpoint, so it skips the bearer assertion wholesale
     * (`mock-utils` skips its aggregate auth-header matchers in this mode for
     * exactly the same reason — see its `isEndpointSecurity` branch).
     */
    endpointSecurityAuth: boolean;
    cases: WireTestCase[];
}

/** One `multipart/form-data` field, derived from the IR's file-upload request body. */
export interface MultipartFieldSpec {
    wireName: string;
    isFile: boolean;
    /** Whether the request may omit it — drives the "optional file omitted" variant. */
    isOptional: boolean;
    /**
     * The spec's `encoding.<field>.contentType`, when declared. The harness
     * requires the part to carry it, so a runtime that ignores a declared media
     * type fails the match. Absent for the common case of a spec that declares
     * no `encoding` object at all — the harness then expects the type the CLI
     * infers from the file's extension.
     */
    contentType?: string;
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
        authEnvVars: Array<{ name: string; value: string }>;
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
        /**
         * Per-route required-request-body contracts read from the mounted
         * OpenAPI specs. Used to repair example bodies that omit a property the
         * spec marks required — see {@link reconcileRequiredBodyProperties} for
         * why the two disagree. Omitted (or empty) means no repair, which is how
         * every case behaved before this existed.
         */
        requiredBodyContracts?: RequiredBodyContracts;
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
        const testCase = buildCase({
            mapping,
            endpoint,
            example,
            authHeaderNames,
            usedIds,
            requiredBodyContracts: options.requiredBodyContracts
        });
        if (testCase != null) {
            cases.push(testCase);
        }
    }

    // For every happy-path case, emit a negative twin whose mock serves a
    // non-2xx response with a non-empty JSON error body. The harness keeps the
    // exact same request matchers but asserts the CLI exits non-zero and reports
    // an error — so a code path that deserializes an error body and reports it
    // as success (exit 0) is caught. Twins are appended after the positive cases
    // so the happy path is exercised first.
    const negativeCases: WireTestCase[] = [];
    for (const positive of cases) {
        negativeCases.push(buildNegativeTwin(positive, usedIds));
    }

    // For every multipart case that has an optional file field, emit a
    // happy-path variant that omits those optional files, so the harness also
    // exercises the valid "file not provided" shape (not just the fully-
    // populated request). Appended last.
    const optionalFileOmittedCases: WireTestCase[] = [];
    for (const positive of cases) {
        if (hasOptionalFileField(positive)) {
            optionalFileOmittedCases.push(buildOptionalFileOmittedVariant(positive, usedIds));
        }
    }
    cases.push(...negativeCases, ...optionalFileOmittedCases);

    return {
        binaryName: options.binaryName,
        rootGroup: options.rootGroup,
        specs: options.specs,
        authEnvVars: options.authEnvVars,
        authMock: buildAuthMock(options.oauthTokenEndpoint ?? null),
        loginTokenSetup: buildLoginTokenSetup(options.loginFlowSchemes ?? []),
        endpointSecurityAuth: ir.auth.requirement === FernIr.AuthSchemesRequirement.EndpointSecurity,
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
    requiredBodyContracts?: RequiredBodyContracts;
}): WireTestCase | null {
    const { mapping, endpoint, example, authHeaderNames, usedIds, requiredBodyContracts } = args;

    const params: Record<string, unknown> = {};

    // Path parameters (root + service + endpoint), keyed by original name — the
    // same name `mock-utils` uses in the path template, so `substitute_path` in
    // the harness fills them. Fern can rename a path param's IR identity to
    // disambiguate it from a body field of the same name (`idType` →
    // `idTypePathParam`); the generated CLI still reads path params off the
    // baked OpenAPI spec by their wire name, so the harness reconciles the two
    // names (via the resolved spec route) when it builds `--params`.
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

    const exampleBody = example.request != null ? (example.request.jsonExample ?? null) : null;
    const multipartFields = extractMultipartFields(endpoint);
    // Multipart/binary bodies never travel through `--json`, so there is no JSON
    // body to reconcile against the spec.
    const { body, filled: specFilledBodyProperties } =
        multipartFields != null || requiredBodyContracts == null
            ? { body: exampleBody, filled: [] }
            : reconcileRequiredBodyProperties({
                  body: exampleBody,
                  method: mapping.request.method,
                  path: mapping.request.urlPathTemplate,
                  contracts: requiredBodyContracts
              });

    return {
        id: uniqueId(caseIdBase(endpoint), usedIds),
        method: mapping.request.method,
        path: mapping.request.urlPathTemplate,
        params,
        body,
        queryMatchers: extractQueryMatchers(mapping),
        headerMatchers: extractHeaderMatchers(mapping),
        requiresAuth: endpoint.auth,
        ...(multipartFields != null ? { multipartFields } : {}),
        ...(specFilledBodyProperties.length > 0 ? { specFilledBodyProperties } : {}),
        response: {
            status: mapping.response.status,
            body: mapping.response.body
        }
    };
}

/** Status + non-empty JSON body the negative twin's mock serves. A non-empty
 * body is the crux: the error-as-success bug only surfaces when there is a body
 * to (mis)deserialize, so an empty 4xx would not exercise it. */
const NEGATIVE_CASE_STATUS = 422;
const NEGATIVE_CASE_BODY = JSON.stringify({
    error: { code: NEGATIVE_CASE_STATUS, message: "wire-test forced error response" }
});

/**
 * Build the negative twin of a happy-path case: identical request matchers, but
 * the mock serves a non-2xx response with a non-empty JSON error body and the
 * harness asserts the CLI fails (non-zero exit). See {@link WireTestCase.expectError}.
 */
function buildNegativeTwin(positive: WireTestCase, usedIds: Set<string>): WireTestCase {
    return {
        ...positive,
        id: uniqueId(`${positive.id}_error`, usedIds),
        expectError: true,
        response: {
            status: NEGATIVE_CASE_STATUS,
            body: NEGATIVE_CASE_BODY
        }
    };
}

/** True when the case is a multipart request carrying at least one optional file field. */
function hasOptionalFileField(testCase: WireTestCase): boolean {
    return testCase.multipartFields?.some((field) => field.isFile && field.isOptional) ?? false;
}

/**
 * Build the "optional file omitted" variant of a multipart case: identical
 * request otherwise, but the harness drops optional file flags. See
 * {@link WireTestCase.omitOptionalFiles}.
 */
function buildOptionalFileOmittedVariant(positive: WireTestCase, usedIds: Set<string>): WireTestCase {
    return {
        ...positive,
        id: uniqueId(`${positive.id}_optfileomitted`, usedIds),
        omitOptionalFiles: true
    };
}

/**
 * Multipart/form-data fields for a file-upload endpoint, derived straight from
 * the IR. Whether a field is a *file* comes from the IR discriminant
 * (`FileUploadRequestProperty.type === "file"`), independent of the CLI
 * runtime's own multipart classifier — the runtime is exactly the thing under
 * test, and a bug there (e.g. failing to unwrap `anyOf: [{binary}, {null}]` for
 * an optional file) is what we want the wire test to expose, so it must not be
 * the oracle. Returns `undefined` for non-file-upload endpoints.
 */
function extractMultipartFields(endpoint: FernIr.HttpEndpoint): MultipartFieldSpec[] | undefined {
    const requestBody = endpoint.requestBody;
    if (requestBody == null || requestBody.type !== "fileUpload") {
        return undefined;
    }
    const fields: MultipartFieldSpec[] = [];
    for (const property of requestBody.properties) {
        switch (property.type) {
            case "file": {
                // Both single-file and file-array variants carry `key` + `isOptional`
                // + `contentType` (the spec's `encoding.<field>.contentType`).
                const wireName = getWireValue(property.value.key);
                if (wireName != null && wireName !== "") {
                    fields.push({
                        wireName,
                        isFile: true,
                        isOptional: property.value.isOptional,
                        ...(property.value.contentType != null ? { contentType: property.value.contentType } : {})
                    });
                }
                break;
            }
            case "bodyProperty": {
                const wireName = getWireValue(property.name);
                if (wireName != null && wireName !== "") {
                    // Text parts are always sent by the harness, so optionality is moot.
                    fields.push({ wireName, isFile: false, isOptional: false });
                }
                break;
            }
            default:
                assertNever(property);
        }
    }
    return fields.length > 0 ? fields : undefined;
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
