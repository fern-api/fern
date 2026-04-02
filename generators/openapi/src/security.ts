import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { OpenAPIV3 } from "openapi-types";

const caseConverter = new CaseConverter({ generationLanguage: undefined, keywords: undefined, smartCasing: true });

export function constructEndpointSecurity(apiAuth: FernIr.ApiAuth): OpenAPIV3.SecurityRequirementObject[] {
    return FernIr.AuthSchemesRequirement._visit<OpenAPIV3.SecurityRequirementObject[]>(apiAuth.requirement, {
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
        endpointSecurity: () => {
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
        _other: () => {
            throw new Error("Unknown auth scheme requiremen: " + apiAuth.requirement);
        }
    });
}

export function constructSecuritySchemes(apiAuth: FernIr.ApiAuth): Record<string, OpenAPIV3.SecuritySchemeObject> {
    const securitySchemes: Record<string, OpenAPIV3.SecuritySchemeObject> = {};

    for (const scheme of apiAuth.schemes) {
            securitySchemes[getNameForAuthScheme(scheme)] = FernIr.AuthScheme._visit<OpenAPIV3.SecuritySchemeObject>(
                scheme,
                {
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
                }
            );
    }

    return securitySchemes;
}

function getNameForAuthScheme(authScheme: FernIr.AuthScheme): string {
    return FernIr.AuthScheme._visit(authScheme, {
        bearer: () => "BearerAuth",
        basic: () => "BasicAuth",
        oauth: () => "BearerAuth",
        inferred: () => "InferredAuth",
        header: (header) => {
            const nameValue = typeof header.name === "string" ? header.name : header.name.name;
            return `${caseConverter.pascalUnsafe(nameValue)}Auth`;
        },
        _other: () => {
            throw new Error("Unknown auth scheme: " + authScheme.type);
        }
    });
}
