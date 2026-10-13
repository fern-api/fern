import { type FernDefinition, getAllDefinitionFiles, getAllPackageMarkers } from "@fern-api/api-workspace-commons";
import {
    HttpEndpointReferenceParser,
    type RawSchemas,
    visitRawApiAuth,
    visitRawAuthSchemeDeclaration
} from "@fern-api/fern-definition-schema";
import {
    type FernConfigMappingDiagnostic,
    type SdkConfigV1ApiConfigInput,
    sdkConfigV1AuthSchemeSchema
} from "@postman/sdk-config/sdk-config/v1";

type FernApiContents = FernDefinition["rootApiFile"]["contents"];
type FernAuthDeclarations = NonNullable<FernApiContents["auth-schemes"]>;
type SdkConfigAuth = NonNullable<SdkConfigV1ApiConfigInput["auth"]>;
type SdkConfigAuthScheme = SdkConfigAuth["schemes"][number];
type SdkConfigOAuthScheme = Extract<SdkConfigAuthScheme, { type: "oauth2" }>;
type FernAuthReference = string | RawSchemas.AuthSchemeReferenceSchema;
type Path = Array<string | number>;
type DefinitionFiles = ReturnType<typeof getAllDefinitionFiles>;
type EndpointUrl = { url: string } | { failure: string };

interface ResolvedEndpoint {
    endpoint: RawSchemas.HttpEndpointSchema;
    service: RawSchemas.HttpServiceSchema;
    defaultUrl: string | undefined;
}

interface FernAuthSelection {
    references: FernAuthReference[];
    endpointSecurity: boolean | undefined;
    requirements: Array<{ schemes: string[] }> | undefined;
}

/** A field of a migrated scheme that SDK Config cannot hold, relative to `auth-schemes.<id>`. */
interface LostField {
    path: Path;
    reason: string;
}

type SchemeMapping = { scheme: SdkConfigAuthScheme; lostFields: LostField[] } | { unsupportedReason: string };
type OAuthFlowMapping =
    | {
          flow: SdkConfigOAuthScheme["flows"][number];
          credentials: Pick<SdkConfigOAuthScheme, "clientId" | "clientSecret">;
          lostFields: LostField[];
      }
    | { unsupportedReason: string };

const AUTH_REQUIRES_REVIEW = "FERN_API_AUTH_REQUIRES_REVIEW";
const AUTH_SCHEME_OMITTED = "FERN_API_AUTH_SCHEME_OMITTED";
const AUTH_FIELD_UNSUPPORTED = "FERN_API_AUTH_FIELD_UNSUPPORTED";

/**
 * Maps Fern API auth to SDK Config `api.auth`. Every representable scheme is kept; each scheme that
 * cannot be represented is omitted with a diagnostic naming it and the SDK Config fields it affects.
 * `api.auth` is only left out, with FERN_API_AUTH_REQUIRES_REVIEW, when no scheme is representable.
 */
export function mapFernAuthToSdkConfig(definition: FernDefinition): {
    auth?: SdkConfigAuth;
    diagnostics: FernConfigMappingDiagnostic[];
} {
    const root = definition.rootApiFile.contents;
    const declarations = root["auth-schemes"] ?? {};
    const selection = selectFernAuth(root, declarations);
    if (selection == null) {
        return { diagnostics: [] };
    }

    const resolved = selection.references.map((reference) => ({
        id: authReferenceId(reference),
        mapping: mapFernAuthScheme(reference, declarations, definition)
    }));
    const unsupported = new Map<string, string>();
    for (const { id, mapping } of resolved) {
        if ("unsupportedReason" in mapping && !unsupported.has(id)) {
            unsupported.set(id, mapping.unsupportedReason);
        }
    }
    // SDK Config declares each scheme once by id while requirements retain Fern's auth selection.
    // When an id is repeated, the last reference supplies its optional reference-level docs.
    const migrated = new Map<string, { scheme: SdkConfigAuthScheme; lostFields: LostField[] }>();
    for (const { mapping } of resolved) {
        if ("scheme" in mapping) {
            migrated.set(mapping.scheme.id, mapping);
        }
    }
    if (migrated.size === 0) {
        return { diagnostics: [authRequiresReviewDiagnostic(unsupported)] };
    }

    const schemes = [...migrated.values()].map(({ scheme }) => scheme);
    const requirements = selection.requirements?.filter((requirement) =>
        requirement.schemes.every((id) => migrated.has(id))
    );
    return {
        auth: {
            schemes,
            ...(requirements == null ? {} : { requirements }),
            ...(selection.endpointSecurity == null ? {} : { endpointSecurity: selection.endpointSecurity })
        },
        diagnostics: [
            ...[...unsupported].map(([id, reason]) =>
                schemeOmittedDiagnostic({
                    id,
                    reason,
                    declared: declarations[id] != null,
                    kept: schemes.map((scheme) => scheme.id),
                    selection
                })
            ),
            ...schemes.flatMap((scheme, index) =>
                (migrated.get(scheme.id)?.lostFields ?? []).map((field) =>
                    fieldUnsupportedDiagnostic(scheme.id, index, field)
                )
            )
        ]
    };
}

function selectFernAuth(root: FernApiContents, declarations: FernAuthDeclarations): FernAuthSelection | undefined {
    if (root.auth == null) {
        return Object.keys(declarations).length === 0
            ? undefined
            : { references: Object.keys(declarations), endpointSecurity: true, requirements: undefined };
    }
    return visitRawApiAuth<FernAuthSelection>(root.auth, {
        single: (reference) => ({
            references: [reference],
            endpointSecurity: undefined,
            requirements: [{ schemes: [authReferenceId(reference)] }]
        }),
        any: ({ any }) => ({
            references: any,
            endpointSecurity: undefined,
            requirements: any.map((reference) => ({ schemes: [authReferenceId(reference)] }))
        }),
        endpointSecurity: () => ({
            references: Object.keys(declarations),
            endpointSecurity: true,
            requirements: undefined
        })
    });
}

function mapFernAuthScheme(
    reference: FernAuthReference,
    declarations: FernAuthDeclarations,
    definition: FernDefinition
): SchemeMapping {
    const id = authReferenceId(reference);
    const referenceDocs = typeof reference === "string" ? undefined : reference.docs;
    if ((id === "bearer" || id === "basic") && declarations[id] == null) {
        return { scheme: { id, type: id, ...optional("description", referenceDocs) }, lostFields: [] };
    }

    const declaration = declarations[id];
    if (declaration == null) {
        return { unsupportedReason: "it is not declared in auth-schemes" };
    }
    const description = referenceDocs ?? declaration.docs;
    return visitRawAuthSchemeDeclaration<SchemeMapping>(declaration, {
        header: (header) => ({
            scheme: {
                id,
                type: "api-key",
                location: "header",
                name: header.header,
                ...optional("prefix", header.prefix),
                ...optional("environmentVariable", header.env),
                ...optional("description", description)
            },
            lostFields: []
        }),
        basic: (basic) => ({
            scheme: {
                id,
                type: "basic",
                ...(basic.username == null ? {} : { username: mapFernAuthVariable(basic.username) }),
                ...(basic.password == null ? {} : { password: mapFernAuthVariable(basic.password) }),
                ...optional("description", description)
            },
            lostFields: []
        }),
        tokenBearer: (bearer) => ({
            scheme: {
                id,
                type: "bearer",
                ...optional("environmentVariable", bearer.token?.env),
                ...optional("description", description)
            },
            lostFields: []
        }),
        oauth: (oauth) => mapFernOAuthScheme(id, oauth, description, definition),
        inferredBearer: () => ({
            unsupportedReason: "inferred bearer authentication (bearer with get-token) has no SDK Config v1 equivalent"
        })
    });
}

const OAUTH_SCHEME_KEYS = ["scheme", "type", "docs", "playground-docs", "scopes", "token-header", "token-prefix"];
const CLIENT_CREDENTIALS_MAPPED_KEYS = new Set([
    ...OAUTH_SCHEME_KEYS,
    "client-id-env",
    "client-secret-env",
    "get-token",
    "refresh-token"
]);
const AUTHORIZATION_CODE_MAPPED_KEYS = new Set([
    ...OAUTH_SCHEME_KEYS,
    "client-id",
    "authorization-url",
    "token-url",
    "refresh-url"
]);
const ENV_CLIENT_ID_REASON =
    "flows[].clientId must be a literal public client ID, and schemes[].clientId holds a confidential client's runtime parameter, so an environment-variable client ID cannot be migrated";
const AUTHORIZATION_CODE_FIELD_REASONS: Record<string, string> = {
    "client-id-env": `${ENV_CLIENT_ID_REASON}; the literal client-id was written to flows[].clientId instead`,
    "client-secret-env":
        "an authorization-code flow is a public client, and schemes[].clientSecret holds confidential client credentials"
};
const AUTHORIZATION_CODE_REQUIRED_FIELDS = [
    ["client-id", "flows[].clientId"],
    ["authorization-url", "flows[].authorizationUrl"],
    ["token-url", "flows[].tokenUrl"]
] as const;
const UNMAPPED_OAUTH_FIELD_REASON = "SDK Config v1 has no equivalent for this OAuth setting";
// SDK Config carries no token request/response property names; consumers use these RFC 6749 names.
const TOKEN_REQUEST_DEFAULTS: Record<string, string[]> = {
    "client-id": ["client_id"],
    "client-secret": ["client_secret"],
    scopes: ["scopes", "scope"]
};
const TOKEN_RESPONSE_DEFAULTS: Record<string, string[]> = {
    "access-token": ["access_token"],
    "expires-in": ["expires_in"],
    "refresh-token": ["refresh_token"]
};
const REFRESH_REQUEST_DEFAULTS: Record<string, string[]> = { "refresh-token": ["refresh_token"] };

function mapFernOAuthScheme(
    id: string,
    oauth: RawSchemas.OAuthSchemeSchema,
    description: string | undefined,
    definition: FernDefinition
): SchemeMapping {
    // Fern defaults an omitted flow type to client credentials.
    const flowType: string = oauth.type ?? "client-credentials";
    const flowMapping =
        flowType === "authorization-code"
            ? mapAuthorizationCodeFlow(oauth)
            : flowType === "client-credentials"
              ? mapClientCredentialsFlow(oauth, definition)
              : { unsupportedReason: `OAuth flow '${flowType}' has no SDK Config v1 equivalent` };
    if ("unsupportedReason" in flowMapping) {
        return flowMapping;
    }

    const lostFields = [...flowMapping.lostFields];
    const tokenPrefix = oauth["token-prefix"];
    if (tokenPrefix != null && tokenPrefix.trim().length === 0) {
        lostFields.push({
            path: ["token-prefix"],
            reason: "SDK Config v1 tokenPrefix must be non-empty, so an empty prefix falls back to the consumer default"
        });
    }
    const scheme: SdkConfigOAuthScheme = {
        id,
        type: "oauth2",
        flows: [flowMapping.flow],
        ...flowMapping.credentials,
        ...optional("tokenHeader", nonEmpty(oauth["token-header"])),
        ...optional("tokenPrefix", nonEmpty(tokenPrefix)),
        ...optional("description", description)
    };
    const validation = sdkConfigV1AuthSchemeSchema.safeParse(scheme);
    if (!validation.success) {
        return { unsupportedReason: `the migrated scheme is not valid SDK Config v1 (${validation.error.message})` };
    }
    return { scheme, lostFields };
}

function mapClientCredentialsFlow(oauth: RawSchemas.OAuthSchemeSchema, definition: FernDefinition): OAuthFlowMapping {
    const getToken = oauth["get-token"];
    if (getToken == null) {
        return { unsupportedReason: "the client-credentials flow has no get-token endpoint" };
    }
    const token = resolveEndpointUrl(getToken.endpoint, definition);
    if ("failure" in token) {
        return {
            unsupportedReason: `its get-token endpoint '${getToken.endpoint}' ${token.failure}, so flows[].tokenUrl cannot be set`
        };
    }

    const lostFields: LostField[] = [
        ...unmappedOAuthFields(oauth, CLIENT_CREDENTIALS_MAPPED_KEYS, {}),
        ...customPropertyNames(
            ["get-token", "request-properties"],
            getToken["request-properties"],
            TOKEN_REQUEST_DEFAULTS
        ),
        ...customPropertyNames(
            ["get-token", "response-properties"],
            getToken["response-properties"],
            TOKEN_RESPONSE_DEFAULTS
        )
    ];
    const refreshUrl = mapRefreshEndpoint(oauth["refresh-token"], definition, lostFields);
    return {
        flow: {
            type: "client-credentials",
            tokenUrl: token.url,
            ...optional("refreshUrl", refreshUrl),
            ...mapOAuthScopes(oauth)
        },
        credentials: {
            ...(oauth["client-id-env"] == null ? {} : { clientId: { environmentVariable: oauth["client-id-env"] } }),
            ...(oauth["client-secret-env"] == null
                ? {}
                : { clientSecret: { environmentVariable: oauth["client-secret-env"] } })
        },
        lostFields
    };
}

/**
 * Fern's public-client authorization-code flow names its identity-provider URLs directly, so nothing is
 * resolved against the definition. Its literal `client-id` becomes the public `flows[].clientId`; it
 * never populates the confidential `schemes[].clientId`/`clientSecret` parameters.
 */
function mapAuthorizationCodeFlow(oauth: RawSchemas.OAuthSchemeSchema): OAuthFlowMapping {
    const clientId = nonEmpty(oauth["client-id"]);
    const authorizationUrl = nonEmpty(oauth["authorization-url"]);
    const tokenUrl = nonEmpty(oauth["token-url"]);
    if (clientId == null || authorizationUrl == null || tokenUrl == null) {
        return { unsupportedReason: missingAuthorizationCodeFieldsReason(oauth) };
    }
    return {
        flow: {
            type: "authorization-code",
            authorizationUrl,
            tokenUrl,
            ...optional("refreshUrl", oauth["refresh-url"]),
            ...mapOAuthScopes(oauth),
            clientId
        },
        credentials: {},
        lostFields: unmappedOAuthFields(oauth, AUTHORIZATION_CODE_MAPPED_KEYS, AUTHORIZATION_CODE_FIELD_REASONS)
    };
}

function missingAuthorizationCodeFieldsReason(oauth: RawSchemas.OAuthSchemeSchema): string {
    const missing = AUTHORIZATION_CODE_REQUIRED_FIELDS.filter(([key]) => nonEmpty(oauth[key]) == null);
    const reason = `its authorization-code flow has no ${missing.map(([key]) => key).join(", ")}, so ${missing.map(([, target]) => target).join(", ")} cannot be set`;
    const envOnly = nonEmpty(oauth["client-id"]) == null && oauth["client-id-env"] != null;
    return envOnly ? `${reason}; it sets client-id-env, but ${ENV_CLIENT_ID_REASON}` : reason;
}

function unmappedOAuthFields(
    oauth: RawSchemas.OAuthSchemeSchema,
    mappedKeys: ReadonlySet<string>,
    reasons: Record<string, string>
): LostField[] {
    return Object.keys(oauth)
        .filter((key) => !mappedKeys.has(key))
        .map((key) => ({ path: [key], reason: reasons[key] ?? UNMAPPED_OAUTH_FIELD_REASON }));
}

function mapOAuthScopes(oauth: RawSchemas.OAuthSchemeSchema): { scopes?: Array<{ name: string }> } {
    const scopes = (oauth.scopes ?? []).map((name) => ({ name }));
    return scopes.length === 0 ? {} : { scopes };
}

function mapRefreshEndpoint(
    refresh: RawSchemas.OAuthRefreshTokenEndpointSchema | undefined,
    definition: FernDefinition,
    lostFields: LostField[]
): string | undefined {
    if (refresh == null) {
        return undefined;
    }
    const refreshUrl = resolveEndpointUrl(refresh.endpoint, definition);
    if ("failure" in refreshUrl) {
        lostFields.push({
            path: ["refresh-token", "endpoint"],
            reason: `the refresh endpoint '${refresh.endpoint}' ${refreshUrl.failure}, so flows[].refreshUrl was not written`
        });
        return undefined;
    }
    lostFields.push(
        ...customPropertyNames(
            ["refresh-token", "request-properties"],
            refresh["request-properties"],
            REFRESH_REQUEST_DEFAULTS
        ),
        ...customPropertyNames(
            ["refresh-token", "response-properties"],
            refresh["response-properties"],
            TOKEN_RESPONSE_DEFAULTS
        )
    );
    return refreshUrl.url;
}

function customPropertyNames(
    basePath: Path,
    properties: object | undefined,
    defaults: Record<string, string[]>
): LostField[] {
    return Object.entries(properties ?? {}).flatMap(([key, value]: [string, unknown]) => {
        if (typeof value !== "string") {
            return [];
        }
        const wireName = value.replace(/^\$(?:request|response)\./, "");
        if (defaults[key]?.includes(wireName) === true) {
            return [];
        }
        const reason = wireName.includes(".")
            ? `SDK Config v1 cannot select the nested token property '${wireName}'; consumers read the top-level RFC 6749 property`
            : `SDK Config v1 cannot name token property '${wireName}'; consumers assume the RFC 6749 name`;
        return [{ path: [...basePath, key], reason }];
    });
}

/**
 * Resolves a Fern endpoint reference (`[namespace::]METHOD /path` or `<import>.<endpoint>`) to the URL
 * SDK Config uses for OAuth flows, following the IR generator's EndpointResolver and convertHttpService.
 */
function resolveEndpointUrl(reference: string, definition: FernDefinition): EndpointUrl {
    const trimmed = reference.trim();
    const parsed = new HttpEndpointReferenceParser().tryParse(trimmed);
    const files = getAllDefinitionFiles(definition);
    const resolved =
        parsed == null
            ? findEndpointByName(trimmed, definition, files)
            : findEndpointByRoute(parsed, definition, files);
    if (resolved == null) {
        // A method/path reference names its request path even when no declared endpoint matches it.
        return parsed == null
            ? { failure: "could not be resolved to an endpoint in the Fern definition" }
            : { url: normalizePath(parsed.path) };
    }
    const root = definition.rootApiFile.contents;
    const { endpoint, service } = resolved;
    const path = normalizePath(
        endpoint["base-path"] != null
            ? `${endpoint["base-path"]}/${endpoint.path}`
            : `${root["base-path"] ?? ""}/${service["base-path"] ?? ""}/${endpoint.path}`
    );
    return withEndpointBaseUrl(path, endpoint.url ?? service.url ?? resolved.defaultUrl, root);
}

/**
 * Mirrors EndpointResolverImpl.resolveEndpointByMethodAndPath, including its scan order (all definition
 * files, then package markers again) and last-match-wins, so a route declared in several files resolves
 * to the endpoint the IR uses.
 */
function findEndpointByRoute(
    { method, path, namespace }: HttpEndpointReferenceParser.Parsed,
    definition: FernDefinition,
    files: DefinitionFiles
): ResolvedEndpoint | undefined {
    let match: ResolvedEndpoint | undefined;
    for (const [filePath, file] of [...Object.entries(files), ...Object.entries(getAllPackageMarkers(definition))]) {
        const segments = filePath.split("/");
        if (namespace != null && (segments.length < 2 || segments[0] !== namespace)) {
            continue;
        }
        const service = file.contents.service;
        for (const endpoint of Object.values(service?.endpoints ?? {})) {
            if (service != null && endpoint.method === method && endpoint.path === path) {
                match = { endpoint, service, defaultUrl: file.defaultUrl };
            }
        }
    }
    return match;
}

function findEndpointByName(
    reference: string,
    definition: FernDefinition,
    files: DefinitionFiles
): ResolvedEndpoint | undefined {
    const separator = reference.lastIndexOf(".");
    const importedFile =
        separator <= 0 ? undefined : definition.rootApiFile.contents.imports?.[reference.slice(0, separator)];
    if (importedFile == null) {
        return undefined;
    }
    const file = Object.entries(files).find(
        ([filePath]) => normalizeFilePath(filePath) === normalizeFilePath(importedFile)
    )?.[1];
    const service = file?.contents.service;
    const endpoint = service?.endpoints[reference.slice(separator + 1)];
    return service == null || endpoint == null ? undefined : { endpoint, service, defaultUrl: file?.defaultUrl };
}

/**
 * Endpoints served from the API base URL keep a relative path. An endpoint or service `url` override
 * names a multi-URL environment entry; it becomes an absolute URL only when every environment agrees
 * on it, because flows[].tokenUrl cannot vary by environment.
 */
function withEndpointBaseUrl(path: string, urlId: string | undefined, root: FernApiContents): EndpointUrl {
    if (urlId == null || urlId === root["default-url"]) {
        return { url: path };
    }
    const environmentUrls = Object.entries(root.environments ?? {}).map(([name, environment]) => ({
        name,
        url: typeof environment === "object" && "urls" in environment ? environment.urls[urlId] : undefined
    }));
    const undeclared = environmentUrls.filter(({ url }) => url == null).map(({ name }) => name);
    if (environmentUrls.length === 0 || undeclared.length > 0) {
        const where =
            environmentUrls.length === 0
                ? "no environment declares"
                : `is missing from environments ${undeclared.join(", ")}`;
        return { failure: `uses environment URL '${urlId}', which ${where}` };
    }
    const distinct = [...new Set(environmentUrls.map(({ url }) => url))];
    const baseUrl = distinct[0];
    if (distinct.length > 1 || baseUrl == null) {
        const values = environmentUrls.map(({ name, url }) => `${name}: ${url}`).join(", ");
        return { failure: `uses environment URL '${urlId}', which differs across environments (${values})` };
    }
    return { url: `${baseUrl.replace(/\/+$/, "")}${path}` };
}

function normalizePath(path: string): string {
    const collapsed = `/${path}`.replace(/\/{2,}/g, "/");
    return collapsed.length > 1 ? collapsed.replace(/\/$/, "") : collapsed;
}

function normalizeFilePath(filePath: string): string {
    return filePath.replace(/^\.\//, "");
}

function mapFernAuthVariable(variable: { name?: string; env?: string; omit?: boolean }): {
    name?: string;
    environmentVariable?: string;
    omit?: boolean;
} {
    return {
        ...optional("name", variable.name),
        ...optional("environmentVariable", variable.env),
        ...optional("omit", variable.omit)
    };
}

function authReferenceId(reference: FernAuthReference): string {
    return typeof reference === "string" ? reference : reference.scheme;
}

function authRequiresReviewDiagnostic(unsupported: ReadonlyMap<string, string>): FernConfigMappingDiagnostic {
    const schemeDetail =
        unsupported.size === 0
            ? ""
            : ` Unsupported or unresolved scheme ids: ${[...unsupported].map(([id, reason]) => `${id} (${reason})`).join("; ")}.`;
    return {
        code: AUTH_REQUIRES_REVIEW,
        severity: "warning",
        path: ["api", "auth"],
        reason: `Fern API authentication has no scheme that SDK Config v1 can represent, so api.auth was not written.${schemeDetail}`,
        sdkConfigPath: ["api", "auth"],
        suggestedAction: "Review the Fern auth schemes and configure api.auth manually in SDK Config v1."
    };
}

function schemeOmittedDiagnostic({
    id,
    reason,
    declared,
    kept,
    selection
}: {
    id: string;
    reason: string;
    declared: boolean;
    kept: string[];
    selection: FernAuthSelection;
}): FernConfigMappingDiagnostic {
    const affected = [
        "api.auth.schemes",
        ...(selection.requirements == null ? [] : ["api.auth.requirements"]),
        ...(selection.endpointSecurity === true ? ["endpoint security requirements that reference it"] : [])
    ];
    return {
        code: AUTH_SCHEME_OMITTED,
        severity: "warning",
        path: declared ? ["auth-schemes", id] : ["auth", id],
        reason: `Fern auth scheme '${id}' was omitted because ${reason}. api.auth keeps ${kept.join(", ")}; affected: ${affected.join(", ")}.`,
        sdkConfigPath: ["api", "auth", "schemes"],
        suggestedAction: `Add '${id}' to api.auth.schemes${selection.requirements == null ? "" : " and api.auth.requirements"} manually, or keep this API on generators.yml until SDK Config supports it.`
    };
}

function fieldUnsupportedDiagnostic(id: string, index: number, field: LostField): FernConfigMappingDiagnostic {
    return {
        code: AUTH_FIELD_UNSUPPORTED,
        severity: "warning",
        path: ["auth-schemes", id, ...field.path],
        reason: `Fern auth scheme '${id}' was migrated without ${field.path.join(".")}: ${field.reason}.`,
        sdkConfigPath: ["api", "auth", "schemes", index],
        suggestedAction: `Review api.auth.schemes.${index} ('${id}') and confirm the generated SDK does not depend on ${field.path.join(".")}.`
    };
}

function nonEmpty(value: string | undefined): string | undefined {
    return value != null && value.trim().length > 0 ? value : undefined;
}

function optional<Key extends string, Value>(key: Key, value: Value | undefined): { [K in Key]?: Value } {
    return (value === undefined ? {} : { [key]: value }) as { [K in Key]?: Value };
}
