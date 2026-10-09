import { assertNever } from "@fern-api/core-utils";
import type { AuthScheme } from "@postman/sdk-config";

import type { MapperRule, RuleContext, SpecPostOperation } from "../types.js";
import { authSchemes } from "./output.js";

type OAuthScheme = Extract<AuthScheme, { type: "oauth2" }>;
type OAuthFlow = OAuthScheme["flows"][number];
type ClientCredentialsFlow = Extract<OAuthFlow, { type: "client-credentials" }>;

/** RFC 6749 property names, and the `get-token` keys Fern gives them. */
const TOKEN_REQUEST = { client_id: "client-id", client_secret: "client-secret" };
const TOKEN_RESPONSE = { access_token: "access-token", expires_in: "expires-in", refresh_token: "refresh-token" };
const SCOPE_PROPERTIES = ["scopes", "scope"];

/**
 * OAuth client credentials to `scheme: oauth`, `type: client-credentials`, with `get-token` naming
 * the spec's token operation. Authorization code (browser login) is written without the public
 * client id, which SDK Config cannot hold; Fern refuses to generate until the user adds it.
 */
export const oauthRule: MapperRule = {
    name: "oauth",
    paths: [
        "api.auth.schemes[].clientId.environmentVariable",
        "api.auth.schemes[].clientSecret.environmentVariable",
        "api.auth.schemes[].tokenHeader",
        "api.auth.schemes[].tokenPrefix",
        "api.auth.schemes[].flows[].type",
        "api.auth.schemes[].flows[].tokenUrl",
        "api.auth.schemes[].flows[].refreshUrl",
        "api.auth.schemes[].flows[].authorizationUrl",
        "api.auth.schemes[].flows[].scopes[].name"
    ],
    apply(context) {
        context.ir.api.auth?.schemes.forEach((scheme, index) => {
            if (scheme.type !== "oauth2") {
                return;
            }
            const entry = mapScheme(context, scheme, `api.auth.schemes[${index}]`);
            if (entry != null) {
                authSchemes(context)[scheme.id] = entry;
            }
        });
    }
};

function mapScheme(context: RuleContext, scheme: OAuthScheme, path: string): Record<string, unknown> | undefined {
    let entry: Record<string, unknown> | undefined;
    scheme.flows.forEach((flow, index) => {
        const flowPath = `${path}.flows[${index}]`;
        if (entry != null) {
            context.error(
                `${flowPath}.type`,
                "RUBICON_OAUTH_SECOND_FLOW",
                "Fern takes one OAuth flow per scheme.",
                "Keep one flow, or split the flows into separate schemes."
            );
            return;
        }
        entry = flowEntry(context, scheme, flow, flowPath);
    });
    return entry;
}

function flowEntry(
    context: RuleContext,
    scheme: OAuthScheme,
    flow: OAuthFlow,
    flowPath: string
): Record<string, unknown> | undefined {
    switch (flow.type) {
        case "client-credentials":
            return clientCredentials(context, scheme, flow, flowPath);
        case "authorization-code": {
            context.warn(
                flowPath,
                "RUBICON_PUBLIC_CLIENT_ID",
                "A browser-login (authorization-code) flow needs a public client id, which SDK Config cannot hold; `fern generate` fails until it is set.",
                `Add \`client-id\` under auth-schemes.${scheme.id} in generators.yml before generating. Rerunning rubicon keeps it.`
            );
            const scopes = scopeNames(flow.scopes);
            return {
                scheme: "oauth",
                type: "authorization-code",
                "authorization-url": flow.authorizationUrl,
                "token-url": flow.tokenUrl,
                ...(scopes.length > 0 ? { scopes } : {})
            };
        }
        case "implicit":
        case "password":
            context.error(
                `${flowPath}.type`,
                "RUBICON_OAUTH_FLOW",
                `OAuth flow '${flow.type}' is not supported by Fern (client-credentials and authorization-code only).`,
                "Remove the flow."
            );
            return undefined;
        default:
            assertNever(flow);
    }
}

function clientCredentials(
    context: RuleContext,
    scheme: OAuthScheme,
    flow: ClientCredentialsFlow,
    flowPath: string
): Record<string, unknown> | undefined {
    const token = findPostOperation(context, flow.tokenUrl);
    if (token == null) {
        context.error(
            `${flowPath}.tokenUrl`,
            "RUBICON_TOKEN_ENDPOINT",
            `No POST operation in the spec matches ${flow.tokenUrl}.`,
            "Add the token operation to the spec."
        );
        return undefined;
    }
    const [tokenPath, operation] = token;
    if (!operation.responseProperties.includes("access_token")) {
        context.error(
            `${flowPath}.tokenUrl`,
            "RUBICON_TOKEN_RESPONSE",
            `The token operation POST ${tokenPath} has no access_token response property.`,
            "Point tokenUrl at the operation that returns access_token."
        );
        return undefined;
    }
    context.warn(
        flowPath,
        "RUBICON_INFERRED",
        "get-token request and response properties were inferred from the spec by RFC 6749 names.",
        "Edit get-token in generators.yml if the token API uses other names."
    );
    const scopes = scopeNames(flow.scopes);
    const scopeProperty = SCOPE_PROPERTIES.find((name) => operation.requestProperties.includes(name));
    return {
        scheme: "oauth",
        type: "client-credentials",
        ...(scheme.clientId?.environmentVariable != null
            ? { "client-id-env": scheme.clientId.environmentVariable }
            : {}),
        ...(scheme.clientSecret?.environmentVariable != null
            ? { "client-secret-env": scheme.clientSecret.environmentVariable }
            : {}),
        ...(scheme.tokenHeader != null ? { "token-header": scheme.tokenHeader } : {}),
        ...(scheme.tokenPrefix != null ? { "token-prefix": scheme.tokenPrefix } : {}),
        ...(scopes.length > 0 ? { scopes } : {}),
        "get-token": {
            endpoint: `POST ${tokenPath}`,
            "request-properties": {
                ...properties(TOKEN_REQUEST, operation.requestProperties, "$request"),
                ...(scopes.length > 0 && scopeProperty != null ? { scopes: `$request.${scopeProperty}` } : {})
            },
            "response-properties": properties(TOKEN_RESPONSE, operation.responseProperties, "$response")
        },
        ...refreshEntry(context, flow, flowPath)
    };
}

function refreshEntry(context: RuleContext, flow: ClientCredentialsFlow, flowPath: string): Record<string, unknown> {
    if (flow.refreshUrl == null) {
        return {};
    }
    const refresh = findPostOperation(context, flow.refreshUrl);
    if (refresh == null) {
        context.warn(
            `${flowPath}.refreshUrl`,
            "RUBICON_REFRESH_ENDPOINT",
            `No POST operation matches ${flow.refreshUrl}; token refresh is not configured.`,
            "Add the refresh operation to the spec."
        );
        return {};
    }
    const [refreshPath, operation] = refresh;
    return {
        "refresh-token": {
            endpoint: `POST ${refreshPath}`,
            "request-properties": { "refresh-token": "$request.refresh_token" },
            "response-properties": properties(TOKEN_RESPONSE, operation.responseProperties, "$response")
        }
    };
}

function scopeNames(scopes: Array<{ name: string }> | undefined): string[] {
    return (scopes ?? []).map((scope) => scope.name);
}

function properties(
    names: Record<string, string>,
    available: string[],
    prefix: "$request" | "$response"
): Record<string, string> {
    return Object.fromEntries(
        Object.entries(names)
            .filter(([property]) => available.includes(property))
            .map(([property, key]) => [key, `${prefix}.${property}`])
    );
}

/** Matches a URL's path, after stripping a spec server URL or an environment URL, to a spec POST operation. */
function findPostOperation(context: RuleContext, url: string): [string, SpecPostOperation] | undefined {
    const baseUrls = [
        ...context.input.specFacts.flatMap((facts) => facts?.serverUrls ?? []),
        ...(context.ir.api.environments ?? []).flatMap((environment) => environment.urls.map((entry) => entry.url))
    ];
    const candidates = [
        ...baseUrls.flatMap((base) => {
            const stripped = stripBase(url, base);
            return stripped != null ? [stripped] : [];
        }),
        urlPath(url)
    ];
    for (const facts of context.input.specFacts) {
        for (const candidate of candidates) {
            const operation = facts?.postOperations[candidate];
            if (operation != null) {
                return [candidate, operation];
            }
        }
    }
    return undefined;
}

function stripBase(url: string, base: string): string | undefined {
    const trimmed = base.replace(/\/+$/, "");
    return url.startsWith(`${trimmed}/`) ? url.slice(trimmed.length) : undefined;
}

function urlPath(url: string): string {
    try {
        return new URL(url).pathname;
    } catch {
        // Not an absolute URL: treat it as a path.
        return url.startsWith("/") ? url : `/${url}`;
    }
}
