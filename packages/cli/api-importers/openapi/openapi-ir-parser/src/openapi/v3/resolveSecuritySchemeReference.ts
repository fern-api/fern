import { CliError } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "../../schema/utils/isReferenceObject.js";

const SECURITY_SCHEME_REFERENCE_PREFIX = "#/components/securitySchemes/";

export function resolveSecuritySchemeReference(
    document: OpenAPIV3.Document,
    securityScheme: OpenAPIV3.ReferenceObject
): OpenAPIV3.SecuritySchemeObject {
    if (
        document.components?.securitySchemes == null ||
        !securityScheme.$ref.startsWith(SECURITY_SCHEME_REFERENCE_PREFIX)
    ) {
        throw new CliError({
            message: `Failed to resolve ${securityScheme.$ref}`,
            code: CliError.Code.ReferenceError
        });
    }
    const securitySchemeKey = securityScheme.$ref.substring(SECURITY_SCHEME_REFERENCE_PREFIX.length);
    const resolvedSecurityScheme = document.components.securitySchemes[securitySchemeKey];
    if (resolvedSecurityScheme == null) {
        throw new CliError({
            message: `${securityScheme.$ref} is undefined`,
            code: CliError.Code.ReferenceError
        });
    }
    return isReferenceObject(resolvedSecurityScheme)
        ? resolveSecuritySchemeReference(document, resolvedSecurityScheme)
        : resolvedSecurityScheme;
}
