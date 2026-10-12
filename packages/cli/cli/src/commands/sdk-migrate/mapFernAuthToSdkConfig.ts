import type { FernDefinition } from "@fern-api/api-workspace-commons";
import { type RawSchemas, visitRawApiAuth, visitRawAuthSchemeDeclaration } from "@fern-api/fern-definition-schema";
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

const OAUTH_MAPPED_KEYS = new Set([
    "scheme",
    "type",
    "docs",
    "playground-docs",
    "scopes",
    "token-header",
    "token-prefix",
    "client-id-env",
    "client-secret-env",
    "get-token",
    "refresh-token"
]);
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
    if (flowType === "authorization-code") {
        return {
            unsupportedReason:
                "OAuth authorization-code needs a public client ID, which SDK Config v1 api.auth cannot hold yet"
        };
    }
    if (flowType !== "client-credentials") {
        return { unsupportedReason: `OAuth flow '${flowType}' has no SDK Config v1 equivalent` };
    }
    const getToken = oauth["get-token"];
    if (getToken == null) {
        return { unsupportedReason: "the client-credentials flow has no get-token endpoint" };
    }
    const tokenUrl = resolveEndpointPath(getToken.endpoint, definition);
    if (tokenUrl == null) {
        return {
            unsupportedReason: `its get-token endpoint '${getToken.endpoint}' could not be resolved to a request path for flows[].tokenUrl`
        };
    }

    const lostFields: LostField[] = [
        ...Object.keys(oauth)
            .filter((key) => !OAUTH_MAPPED_KEYS.has(key))
            .map((key) => ({ path: [key], reason: "SDK Config v1 has no equivalent for this OAuth setting" })),
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
    const tokenPrefix = oauth["token-prefix"];
    if (tokenPrefix != null && tokenPrefix.trim().length === 0) {
        lostFields.push({
            path: ["token-prefix"],
            reason: "SDK Config v1 tokenPrefix must be non-empty, so an empty prefix falls back to the consumer default"
        });
    }
    const refreshUrl = mapRefreshEndpoint(oauth["refresh-token"], definition, lostFields);
    const scopes = (oauth.scopes ?? []).map((name) => ({ name }));

    const scheme: SdkConfigOAuthScheme = {
        id,
        type: "oauth2",
        flows: [
            {
                type: "client-credentials",
                tokenUrl,
                ...optional("refreshUrl", refreshUrl),
                ...(scopes.length === 0 ? {} : { scopes })
            }
        ],
        ...(oauth["client-id-env"] == null ? {} : { clientId: { environmentVariable: oauth["client-id-env"] } }),
        ...(oauth["client-secret-env"] == null
            ? {}
            : { clientSecret: { environmentVariable: oauth["client-secret-env"] } }),
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

function mapRefreshEndpoint(
    refresh: RawSchemas.OAuthRefreshTokenEndpointSchema | undefined,
    definition: FernDefinition,
    lostFields: LostField[]
): string | undefined {
    if (refresh == null) {
        return undefined;
    }
    const refreshUrl = resolveEndpointPath(refresh.endpoint, definition);
    if (refreshUrl == null) {
        lostFields.push({
            path: ["refresh-token", "endpoint"],
            reason: `the refresh endpoint '${refresh.endpoint}' could not be resolved to a request path for flows[].refreshUrl`
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
    return refreshUrl;
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
        return defaults[key]?.includes(wireName) === true
            ? []
            : [
                  {
                      path: [...basePath, key],
                      reason: `SDK Config v1 cannot name token property '${wireName}'; consumers assume the RFC 6749 name`
                  }
              ];
    });
}

/**
 * Resolves a Fern endpoint reference to the request path SDK Config uses for OAuth URLs: either
 * `METHOD /path` (OpenAPI auth overrides) or `<import>.<endpoint>` (Fern definitions).
 */
function resolveEndpointPath(reference: string, definition: FernDefinition): string | undefined {
    const trimmed = reference.trim();
    const methodAndPath = /^[A-Za-z]+\s+(\/\S*)$/.exec(trimmed);
    if (methodAndPath != null) {
        return normalizePath(methodAndPath[1] ?? "");
    }
    const separator = trimmed.lastIndexOf(".");
    if (separator <= 0) {
        return undefined;
    }
    const root = definition.rootApiFile.contents;
    const importedFile = root.imports?.[trimmed.slice(0, separator)];
    const file =
        importedFile == null
            ? undefined
            : Object.entries(definition.namedDefinitionFiles).find(
                  ([filePath]) => normalizeFilePath(filePath) === normalizeFilePath(importedFile)
              )?.[1];
    const service = file?.contents.service;
    const endpoint = service?.endpoints[trimmed.slice(separator + 1)];
    if (service == null || endpoint == null) {
        return undefined;
    }
    return normalizePath(
        `${root["base-path"] ?? ""}/${endpoint["base-path"] ?? service["base-path"]}/${endpoint.path}`
    );
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
