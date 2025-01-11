import { OpenAPIV3 } from "openapi-types";

import { ApiAuth, AuthScheme, AuthSchemesRequirement } from "@fern-fern/ir-sdk/api";

export function constructEndpointSecurity(apiAuth: ApiAuth): OpenAPIV3.SecurityRequirementObject[] {
    return AuthSchemesRequirement._visit<OpenAPIV3.SecurityRequirementObject[]>(apiAuth.requirement, {
        all: () => {
            return [
                apiAuth.schemes.reduce<OpenAPIV3.SecurityRequirementObject>(
                    (acc, scheme) => ({
                        ...acc,
                        [getNameForAuthScheme(scheme)]: []
                    }),
                    {}
                )
            ];
        },
        any: () =>
            apiAuth.schemes.map((scheme) => ({
                [getNameForAuthScheme(scheme)]: []
            })),
        _other: () => {
            throw new Error("Unknown auth scheme requiremen: " + apiAuth.requirement);
        }
    });
}

export function constructSecuritySchemes(apiAuth: ApiAuth): Record<string, OpenAPIV3.SecuritySchemeObject> {
    const securitySchemes: Record<string, OpenAPIV3.SecuritySchemeObject> = {};

    for (const scheme of apiAuth.schemes) {
        securitySchemes[getNameForAuthScheme(scheme)] = AuthScheme._visit<OpenAPIV3.SecuritySchemeObject>(scheme, {
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
            _other: () => {
                throw new Error("Unknown auth scheme: " + scheme.type);
            }
        });
    }

    return securitySchemes;
}

function getNameForAuthScheme(authScheme: AuthScheme): string {
    return AuthScheme._visit(authScheme, {
        bearer: () => "BearerAuth",
        basic: () => "BasicAuth",
        oauth: () => "BearerAuth",
        header: (header) => `${header.name.name.pascalCase.unsafeName}Auth`,
        _other: () => {
            throw new Error("Unknown auth scheme: " + authScheme.type);
        }
    });
}
