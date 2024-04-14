import { EnumSchema, OAuthConfiguration, SecurityScheme } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { convertEnum } from "../../../schema/convertEnum";
import { convertSchemaWithExampleToSchema } from "../../../schema/utils/convertSchemaWithExampleToSchema";
import { isReferenceObject } from "../../../schema/utils/isReferenceObject";
import { OpenAPIExtension } from "../extensions/extensions";
import { FernOpenAPIExtension } from "../extensions/fernExtensions";
import { getBasicSecuritySchemeNames } from "../extensions/getBasicSecuritySchemeNames";
import { getOauthSchemeExtensions } from "../extensions/getOauthScheme";
import {
    getBasicSecuritySchemeNameAndEnvvar,
    HeaderSecuritySchemeNames,
    SecuritySchemeNames
} from "../extensions/getSecuritySchemeNameAndEnvvars";

export function convertSecurityScheme(
    securityScheme: OpenAPIV3.SecuritySchemeObject | OpenAPIV3.ReferenceObject
): SecurityScheme | undefined {
    if (isReferenceObject(securityScheme)) {
        throw new Error(`Converting referenced security schemes is unsupported: ${JSON.stringify(securityScheme)}`);
    }
    return convertSecuritySchemeHelper(securityScheme);
}

function convertSecuritySchemeHelper(securityScheme: OpenAPIV3.SecuritySchemeObject): SecurityScheme | undefined {
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
        const oauthSchemeExtensions = getOauthSchemeExtensions(securityScheme);
        if (securityScheme.flows.clientCredentials != null) {
            const flowBlock = securityScheme.flows.clientCredentials;
            return SecurityScheme.oauth({
                scopesEnum: getScopes(securityScheme),
                configuration: OAuthConfiguration.clientCredentials({
                    tokenEndpoint: flowBlock.tokenUrl,
                    refreshEndpoint: flowBlock.refreshUrl,
                    clientIdEnvVar: oauthSchemeExtensions?.clientIdEnv,
                    clientSecretEnvVar: oauthSchemeExtensions?.clientSecretEnv,
                    defaultScopes: oauthSchemeExtensions?.defaultScopes,
                    tokenPrefix: oauthSchemeExtensions?.tokenPrefix,
                    redirectUri: oauthSchemeExtensions?.redirectUri
                })
            });
        } else if (securityScheme.flows.authorizationCode != null) {
            const flowBlock = securityScheme.flows.authorizationCode;
            return SecurityScheme.oauth({
                scopesEnum: getScopes(securityScheme),
                configuration: OAuthConfiguration.authorizationCode({
                    tokenEndpoint: flowBlock.tokenUrl,
                    authorizationEndpoint: flowBlock.authorizationUrl,
                    refreshEndpoint: flowBlock.refreshUrl,
                    clientIdEnvVar: oauthSchemeExtensions?.clientIdEnv,
                    clientSecretEnvVar: oauthSchemeExtensions?.clientSecretEnv,
                    authorizationCodeEnvVar: oauthSchemeExtensions?.authorizationCodeEnv,
                    defaultScopes: oauthSchemeExtensions?.defaultScopes,
                    tokenPrefix: oauthSchemeExtensions?.tokenPrefix,
                    redirectUri: oauthSchemeExtensions?.redirectUri
                })
            });
        } else if (securityScheme.flows.password != null) {
            const flowBlock = securityScheme.flows.password;
            return SecurityScheme.oauth({
                scopesEnum: getScopes(securityScheme),
                configuration: OAuthConfiguration.password({
                    tokenEndpoint: flowBlock.tokenUrl,
                    refreshEndpoint: flowBlock.refreshUrl,
                    clientIdEnvVar: oauthSchemeExtensions?.clientIdEnv,
                    clientSecretEnvVar: oauthSchemeExtensions?.clientSecretEnv,
                    defaultScopes: oauthSchemeExtensions?.defaultScopes,
                    tokenPrefix: oauthSchemeExtensions?.tokenPrefix,
                    redirectUri: oauthSchemeExtensions?.redirectUri
                })
            });
        } else if (securityScheme.flows.implicit != null) {
            const flowBlock = securityScheme.flows.implicit;
            return SecurityScheme.oauth({
                scopesEnum: getScopes(securityScheme),
                configuration: OAuthConfiguration.implicit({
                    authorizationEndpoint: flowBlock.authorizationUrl,
                    refreshEndpoint: flowBlock.refreshUrl,
                    clientIdEnvVar: oauthSchemeExtensions?.clientIdEnv,
                    clientSecretEnvVar: oauthSchemeExtensions?.clientSecretEnv,
                    authorizationCodeEnvVar: oauthSchemeExtensions?.authorizationCodeEnv,
                    defaultScopes: oauthSchemeExtensions?.defaultScopes,
                    tokenPrefix: oauthSchemeExtensions?.tokenPrefix,
                    redirectUri: oauthSchemeExtensions?.redirectUri
                })
            });
        }
        return SecurityScheme.oauth({
            scopesEnum: getScopes(securityScheme),
            configuration: undefined
        });
    }
    throw new Error(`Failed to convert security scheme ${JSON.stringify(securityScheme)}`);
}

function getScopes(oauthSecurityScheme: OpenAPIV3.OAuth2SecurityScheme): EnumSchema | undefined {
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
            description: undefined,
            enumVarNames: undefined,
            wrapAsNullable: false,
            groupName: undefined,
            context: undefined
        });
        const schema = convertSchemaWithExampleToSchema(schemaWithExample);
        if (schema.type === "enum") {
            return schema;
        }
    }
    return undefined;
}
