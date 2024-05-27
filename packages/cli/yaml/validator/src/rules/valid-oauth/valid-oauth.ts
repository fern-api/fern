import { DocsLinks } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import {
    constructFernFileContext,
    constructRootApiFileContext,
    EndpointResolverImpl,
    TypeResolverImpl
} from "@fern-api/ir-generator";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/yaml-schema";
import terminalLink from "terminal-link";
import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import { validateClientCredentials } from "./validateClientCredentials";

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

        const imports = workspace.definition.rootApiFile.contents.imports;
        if (imports == null) {
            return {
                rootApiFile: {
                    file: (_) => {
                        return [
                            {
                                severity: "error",
                                message: `File declares oauth scheme '${oauthScheme.name}', but no imports are declared to reference the required token endpoint(s). ${DOCS_LINK_MESSAGE}`
                            }
                        ];
                    }
                }
            };
        }

        const apiFile = constructRootApiFileContext({
            casingsGenerator: CASINGS_GENERATOR,
            rootApiFile: workspace.definition.rootApiFile.contents
        });

        const resolvedTokenEndpoint = endpointResolver.resolveEndpoint({
            endpoint: oauthSchema["get-token"].endpoint,
            file: apiFile
        });
        if (resolvedTokenEndpoint == null) {
            return {
                rootApiFile: {
                    file: (_) => {
                        return [
                            {
                                severity: "error",
                                message: `File declares oauth scheme '${oauthScheme.name}', but the OAuth 'get-token' endpoint could not be resolved. ${DOCS_LINK_MESSAGE}`
                            }
                        ];
                    }
                }
            };
        }

        const resolvedRefreshEndpoint =
            oauthSchema["refresh-token"] != null
                ? endpointResolver.resolveEndpoint({
                      endpoint: oauthSchema["refresh-token"].endpoint,
                      file: apiFile
                  })
                : undefined;
        if (oauthSchema["refresh-token"] != null && resolvedRefreshEndpoint == null) {
            return {
                rootApiFile: {
                    file: (_) => {
                        return [
                            {
                                severity: "error",
                                message: `File declares oauth scheme '${oauthScheme.name}', but the OAuth 'refresh-token' endpoint could not be resolved. ${DOCS_LINK_MESSAGE}`
                            }
                        ];
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

function isRawOAuthSchemeSchema(rawOAuthSchemeSchema: unknown): rawOAuthSchemeSchema is RawSchemas.OAuthSchemeSchema {
    return (
        (rawOAuthSchemeSchema as RawSchemas.OAuthSchemeSchema).scheme === "oauth" &&
        (rawOAuthSchemeSchema as RawSchemas.OAuthSchemeSchema).type != null &&
        (rawOAuthSchemeSchema as RawSchemas.OAuthSchemeSchema)["get-token"] != null
    );
}
