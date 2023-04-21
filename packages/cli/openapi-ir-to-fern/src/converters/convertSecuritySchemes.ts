import { RawSchemas } from "@fern-api/yaml-schema";
import { SecurityScheme, SecuritySchemeId } from "@fern-fern/openapi-ir-model/ir";

export interface FernAuth {
    auth: string | undefined;
    authSchemes: Record<string, RawSchemas.AuthSchemeDeclarationSchema> | undefined;
}

export function convertSecuritySchemes(securitySchemes: Record<SecuritySchemeId, SecurityScheme>): FernAuth {
    let auth: string | undefined = undefined;
    const authSchemes: Record<string, RawSchemas.AuthSchemeDeclarationSchema> = {};

    for (const [id, securityScheme] of Object.entries(securitySchemes)) {
        if (securityScheme.type === "basic" && auth == null) {
            auth = "basic";
        } else if (securityScheme.type === "bearer" && auth == null) {
            auth = "bearer";
        }

        if (securityScheme.type === "header") {
            authSchemes[id] = {
                header: securityScheme.headerName,
                name: "apiKey",
                type: "string",
            };
            if (auth == null) {
                auth = id;
            }
        }
    }

    return {
        auth,
        authSchemes: Object.keys(authSchemes).length === 0 ? undefined : authSchemes,
    };
}
