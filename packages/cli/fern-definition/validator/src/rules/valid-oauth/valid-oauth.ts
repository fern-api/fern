import { DocsLinks } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import {
    constructFernFileContext,
    constructRootApiFileContext,
    EndpointResolverImpl,
    TypeResolverImpl
} from "@fern-api/ir-generator";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import terminalLink from "terminal-link";
import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import { validateClientCredentials } from "./validateClientCredentials";
import { HttpEndpointReferenceParser } from "@fern-api/fern-definition-schema";

const DOCS_LINK_MESSAGE = `For details, see the ${terminalLink("docs", DocsLinks.oauth, {
    fallback: (text, url) => `${text}: ${url}`
})}.`;

export const ValidOauthRule: Rule = {
    name: "valid-oauth",
    create: ({ workspace }) => {
        const oauthScheme = maybeGetOAuthScheme({ workspace });
        if (oauthScheme == null) {
            return {};
        }

        const oauthSchema = oauthScheme.schema;
        const typeResolver = new TypeResolverImpl(workspace);
        const endpointResolver = new EndpointResolverImpl(workspace);

        const apiFile = constructRootApiFileContext({
            casingsGenerator: CASINGS_GENERATOR,
            rootApiFile: workspace.definition.rootApiFile.contents
        });

        if (resolvedTokenEndpoint == null) {
            return {
                rootApiFile: {
                    "auth-scheme": ({ name, authScheme }, { relativeFilepath }) => {
                        if (!isRawOAuthSchemeSchema(authScheme)) {
                            return;
                        }

                        const tokenEndpointReference = oauthSchema["get-token"].endpoint;
                        const resolvedTokenEndpoint = endpointResolver.resolveEndpoint({
                            endpoint: tokenEndpointReference,
                            file: apiFile
                        });
                        if (resolvedTokenEndpoint == null) {
                            return [
                                {
                                    severity: "error",
                                    message: `Failed to resolve endpoint ${tokenEndpointReference}`
                                }
                            ];
                        }

                        const refreshEndpointReference = oauthSchema["refresh-token"]?.endpoint;
                        if (refreshEndpointReference == null) {
                            return;
                        }
                        const resolvedRefreshEndpoint = endpointResolver.resolveEndpoint({
                            endpoint: refreshEndpointReference,
                            file: apiFile
                        });
                        if (resolvedRefreshEndpoint == null) {
                            return [
                                {
                                    severity: "error",
                                    message: `Failed to resolve endpoint ${tokenEndpointReference}`
                                }
                            ];
                        }



                    }
                }
            };
        }

        return {
            definitionFile: {
                httpEndpoint: ({ endpointId, endpoint }, { relativeFilepath, contents: definitionFile }) => {
                    if (
                        endpointId !== resolvedTokenEndpoint.endpointId &&
                        endpointId !== resolvedRefreshEndpoint?.endpointId
                    ) {
                        return [];
                    }

                    const file = constructFernFileContext({
                        relativeFilepath,
                        definitionFile,
                        casingsGenerator: CASINGS_GENERATOR,
                        rootApiFile: workspace.definition.rootApiFile.contents
                    });

                    switch (oauthSchema.type) {
                        case "client-credentials": {
                            const violations = validateClientCredentials({
                                endpointId,
                                endpoint,
                                typeResolver,
                                file,
                                resolvedTokenEndpoint,
                                resolvedRefreshEndpoint,
                                clientCredentials: oauthSchema
                            });
                            if (violations.length > 0) {
                                return violations.map((violation) => ({
                                    severity: violation.severity,
                                    message: violation.message + ` ${DOCS_LINK_MESSAGE}`
                                }));
                            }
                            return [];
                        }
                        default:
                            assertNever(oauthSchema.type);
                    }
                }
            }
        };
    }
};

interface OAuthScheme {
    name: string;
    schema: RawSchemas.OAuthSchemeSchema;
}

function maybeGetOAuthScheme({ workspace }: { workspace: FernWorkspace }): OAuthScheme | undefined {
    const authSchemes = workspace.definition.rootApiFile.contents["auth-schemes"];
    if (authSchemes == null) {
        return undefined;
    }
    const oauthSchemePair = Object.entries(authSchemes).find(([_, value]) => isRawOAuthSchemeSchema(value));
    if (oauthSchemePair == null) {
        return undefined;
    }
    return {
        name: oauthSchemePair[0],
        schema: oauthSchemePair[1] as RawSchemas.OAuthSchemeSchema
    };
}


