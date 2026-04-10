import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { OpenAPIV3 } from "openapi-types";

export function constructEndpointSecurity(
    apiAuth: FernIr.ApiAuth,
    caseConverter: CaseConverter
): OpenAPIV3.SecurityRequirementObject[] {
    return FernIr.AuthSchemesRequirement._visit<OpenAPIV3.SecurityRequirementObject[]>(apiAuth.requirement, {
        all: () => {
            return [
                apiAuth.schemes.reduce<OpenAPIV3.SecurityRequirementObject>(
                    (acc, scheme) => ({
                        ...acc,
                        [getNameForAuthScheme(scheme, caseConverter)]: []
                    }),
                    {}
                )
            ];
        },
        any: () =>
            apiAuth.schemes.map((scheme) => ({
                [getNameForAuthScheme(scheme, caseConverter)]: []
            })),
        endpointSecurity: () => {
            return [
                apiAuth.schemes.reduce<OpenAPIV3.SecurityRequirementObject>(
                    (acc, scheme) => ({
                        ...acc,
                        [getNameForAuthScheme(scheme, caseConverter)]: []
                    }),
                    {}
                )
            ];
        },
        _other: () => {
            throw new Error("Unknown auth scheme requiremen: " + apiAuth.requirement);
        }
    });
}

export function constructSecuritySchemes(
    apiAuth: FernIr.ApiAuth,
    caseConverter: CaseConverter
): Record<string, OpenAPIV3.SecuritySchemeObject> {
    const securitySchemes: Record<string, OpenAPIV3.SecuritySchemeObject> = {};

    for (const scheme of apiAuth.schemes) {
        securitySchemes[getNameForAuthScheme(scheme, caseConverter)] =
            FernIr.AuthScheme._visit<OpenAPIV3.SecuritySchemeObject>(scheme, {
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
                    name: getWireValue(header.name)
                }),
                oauth: () => ({
                    type: "http",
                    scheme: "bearer"
                }),
                inferred: () => ({
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

function getNameForAuthScheme(authScheme: FernIr.AuthScheme, caseConverter: CaseConverter): string {
    return FernIr.AuthScheme._visit(authScheme, {
        bearer: (bearer) => caseConverter.pascalUnsafe(bearer.key),
        basic: (basic) => caseConverter.pascalUnsafe(basic.key),
        oauth: (oauth) => caseConverter.pascalUnsafe(oauth.key),
        inferred: (inferred) => caseConverter.pascalUnsafe(inferred.key),
        header: (header) => caseConverter.pascalUnsafe(header.key),
        _other: () => {
            throw new Error("Unknown auth scheme: " + authScheme.type);
        }
    });
}
