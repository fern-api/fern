import { ApiAuth, AuthScheme, AuthSchemesRequirement } from "@fern-api/ir-sdk";
import type { OpenAPIV3 } from "openapi-types";

export function constructEndpointSecurity(apiAuth: ApiAuth): OpenAPIV3.SecurityRequirementObject[] {
    return AuthSchemesRequirement._visit<OpenAPIV3.SecurityRequirementObject[]>(apiAuth.requirement, {
        all: () => {
            const requirement: OpenAPIV3.SecurityRequirementObject = {};
            for (const scheme of apiAuth.schemes) {
                requirement[getNameForAuthScheme(scheme)] = [];
            }
            return [requirement];
        },
        any: () =>
            apiAuth.schemes.map((scheme) => ({
                [getNameForAuthScheme(scheme)]: []
            })),
        endpointSecurity: () => {
            return [];
        },
        _other: () => {
            throw new Error("Unknown auth scheme requirement: " + apiAuth.requirement);
        }
    });
}

export function constructSecuritySchemes(apiAuth: ApiAuth): Record<string, OpenAPIV3.SecuritySchemeObject> {
    const securitySchemes: Record<string, OpenAPIV3.SecuritySchemeObject> = {};

    for (const scheme of apiAuth.schemes) {
        const oasScheme = AuthScheme._visit<OpenAPIV3.SecuritySchemeObject | undefined>(scheme, {
            bearer: () => ({
                type: "http",
                scheme: "bearer"
            }),
            basic: () => ({
                type: "http",
                scheme: "basic"
            }),
            header: (header) => ({
                type: "apiKey",
                in: "header",
                name: header.name.wireValue
            }),
            oauth: () => ({
                type: "http",
                scheme: "bearer"
            }),
            inferred: () => undefined,
            _other: () => {
                throw new Error("Unknown auth scheme: " + scheme.type);
            }
        });
        if (oasScheme) {
            securitySchemes[getNameForAuthScheme(scheme)] = oasScheme;
        }
    }

    return securitySchemes;
}

function getNameForAuthScheme(authScheme: AuthScheme): string {
    return AuthScheme._visit(authScheme, {
        bearer: () => "BearerAuth",
        inferred: () => "InferredAuth",
        basic: () => "BasicAuth",
        oauth: () => "BearerAuth",
        header: (header) => `${header.name.name.pascalCase.unsafeName}Auth`,
        _other: () => {
            throw new Error("Unknown auth scheme: " + authScheme.type);
        }
    });
}
