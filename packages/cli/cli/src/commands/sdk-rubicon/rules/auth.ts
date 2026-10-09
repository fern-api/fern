import { assertNever } from "@fern-api/core-utils";
import type { AuthScheme } from "@postman/sdk-config";

import type { MapperRule, RuleContext } from "../types.js";
import { apiSection, authSchemes } from "./output.js";

type SchemeOf<T extends AuthScheme["type"]> = Extract<AuthScheme, { type: T }>;
type AuthVariable = { environmentVariable?: string; omit?: boolean } | undefined;

/**
 * Basic, bearer and API-key schemes, auth requirements and endpoint security. Runs after the OAuth
 * rule, so requirements see every `auth-schemes` entry.
 */
export const authRule: MapperRule = {
    name: "auth",
    paths: [
        "api.auth.schemes[].id",
        "api.auth.schemes[].type",
        "api.auth.schemes[].location",
        "api.auth.schemes[].name",
        "api.auth.schemes[].prefix",
        "api.auth.schemes[].header",
        "api.auth.schemes[].environmentVariable",
        "api.auth.schemes[].username.environmentVariable",
        "api.auth.schemes[].username.omit",
        "api.auth.schemes[].password.environmentVariable",
        "api.auth.schemes[].password.omit",
        "api.auth.requirements[].schemes",
        "api.auth.endpointSecurity"
    ],
    apply(context) {
        context.ir.api.auth?.schemes.forEach((scheme, index) => {
            const entry = schemeEntry(context, scheme, `api.auth.schemes[${index}]`);
            if (entry != null) {
                authSchemes(context)[scheme.id] = entry;
            }
        });
        if (context.ir.api.auth?.endpointSecurity === true) {
            apiSection(context).auth = { "endpoint-security": {} };
            context.warn(
                "api.auth.endpointSecurity",
                "RUBICON_ENDPOINT_SECURITY",
                "Per-endpoint security drops the CLI's auth registration and its environment variable hints.",
                "Use a requirement list instead if the CLI should keep its auth setup."
            );
            return;
        }
        mapRequirements(context);
    }
};

/** An entry only when the scheme adds an env var or `omit`; otherwise the spec's scheme is enough. */
function schemeEntry(context: RuleContext, scheme: AuthScheme, path: string): Record<string, unknown> | undefined {
    switch (scheme.type) {
        case "basic":
            return basicEntry(scheme);
        case "bearer":
            return bearerEntry(context, scheme, path);
        case "api-key":
            return apiKeyEntry(context, scheme, path);
        case "custom":
            context.error(
                `${path}.type`,
                "RUBICON_AUTH_TYPE",
                "Custom auth schemes have no generators.yml equivalent.",
                "Model the scheme as an API key header, or remove it."
            );
            return undefined;
        case "oauth2":
            // The OAuth rule writes these.
            return undefined;
        default:
            assertNever(scheme);
    }
}

function basicEntry(scheme: SchemeOf<"basic">): Record<string, unknown> | undefined {
    const username = authVariable(scheme.username);
    const password = authVariable(scheme.password);
    if (username == null && password == null) {
        return undefined;
    }
    return { scheme: "basic", ...(username != null ? { username } : {}), ...(password != null ? { password } : {}) };
}

function bearerEntry(
    context: RuleContext,
    scheme: SchemeOf<"bearer">,
    path: string
): Record<string, unknown> | undefined {
    if (scheme.prefix != null) {
        context.error(
            `${path}.prefix`,
            "RUBICON_BEARER_PREFIX",
            "Fern's bearer scheme has no prefix key.",
            "Remove the prefix, or model the scheme as an API key header with a prefix."
        );
    }
    if (scheme.header != null) {
        context.error(
            `${path}.header`,
            "RUBICON_BEARER_HEADER",
            "Fern's bearer scheme has no custom header key.",
            "Remove the header, or model the scheme as an API key header."
        );
    }
    return scheme.environmentVariable != null
        ? { scheme: "bearer", token: { env: scheme.environmentVariable } }
        : undefined;
}

function apiKeyEntry(
    context: RuleContext,
    scheme: SchemeOf<"api-key">,
    path: string
): Record<string, unknown> | undefined {
    if (scheme.location !== "header") {
        context.error(
            `${path}.location`,
            "RUBICON_API_KEY_LOCATION",
            `API keys in a ${scheme.location} are not supported: Fern stops or drops the scheme.`,
            "Send the API key in a header."
        );
        return undefined;
    }
    return scheme.environmentVariable != null || scheme.prefix != null
        ? headerScheme(scheme.name, scheme.environmentVariable, scheme.prefix)
        : undefined;
}

function headerScheme(header: string, env?: string, prefix?: string): Record<string, unknown> {
    return { header, type: "string", ...(env != null ? { env } : {}), ...(prefix != null ? { prefix } : {}) };
}

function authVariable(variable: AuthVariable): Record<string, unknown> | undefined {
    if (variable == null) {
        return undefined;
    }
    const mapped = {
        ...(variable.environmentVariable != null ? { env: variable.environmentVariable } : {}),
        ...(variable.omit != null ? { omit: variable.omit } : {})
    };
    return Object.keys(mapped).length > 0 ? mapped : undefined;
}

/**
 * `api.auth` is one scheme id, or `any:` for alternatives. Fern has no `all:`, so a requirement that
 * names several schemes at once is an error. Without requirements, the schemes that have an entry
 * are the alternatives.
 */
function mapRequirements(context: RuleContext): void {
    const auth = context.ir.api.auth;
    if (auth == null) {
        return;
    }
    const requirements = auth.requirements ?? [];
    requirements.forEach((requirement, index) => {
        if (requirement.schemes.length > 1) {
            context.error(
                `api.auth.requirements[${index}].schemes`,
                "RUBICON_AUTH_ALL",
                "Requiring several schemes together is not supported: Fern has no `all:`.",
                "Use one scheme per requirement."
            );
        }
    });
    const entries = authSchemes(context);
    const ids =
        requirements.length > 0
            ? requirements.flatMap((requirement) => requirement.schemes.slice(0, 1))
            : Object.keys(entries);
    if (ids.length === 0) {
        if (Object.keys(entries).length === 0) {
            delete context.output.generatorsYml["auth-schemes"];
        }
        return;
    }
    for (const id of ids) {
        const scheme = auth.schemes.find((candidate) => candidate.id === id);
        if (scheme != null && entries[id] == null) {
            entries[id] = minimalEntry(scheme);
        }
    }
    apiSection(context).auth = ids.length === 1 ? ids[0] : { any: ids };
}

/** An entry with no settings, so `api.auth` can name a scheme the spec declares. */
function minimalEntry(scheme: AuthScheme): Record<string, unknown> {
    switch (scheme.type) {
        case "basic":
            return { scheme: "basic" };
        case "bearer":
            return { scheme: "bearer" };
        case "api-key":
            return headerScheme(scheme.name);
        case "oauth2":
        case "custom":
            // Rejected or written by the OAuth rule before this point.
            return {};
        default:
            assertNever(scheme);
    }
}
