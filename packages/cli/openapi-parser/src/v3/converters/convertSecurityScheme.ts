import { SecurityScheme } from "@fern-fern/openapi-ir-model/commons";
import { EnumSchema } from "@fern-fern/openapi-ir-model/finalIr";
import { OpenAPIV3 } from "openapi-types";
import { OpenAPIExtension } from "../extensions/extensions";
import { FernOpenAPIExtension } from "../extensions/fernExtensions";
import { getExtension } from "../extensions/getExtension";
import { getBasicSecuritySchemeNames, SecuritySchemeNames } from "../extensions/getSecuritySchemeNames";
import { convertSchemaWithExampleToSchema } from "../utils/convertSchemaWithExampleToSchema";
import { isReferenceObject } from "../utils/isReferenceObject";
import { convertEnum } from "./schema/convertEnum";

export function convertSecurityScheme(
    openapi: OpenAPIV3.Document,
    securityScheme: OpenAPIV3.SecuritySchemeObject | OpenAPIV3.ReferenceObject
): SecurityScheme | undefined {
    if (isReferenceObject(securityScheme)) {
        throw new Error(`Converting referenced security schemes is unsupported: ${JSON.stringify(securityScheme)}`);
    }
    return convertSecuritySchemeHelper(openapi, securityScheme);
}

function convertSecuritySchemeHelper(
    openapi: OpenAPIV3.Document,
    securityScheme: OpenAPIV3.SecuritySchemeObject
): SecurityScheme | undefined {
    if (securityScheme.type === "apiKey" && securityScheme.in === "header") {
        const bearerFormat = getExtension<string>(securityScheme, OpenAPIExtension.BEARER_FORMAT);
        const bearerNames = getExtension<SecuritySchemeNames>(openapi, FernOpenAPIExtension.FERN_BEARER_TOKEN);
        return SecurityScheme.header({
            headerName: securityScheme.name,
            prefix: bearerFormat != null ? "Bearer" : undefined,
            headerVariableName: bearerNames?.name,
            headerEnvVar: bearerNames?.envvar
        });
    } else if (securityScheme.type === "http" && securityScheme.scheme === "bearer") {
        const bearerNames = getExtension<SecuritySchemeNames>(openapi, FernOpenAPIExtension.FERN_BEARER_TOKEN);
        return SecurityScheme.bearer({
            tokenVariableName: bearerNames?.name,
            tokenEnvVar: bearerNames?.envvar
        });
    } else if (securityScheme.type === "http" && securityScheme.scheme === "basic") {
        const basicSecuritySchemeNaming = getBasicSecuritySchemeNames(openapi);
        return SecurityScheme.basic({
            usernameVariableName: basicSecuritySchemeNaming?.username?.name,
            usernameEnvVar: basicSecuritySchemeNaming?.username?.envvar,
            passwordVariableName: basicSecuritySchemeNaming?.password?.name,
            passwordEnvVar: basicSecuritySchemeNaming?.password?.envvar
        });
    } else if (securityScheme.type === "openIdConnect") {
        return SecurityScheme.bearer({
            tokenVariableName: undefined,
            tokenEnvVar: undefined
        });
    } else if (securityScheme.type === "oauth2") {
        return SecurityScheme.oauth({
            scopesEnum: getScopes(securityScheme)
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
            groupName: undefined
        });
        const schema = convertSchemaWithExampleToSchema(schemaWithExample);
        if (schema.type === "enum") {
            return schema;
        }
    }
    return undefined;
}
