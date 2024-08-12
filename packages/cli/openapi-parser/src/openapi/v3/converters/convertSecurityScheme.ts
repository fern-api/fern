import { EnumSchema, OauthSecurityScheme, SecurityScheme, Source } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { convertEnum } from "../../../schema/convertEnum";
import { convertSchemaWithExampleToSchema } from "../../../schema/utils/convertSchemaWithExampleToSchema";
import { isReferenceObject } from "../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import { OpenAPIExtension } from "../extensions/extensions";
import { FernOpenAPIExtension } from "../extensions/fernExtensions";
import { getBasicSecuritySchemeNames } from "../extensions/getBasicSecuritySchemeNames";
import { getAccessTokenConfiguration, getRefreshTokenConfiguration } from "../extensions/getOAuthScheme";
import {
    getBasicSecuritySchemeNameAndEnvvar,
    HeaderSecuritySchemeNames,
    SecuritySchemeNames
} from "../extensions/getSecuritySchemeNameAndEnvvars";

export function convertSecurityScheme({
    document,
    securityScheme,
    context,
    source
}: {
    document: OpenAPIV3.Document;
    securityScheme: OpenAPIV3.SecuritySchemeObject | OpenAPIV3.ReferenceObject;
    context: AbstractOpenAPIV3ParserContext;
    source: Source;
}): SecurityScheme | undefined {
    if (isReferenceObject(securityScheme)) {
        throw new Error(`Converting referenced security schemes is unsupported: ${JSON.stringify(securityScheme)}`);
    }
    return convertSecuritySchemeHelper({ document, securityScheme, context, source });
}

function convertSecuritySchemeHelper({
    document,
    securityScheme,
    context,
    source
}: {
    document: OpenAPIV3.Document;
    securityScheme: OpenAPIV3.SecuritySchemeObject;
    context: AbstractOpenAPIV3ParserContext;
    source: Source;
}): SecurityScheme | undefined {
    if (securityScheme.type === "apiKey" && securityScheme.in === "header") {
        const bearerFormat = getExtension<string>(securityScheme, OpenAPIExtension.BEARER_FORMAT);
        const headerNames = getExtension<HeaderSecuritySchemeNames>(
            securityScheme,
            FernOpenAPIExtension.FERN_HEADER_AUTH
        );
        return SecurityScheme.header({
            headerName: securityScheme.name,
            prefix: bearerFormat != null ? "Bearer" : headerNames?.prefix,
            headerVariableName:
                headerNames?.name ?? getExtension<string>(securityScheme, FernOpenAPIExtension.HEADER_VARIABLE_NAME),
            headerEnvVar: headerNames?.env
        });
    } else if (securityScheme.type === "http" && securityScheme.scheme === "bearer") {
        const bearerNames = getExtension<SecuritySchemeNames>(securityScheme, FernOpenAPIExtension.FERN_BEARER_TOKEN);
        return SecurityScheme.bearer({
            tokenVariableName:
                bearerNames?.name ??
                getExtension<string>(securityScheme, FernOpenAPIExtension.BEARER_TOKEN_VARIABLE_NAME),
            tokenEnvVar: bearerNames?.env
        });
    } else if (securityScheme.type === "http" && securityScheme.scheme === "basic") {
        const basicSecuritySchemeNamingAndEnvvar = getBasicSecuritySchemeNameAndEnvvar(securityScheme);
        const basicSecuritySchemeNaming = getBasicSecuritySchemeNames(securityScheme);
        return SecurityScheme.basic({
            usernameVariableName:
                basicSecuritySchemeNamingAndEnvvar?.username?.name ?? basicSecuritySchemeNaming.usernameVariable,
            usernameEnvVar: basicSecuritySchemeNamingAndEnvvar?.username?.env,
            passwordVariableName:
                basicSecuritySchemeNamingAndEnvvar?.password?.name ?? basicSecuritySchemeNaming.passwordVariable,
            passwordEnvVar: basicSecuritySchemeNamingAndEnvvar?.password?.env
        });
    } else if (securityScheme.type === "openIdConnect") {
        return SecurityScheme.bearer({
            tokenVariableName: undefined,
            tokenEnvVar: undefined
        });
    } else if (securityScheme.type === "oauth2") {
        if (securityScheme.flows.clientCredentials != null) {
            // Scopes is a record of the scope name to the scope's description
            // https://swagger.io/docs/specification/authentication/oauth2/
            const scopes = Object.keys(securityScheme.flows.clientCredentials.scopes);

            const maybeOauthAccessTokenConfig = getAccessTokenConfiguration({ securityScheme, context });
            const maybeOauthRefreshTokenConfig = getRefreshTokenConfiguration({ securityScheme, context });
            if (maybeOauthAccessTokenConfig != null) {
                if (securityScheme.flows.clientCredentials.refreshUrl != null && maybeOauthRefreshTokenConfig == null) {
                    context.logger.warn(
                        "`refreshUrl` found in OAS spec, but `x-fern-refresh-token-endpoint` extension not used or invalid. Ignoring refresh token config."
                    );
                } else if (
                    maybeOauthRefreshTokenConfig != null &&
                    securityScheme.flows.clientCredentials.refreshUrl == null
                ) {
                    context.logger.warn(
                        "`x-fern-refresh-token-endpoint` extension used, but `refreshUrl` not found in OAS spec. Ignoring refresh token config."
                    );
                }

                return SecurityScheme.oauth(
                    OauthSecurityScheme.clientCredentials({
                        clientIdEnvVar: undefined,
                        clientSecretEnvVar: undefined,
                        tokenPrefix: undefined,
                        scopes,
                        tokenEndpoint: {
                            endpointReference: securityScheme.flows.clientCredentials.tokenUrl,
                            requestProperties: {
                                clientId: maybeOauthAccessTokenConfig.request.clientId,
                                clientSecret: maybeOauthAccessTokenConfig.request.clientSecret,
                                scopes: maybeOauthAccessTokenConfig.request.scopes
                            },
                            responseProperties: {
                                accessToken: maybeOauthAccessTokenConfig.response.accessToken,
                                expiresIn: maybeOauthAccessTokenConfig.response.expiresIn,
                                refreshToken: maybeOauthAccessTokenConfig.response.refreshToken
                            }
                        },
                        refreshEndpoint:
                            maybeOauthRefreshTokenConfig && securityScheme.flows.clientCredentials.refreshUrl != null
                                ? {
                                      endpointReference: securityScheme.flows.clientCredentials.refreshUrl,
                                      requestProperties: {
                                          refreshToken: maybeOauthRefreshTokenConfig.request.refreshToken
                                      },
                                      responseProperties: {
                                          accessToken: maybeOauthRefreshTokenConfig.response.accessToken,
                                          expiresIn: maybeOauthRefreshTokenConfig.response.expiresIn,
                                          refreshToken: maybeOauthRefreshTokenConfig.response.refreshToken
                                      }
                                  }
                                : undefined
                    })
                );
            } else {
                context.logger.debug(
                    "`x-fern-access-token-endpoint` extension either not used, or incomplete. Creating a partial implementation with bearer auth, given missing information."
                );
            }

            // If you're missing both extensions (full config OR access token config), we don't even try to read the rest of the OpenAPI spec
            // for oauth, since we know we can't generate OAuth without the details in the extensions. If maybeOauthRefreshTokenConfig is missing
            // we do not generate a refresh token endpoint for the same reason.
        }

        const scopesEnum = getScopes(securityScheme, source);
        return SecurityScheme.oauth(OauthSecurityScheme.unrecognized({ scopesEnum }));
    }
    throw new Error(`Failed to convert security scheme ${JSON.stringify(securityScheme)}`);
}

function getScopes(oauthSecurityScheme: OpenAPIV3.OAuth2SecurityScheme, source: Source): EnumSchema | undefined {
    const scopes =
        oauthSecurityScheme.flows.authorizationCode?.scopes ??
        oauthSecurityScheme.flows.clientCredentials?.scopes ??
        oauthSecurityScheme.flows.implicit?.scopes ??
        oauthSecurityScheme.flows.password?.scopes;
    if (scopes != null) {
        const schemaWithExample = convertEnum({
            nameOverride: undefined,
            generatedName: "OauthScope",
            enumValues: Object.keys(scopes),
            fernEnum: Object.fromEntries(
                Object.entries(scopes).map(([scope, description]) => {
                    return [
                        scope,
                        {
                            description
                        }
                    ];
                })
            ),
            _default: undefined,
            description: undefined,
            availability: undefined,
            enumVarNames: undefined,
            wrapAsNullable: false,
            groupName: undefined,
            context: undefined,
            source
        });
        const schema = convertSchemaWithExampleToSchema(schemaWithExample);
        if (schema.type === "enum") {
            return schema;
        }
    }
    return undefined;
}
