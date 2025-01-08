import terminalLink from "terminal-link";

import { DocsLinks } from "@fern-api/configuration-loader";
import { EndpointResolverImpl, TypeResolverImpl, constructRootApiFileContext } from "@fern-api/ir-generator";

import { Rule, RuleViolation } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import { validateRefreshTokenEndpoint } from "./validateRefreshTokenEndpoint";
import { validateTokenEndpoint } from "./validateTokenEndpoint";

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

                    const tokenEndpointReference = oauth["get-token"].endpoint;
                    const resolvedTokenEndpoint = endpointResolver.resolveEndpoint({
                        endpoint: tokenEndpointReference,
                        file: apiFile
                    });
                    if (resolvedTokenEndpoint == null) {
                        violations.push({
                            severity: "error",
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
                                severity: "error",
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
