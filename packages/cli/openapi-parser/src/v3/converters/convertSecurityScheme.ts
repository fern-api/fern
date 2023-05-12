import { SecurityScheme } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { getBasicSecuritySchemeNames } from "../extensions/getBasicSecuritySchemeNames";
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
        return SecurityScheme.header({
            headerName: securityScheme.name,
        });
    } else if (securityScheme.type === "http" && securityScheme.scheme === "bearer") {
        return SecurityScheme.bearer();
    } else if (securityScheme.type === "http" && securityScheme.scheme === "basic") {
        const basicSecuritySchemeNaming = getBasicSecuritySchemeNames(securityScheme);
        return SecurityScheme.basic({
            usernameVariableName: basicSecuritySchemeNaming.usernameVariable ?? undefined,
            passwordVariableName: basicSecuritySchemeNaming.passwordVariable ?? undefined,
        });
    } else if (securityScheme.type === "openIdConnect") {
        return SecurityScheme.bearer();
    } else if (securityScheme.type === "oauth2") {
        return SecurityScheme.bearer();
    }
    throw new Error(`Failed to convert security scheme ${JSON.stringify(securityScheme)}`);
}
