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

    if (oauth["client-id"] == null && oauth["client-id-env"] == null) {
        violations.push({
            severity: "fatal",
            message: `OAuth ${oauth.type} flow requires a public client ID: set \`client-id\` or \`client-id-env\`.`
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

    const pkceMethod = oauth.pkce?.method;
    if (pkceMethod != null && pkceMethod !== "S256") {
        violations.push({
            severity: "fatal",
            message: `OAuth PKCE method '${pkceMethod}' is not supported; only 'S256' is allowed.`
        });
    }

    const redirectUri = oauth["redirect-uri"];
    if (redirectUri != null && !isLoopbackRedirectUri(redirectUri)) {
        violations.push({
            severity: "fatal",
            message: `OAuth redirect-uri '${redirectUri}' must be a loopback address (http://127.0.0.1 or http://localhost).`
        });
    }

    return violations;
}

function isLoopbackRedirectUri(redirectUri: string): boolean {
    try {
        const parsed = new URL(redirectUri);
        return parsed.protocol === "http:" && (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost");
    } catch {
        return false;
    }
}
