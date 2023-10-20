import { SecurityScheme } from "@fern-fern/openapi-ir-model/commons";
import { OpenAPIV3 } from "openapi-types";
import { OpenAPIExtension } from "../extensions/extensions";
import { FernOpenAPIExtension } from "../extensions/fernExtensions";
import { getBasicSecuritySchemeNames } from "../extensions/getBasicSecuritySchemeNames";
import { getExtension } from "../extensions/getExtension";
import { isReferenceObject } from "../utils/isReferenceObject";

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
        return SecurityScheme.header({
            headerName: securityScheme.name,
            prefix: bearerFormat != null ? "Bearer" : undefined,
        });
    } else if (securityScheme.type === "http" && securityScheme.scheme === "bearer") {
        const tokenVariableName = getExtension<string>(securityScheme, FernOpenAPIExtension.BEARER_TOKEN_VARIABLE_NAME);
        return SecurityScheme.bearer({
            tokenVariableName: tokenVariableName ?? undefined,
        });
    } else if (securityScheme.type === "http" && securityScheme.scheme === "basic") {
        const basicSecuritySchemeNaming = getBasicSecuritySchemeNames(securityScheme);
        return SecurityScheme.basic({
            usernameVariableName: basicSecuritySchemeNaming.usernameVariable ?? undefined,
            passwordVariableName: basicSecuritySchemeNaming.passwordVariable ?? undefined,
        });
    } else if (securityScheme.type === "openIdConnect") {
        return SecurityScheme.bearer({
            tokenVariableName: undefined,
        });
    } else if (securityScheme.type === "oauth2") {
        return SecurityScheme.bearer({
            tokenVariableName: undefined,
        });
    }
    throw new Error(`Failed to convert security scheme ${JSON.stringify(securityScheme)}`);
}
