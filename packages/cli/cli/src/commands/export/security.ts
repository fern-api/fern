import { createCasingsGeneratorForInflation, inflateNameOrString } from "@fern-api/casings-generator";
import { ApiAuth, AuthScheme, AuthSchemesRequirement, IntermediateRepresentation } from "@fern-api/ir-sdk";
import { OpenAPIV3 } from "openapi-types";

export function constructEndpointSecurity(
    apiAuth: ApiAuth,
    ir: IntermediateRepresentation
): OpenAPIV3.SecurityRequirementObject[] {
    return AuthSchemesRequirement._visit<OpenAPIV3.SecurityRequirementObject[]>(apiAuth.requirement, {
        all: () => {
            return [
                apiAuth.schemes.reduce<OpenAPIV3.SecurityRequirementObject>(
                    (acc, scheme) => ({
                        ...acc,
                        [getNameForAuthScheme(scheme, ir)]: []
                    }),
                    {}
                )
            ];
        },
        any: () =>
            apiAuth.schemes.map((scheme) => ({
                [getNameForAuthScheme(scheme, ir)]: []
            })),
        endpointSecurity: () => {
            // When auth is endpoint-security, security is defined per-endpoint, not globally
            return [];
        },
        _other: () => {
            throw new Error("Unknown auth scheme requirement: " + apiAuth.requirement);
        }
    });
}

export function constructSecuritySchemes(
    apiAuth: ApiAuth,
    ir: IntermediateRepresentation
): Record<string, OpenAPIV3.SecuritySchemeObject> {
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
            securitySchemes[getNameForAuthScheme(scheme, ir)] = oasScheme;
        }
    }

    return securitySchemes;
}

function getNameForAuthScheme(authScheme: AuthScheme, ir: IntermediateRepresentation): string {
    const casingsGenerator = createCasingsGeneratorForInflation(ir);
    return AuthScheme._visit(authScheme, {
        bearer: () => "BearerAuth",
        inferred: () => "InferredAuth",
        basic: () => "BasicAuth",
        oauth: () => "BearerAuth",
        header: (header) => `${inflateNameOrString(header.name.name, casingsGenerator).pascalCase.unsafeName}Auth`,
        _other: () => {
            throw new Error("Unknown auth scheme: " + authScheme.type);
        }
    });
}
