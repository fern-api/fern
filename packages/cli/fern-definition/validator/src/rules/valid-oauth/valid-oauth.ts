import { RawSchemas } from "@fern-api/fern-definition-schema";
import { constructRootApiFileContext, EndpointResolverImpl, TypeResolverImpl } from "@fern-api/ir-generator";

import { Rule, RuleViolation } from "../../Rule.js";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator.js";
import { validateRefreshTokenEndpoint } from "./validateRefreshTokenEndpoint.js";
import { validateTokenEndpoint } from "./validateTokenEndpoint.js";

export const ValidOauthRule: Rule = {
    name: "valid-oauth",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        const endpointResolver = new EndpointResolverImpl(workspace);

        const apiFile = constructRootApiFileContext({
            casingsGenerator: CASINGS_GENERATOR,
            rootApiFile: workspace.definition.rootApiFile.contents
        });

        return {
            rootApiFile: {
                oauth: ({ name, oauth }, { relativeFilepath }) => {
                    const violations: RuleViolation[] = [];

                    if (oauth.type === "authorization-code" || oauth.type === "device-code") {
                        return validatePublicClientFlow(oauth);
                    }

                    // client-credentials flow.
                    if (oauth["get-token"] == null) {
                        return [
                            {
                                severity: "fatal",
                                message: "OAuth client-credentials flow requires a `get-token` endpoint."
                            }
                        ];
                    }
                    const tokenEndpointReference = oauth["get-token"].endpoint;
                    const resolvedTokenEndpoint = endpointResolver.resolveEndpoint({
                        endpoint: tokenEndpointReference,
                        file: apiFile
                    });
                    if (resolvedTokenEndpoint == null) {
                        violations.push({
                            severity: "fatal",
                            message: `Failed to resolve endpoint ${tokenEndpointReference}`
                        });
                    } else {
                        violations.push(
                            ...validateTokenEndpoint({
                                endpointId: resolvedTokenEndpoint.endpointId,
                                endpoint: resolvedTokenEndpoint.endpoint,
                                typeResolver,
                                file: resolvedTokenEndpoint.file,
                                tokenEndpoint: oauth["get-token"]
                            })
                        );
                    }

                    const refreshEndpointReference = oauth["refresh-token"]?.endpoint;
                    if (oauth["refresh-token"] != null && refreshEndpointReference != null) {
                        const resolvedRefreshEndpoint = endpointResolver.resolveEndpoint({
                            endpoint: refreshEndpointReference,
                            file: apiFile
                        });
                        if (resolvedRefreshEndpoint == null) {
                            violations.push({
                                severity: "fatal",
                                message: `Failed to resolve endpoint ${tokenEndpointReference}`
                            });
                        } else {
                            violations.push(
                                ...validateRefreshTokenEndpoint({
                                    endpointId: resolvedRefreshEndpoint.endpointId,
                                    endpoint: resolvedRefreshEndpoint.endpoint,
                                    typeResolver,
                                    file: resolvedRefreshEndpoint.file,
                                    refreshEndpoint: oauth["refresh-token"]
                                })
                            );
                        }
                    }

                    return violations;
                }
            }
        };
    }
};

/**
 * Validates the public-client flows (authorization-code + device-code). Unlike client-credentials,
 * these reference external identity-provider URLs (not endpoints in this API), so there is nothing
 * to resolve — we only check that the per-flow required fields are present and well-formed.
 */
function validatePublicClientFlow(oauth: RawSchemas.OAuthSchemeSchema): RuleViolation[] {
    const violations: RuleViolation[] = [];

    // Public client ID. The generated CLI currently only supports a literal `client-id` for these
    // flows (public client IDs are not secret), so reject an env-var-only config loudly here rather
    // than silently emitting a CLI with no `auth login` for the scheme.
    const hasLiteralClientId = oauth["client-id"] != null;
    const hasEnvClientId = oauth["client-id-env"] != null;
    if (!hasLiteralClientId && !hasEnvClientId) {
        violations.push({
            severity: "fatal",
            message: `OAuth ${oauth.type} flow requires a public client ID: set \`client-id\`.`
        });
    } else if (!hasLiteralClientId && hasEnvClientId) {
        violations.push({
            severity: "fatal",
            message: `OAuth ${oauth.type} flow does not support an environment-variable client ID (\`client-id-env\`) yet; set a literal \`client-id\` instead (public client IDs are not secret).`
        });
    }

    const requireUrl = (field: "authorization-url" | "device-authorization-url" | "token-url"): void => {
        if (oauth[field] == null) {
            violations.push({
                severity: "fatal",
                message: `OAuth ${oauth.type} flow requires \`${field}\`.`
            });
        }
    };
    requireUrl("token-url");
    if (oauth.type === "authorization-code") {
        requireUrl("authorization-url");
    } else {
        requireUrl("device-authorization-url");
    }

    if (oauth.type === "authorization-code") {
        const pkceMethod = oauth.pkce?.method;
        if (pkceMethod != null && pkceMethod !== "S256") {
            violations.push({
                severity: "fatal",
                message: `OAuth PKCE method '${pkceMethod}' is not supported; only 'S256' is allowed.`
            });
        }

        const redirectUri = oauth["redirect-uri"];
        if (redirectUri != null) {
            // `redirect-uri` is either a bare URI string or `{ url, ports }`. Validate the primary
            // URI for both forms; for the object form also validate each backup port.
            const url = typeof redirectUri === "string" ? redirectUri : redirectUri.url;
            const urlError = validateRedirectUri(url);
            if (urlError != null) {
                violations.push({ severity: "fatal", message: urlError });
            }
            if (typeof redirectUri !== "string") {
                for (const port of redirectUri.ports ?? []) {
                    if (!Number.isInteger(port) || port < 1 || port > 65535) {
                        violations.push({
                            severity: "fatal",
                            message: `OAuth redirect-uri backup port '${port}' is invalid; ports must be integers in 1–65535.`
                        });
                    }
                }
            }
        }
    } else {
        // device-code: it has no browser callback and does not use PKCE, so `redirect-uri` and
        // `pkce` are authorization-code-only. Reject them loudly rather than silently ignoring.
        if (oauth["redirect-uri"] != null) {
            violations.push({
                severity: "fatal",
                message:
                    "OAuth device-code flow has no browser callback; remove `redirect-uri` (it applies only to the authorization-code flow)."
            });
        }
        if (oauth.pkce != null) {
            violations.push({
                severity: "fatal",
                message:
                    "OAuth device-code flow does not use PKCE; remove `pkce` (it applies only to the authorization-code flow)."
            });
        }
    }

    return violations;
}

/**
 * The generated CLI honors only the *port* of a configured `redirect-uri`; it binds the loopback
 * interface and always serves `http://127.0.0.1:<port>/callback`. So a config that pins a different
 * host (e.g. `localhost`) or path would silently produce a `redirect_uri_mismatch` at login time.
 * Reject those here so the mismatch surfaces at `fern check`. Omitting `redirect-uri` entirely uses
 * an ephemeral port and skips this check.
 */
function validateRedirectUri(redirectUri: string): string | undefined {
    let parsed: URL;
    try {
        parsed = new URL(redirectUri);
    } catch {
        return `OAuth redirect-uri '${redirectUri}' is not a valid URL. Use http://127.0.0.1:<port>/callback, or omit it for an ephemeral port.`;
    }
    if (parsed.protocol !== "http:" || parsed.hostname !== "127.0.0.1") {
        return `OAuth redirect-uri '${redirectUri}' must use host 127.0.0.1 over http — the generated CLI binds 127.0.0.1 and sends that exact host, so 'localhost' or any other host is not honored. Use e.g. http://127.0.0.1:8484/callback.`;
    }
    if (parsed.pathname !== "/callback") {
        return `OAuth redirect-uri '${redirectUri}' must use the path /callback — the generated CLI serves the callback at /callback. Use e.g. http://127.0.0.1:8484/callback.`;
    }
    if (parsed.port === "") {
        return `OAuth redirect-uri '${redirectUri}' must include a port to pin (e.g. http://127.0.0.1:8484/callback), or omit redirect-uri entirely to use an ephemeral port.`;
    }
    return undefined;
}
