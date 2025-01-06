import { OpenAPIV3 } from "openapi-types";

import { EnumSchema, SecurityScheme, Source } from "@fern-api/openapi-ir";

import { getExtension } from "../../../getExtension";
import { convertEnum } from "../../../schema/convertEnum";
import { convertSchemaWithExampleToSchema } from "../../../schema/utils/convertSchemaWithExampleToSchema";
import { isReferenceObject } from "../../../schema/utils/isReferenceObject";
import { OpenAPIExtension } from "../extensions/extensions";
import { FernOpenAPIExtension } from "../extensions/fernExtensions";
import { getBasicSecuritySchemeNames } from "../extensions/getBasicSecuritySchemeNames";
import {
    HeaderSecuritySchemeNames,
    SecuritySchemeNames,
    getBasicSecuritySchemeNameAndEnvvar
} from "../extensions/getSecuritySchemeNameAndEnvvars";

export function convertSecurityScheme(
    securityScheme: OpenAPIV3.SecuritySchemeObject | OpenAPIV3.ReferenceObject,
    source: Source
): SecurityScheme | undefined {
    if (isReferenceObject(securityScheme)) {
        throw new Error(`Converting referenced security schemes is unsupported: ${JSON.stringify(securityScheme)}`);
    }
    return convertSecuritySchemeHelper(securityScheme, source);
}

function convertSecuritySchemeHelper(
    securityScheme: OpenAPIV3.SecuritySchemeObject,
    source: Source
): SecurityScheme | undefined {
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
        return SecurityScheme.oauth({
            scopesEnum: getScopes(securityScheme, source)
        });
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
            title: undefined,
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
            source,
            inline: undefined
        });
        const schema = convertSchemaWithExampleToSchema(schemaWithExample);
        if (schema.type === "enum") {
            return schema;
        }
    }
    return undefined;
}
