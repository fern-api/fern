import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V60_TO_V59_MIGRATION: IrMigration<
    IrVersions.V60.ir.IntermediateRepresentation,
    IrVersions.V59.ir.IntermediateRepresentation
> = {
    laterVersion: "v60",
    earlierVersion: "v59",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUST_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V59.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (
        v60: IrVersions.V60.IntermediateRepresentation
    ): IrVersions.V59.ir.IntermediateRepresentation => {
        return {
            ...v60,
            services: convertServices(v60.services),
            auth: convertAuth(v60.auth)
        } as IrVersions.V59.ir.IntermediateRepresentation;
    }
};

function convertAuth(auth: IrVersions.V60.ApiAuth): IrVersions.V59.ir.Auth {
    return {
        ...auth,
        schemes: convertAuthSchemes(auth.schemes)
    };
}

function convertAuthSchemes(schemes: IrVersions.V60.AuthScheme[]): IrVersions.V59.ir.AuthScheme[] {
    return schemes.map((scheme) => {
        switch (scheme.type) {
            case "bearer":
                return scheme;
            case "basic":
                return scheme;
            case "header":
                return scheme;
            case "oauth":
                switch (scheme.configuration.type) {
                    case "clientCredentials": {
                        return {
                            ...scheme,
                            configuration: {
                                ...scheme.configuration,
                                refreshEndpoint: scheme.configuration.refreshEndpoint
                                    ? {
                                          ...scheme.configuration.refreshEndpoint,
                                          responseProperties: {
                                              accessToken: convertResponseProperty(
                                                  scheme.configuration.refreshEndpoint?.responseProperties.accessToken
                                              ),
                                              expiresIn: convertResponseProperty(
                                                  scheme.configuration.refreshEndpoint?.responseProperties.expiresIn
                                              ),
                                              refreshToken: convertResponseProperty(
                                                  scheme.configuration.refreshEndpoint?.responseProperties.refreshToken
                                              )
                                          }
                                      }
                                    : undefined,
                                tokenEndpoint: {
                                    ...scheme.configuration.tokenEndpoint,
                                    responseProperties: {
                                        accessToken: convertResponseProperty(
                                            scheme.configuration.refreshEndpoint?.responseProperties.accessToken
                                        ),
                                        expiresIn: convertResponseProperty(
                                            scheme.configuration.refreshEndpoint?.responseProperties.expiresIn
                                        ),
                                        refreshToken: convertResponseProperty(
                                            scheme.configuration.refreshEndpoint?.responseProperties.refreshToken
                                        )
                                    }
                                }
                            }
                        };
                    }
                    default:
                        assertNever(scheme.configuration.type);
                }
                break;
            case "inferred":
                return {
                    ...scheme,
                    tokenEndpoint: {
                        ...scheme.tokenEndpoint,
                        expiryProperty: convertResponseProperty(scheme.tokenEndpoint.expiryProperty),
                        authenticatedRequestHeaders: scheme.tokenEndpoint.authenticatedRequestHeaders.map((h) => {
                            return {
                                ...h,
                                responseProperty: convertResponseProperty(h.responseProperty)
                            };
                        })
                    }
                };
            default:
                assertNever(scheme);
        }
    });
}

function convertServices(
    services: Record<IrVersions.V60.ServiceId, IrVersions.V60.HttpService>
): Record<IrVersions.V59.ir.ServiceId, IrVersions.V59.ir.HttpService> {
    return Object.entries(services).reduce(
        (acc, [id, service]) => {
            acc[id] = {
                ...service,
                endpoints: convertEndpoints(service.endpoints)
            };
            return acc;
        },
        {} as Record<IrVersions.V59.ir.ServiceId, IrVersions.V59.ir.HttpService>
    );
}

function convertEndpoints(endpoints: IrVersions.V60.HttpEndpoint[]): IrVersions.V59.ir.HttpEndpoint[] {
    return endpoints.map((endpoint) => ({
        ...endpoint,
        pagination: convertPagination(endpoint.pagination)
    }));
}

function convertPagination(
    pagination: IrVersions.V60.Pagination | undefined
): IrVersions.V59.ir.Pagination | undefined {
    if (!pagination) {
        return pagination;
    }
    switch (pagination.type) {
        case "cursor":
            return {
                ...pagination,
                next: convertResponseProperty(pagination.next),
                results: convertResponseProperty(pagination.results)
            };
        case "offset":
            return {
                ...pagination,
                hasNextPage: convertResponseProperty(pagination.hasNextPage),
                results: convertResponseProperty(pagination.results)
            };
        case "custom":
            return {
                ...pagination,
                results: convertResponseProperty(pagination.results)
            };
        default:
            assertNever(pagination);
    }
}

function convertResponseProperty(
    responseProperty: IrVersions.V60.ResponseProperty | undefined
): IrVersions.V59.ir.ResponseProperty | undefined {
    if (!responseProperty) {
        return undefined;
    }
    return {
        propertyPath: responseProperty.propertyPath,
        // propertyPathWithTypes: responseProperty.propertyPathWithTypes, // remove this property
        property: responseProperty.property
    };
}
