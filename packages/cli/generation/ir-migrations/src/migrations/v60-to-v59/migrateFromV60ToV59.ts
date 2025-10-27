import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V60_TO_V59_MIGRATION: IrMigration<
    IrVersions.V60.ir.IntermediateRepresentation,
    IrVersions.V59.ir.IntermediateRepresentation
> = {
    laterVersion: "v60",
    earlierVersion: "v59",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "2.11.2",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "2.11.2",
        [GeneratorName.TYPESCRIPT]: "2.11.2",
        [GeneratorName.TYPESCRIPT_SDK]: "2.11.2",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.18.6",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: "1.8.2",
        [GeneratorName.JAVA_SDK]: "3.5.10",
        [GeneratorName.JAVA_SPRING]: "1.8.3",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: "1.9.0",
        [GeneratorName.PYTHON_PYDANTIC]: "1.7.0",
        [GeneratorName.PYTHON_SDK]: "4.30.0",
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: "0.23.8",
        [GeneratorName.GO_MODEL]: "0.23.8",
        [GeneratorName.GO_SDK]: "1.12.4",
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: "0.21.0",
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
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

function convertAuth(auth: IrVersions.V60.ApiAuth): IrVersions.V59.ApiAuth {
    return {
        ...auth,
        schemes: convertAuthSchemes(auth.schemes)
    };
}

function convertAuthSchemes(schemes: IrVersions.V60.AuthScheme[]): IrVersions.V59.AuthScheme[] {
    return schemes.map((scheme) => {
        switch (scheme.type) {
            case "bearer":
                return IrVersions.V59.AuthScheme.bearer({
                    ...scheme
                });
            case "basic":
                return IrVersions.V59.AuthScheme.basic({
                    ...scheme
                });
            case "header":
                return IrVersions.V59.AuthScheme.header({
                    ...scheme
                });
            case "oauth":
                switch (scheme.configuration.type) {
                    case "clientCredentials": {
                        return IrVersions.V59.AuthScheme.oauth({
                            ...scheme,
                            configuration: IrVersions.V59.OAuthConfiguration.clientCredentials({
                                ...scheme.configuration,
                                refreshEndpoint: scheme.configuration.refreshEndpoint
                                    ? {
                                          ...scheme.configuration.refreshEndpoint,
                                          responseProperties: {
                                              accessToken: convertResponseProperty(
                                                  scheme.configuration.refreshEndpoint.responseProperties.accessToken
                                              ),
                                              expiresIn: convertResponsePropertyOrUndefined(
                                                  scheme.configuration.refreshEndpoint.responseProperties.expiresIn
                                              ),
                                              refreshToken: convertResponsePropertyOrUndefined(
                                                  scheme.configuration.refreshEndpoint.responseProperties.refreshToken
                                              )
                                          },
                                          requestProperties: {
                                              refreshToken: convertRequestProperty(
                                                  scheme.configuration.refreshEndpoint.requestProperties.refreshToken
                                              )
                                          }
                                      }
                                    : undefined,
                                tokenEndpoint: {
                                    ...scheme.configuration.tokenEndpoint,
                                    responseProperties: {
                                        accessToken: convertResponseProperty(
                                            scheme.configuration.tokenEndpoint.responseProperties.accessToken
                                        ),
                                        expiresIn: convertResponsePropertyOrUndefined(
                                            scheme.configuration.tokenEndpoint.responseProperties.expiresIn
                                        ),
                                        refreshToken: convertResponsePropertyOrUndefined(
                                            scheme.configuration.tokenEndpoint.responseProperties.refreshToken
                                        )
                                    },
                                    requestProperties: {
                                        clientId: convertRequestProperty(
                                            scheme.configuration.tokenEndpoint.requestProperties.clientId
                                        ),
                                        clientSecret: convertRequestProperty(
                                            scheme.configuration.tokenEndpoint.requestProperties.clientSecret
                                        ),
                                        scopes: convertRequestPropertyOrUndefined(
                                            scheme.configuration.tokenEndpoint.requestProperties.scopes
                                        ),
                                        customProperties:
                                            scheme.configuration.tokenEndpoint.requestProperties.customProperties?.map(
                                                convertRequestProperty
                                            )
                                    }
                                }
                            })
                        });
                    }
                    default:
                        assertNever(scheme.configuration.type);
                }
                break;
            case "inferred":
                return IrVersions.V59.AuthScheme.inferred({
                    ...scheme,
                    tokenEndpoint: {
                        ...scheme.tokenEndpoint,
                        expiryProperty: convertResponsePropertyOrUndefined(scheme.tokenEndpoint.expiryProperty),
                        authenticatedRequestHeaders: scheme.tokenEndpoint.authenticatedRequestHeaders.map((h) => {
                            return {
                                ...h,
                                responseProperty: convertResponseProperty(h.responseProperty)
                            };
                        })
                    }
                });
            default:
                assertNever(scheme);
        }
    });
}

function convertServices(
    services: Record<IrVersions.V60.ServiceId, IrVersions.V60.HttpService>
): Record<IrVersions.V59.ServiceId, IrVersions.V59.HttpService> {
    return Object.entries(services).reduce<Record<IrVersions.V59.ServiceId, IrVersions.V59.HttpService>>(
        (acc, [id, service]) => {
            acc[id] = {
                ...service,
                endpoints: convertEndpoints(service.endpoints)
            };
            return acc;
        },
        {}
    );
}

function convertEndpoints(endpoints: IrVersions.V60.HttpEndpoint[]): IrVersions.V59.HttpEndpoint[] {
    return endpoints.map((endpoint) => ({
        ...endpoint,
        pagination: convertPagination(endpoint.pagination),
        sdkRequest: convertSdkRequest(endpoint.sdkRequest)
    }));
}

function convertPagination(pagination: IrVersions.V60.Pagination | undefined): IrVersions.V59.Pagination | undefined {
    if (!pagination) {
        return pagination;
    }
    switch (pagination.type) {
        case "cursor":
            return IrVersions.V59.Pagination.cursor({
                next: convertResponseProperty(pagination.next),
                results: convertResponseProperty(pagination.results),
                page: convertRequestProperty(pagination.page)
            });
        case "offset":
            return IrVersions.V59.Pagination.offset({
                hasNextPage: convertResponsePropertyOrUndefined(pagination.hasNextPage),
                results: convertResponseProperty(pagination.results),
                page: convertRequestProperty(pagination.page),
                step: convertRequestPropertyOrUndefined(pagination.step)
            });
        case "custom":
            return IrVersions.V59.Pagination.custom({
                results: convertResponseProperty(pagination.results)
            });
        default:
            assertNever(pagination);
    }
}

function convertRequestPropertyOrUndefined(
    requestProperty: IrVersions.V60.RequestProperty | undefined
): IrVersions.V59.RequestProperty | undefined {
    if (!requestProperty) {
        return undefined;
    }
    return {
        propertyPath: requestProperty.propertyPath?.map((item) => item.name),
        property: requestProperty.property
    };
}

function convertRequestProperty(requestProperty: IrVersions.V60.RequestProperty): IrVersions.V59.RequestProperty {
    return {
        propertyPath: requestProperty.propertyPath?.map((item) => item.name),
        property: requestProperty.property
    };
}

function convertResponsePropertyOrUndefined(
    responseProperty: IrVersions.V60.ResponseProperty | undefined
): IrVersions.V59.ResponseProperty | undefined {
    if (!responseProperty) {
        return undefined;
    }
    return {
        propertyPath: responseProperty.propertyPath?.map((item) => item.name),
        property: responseProperty.property
    };
}

function convertResponseProperty(responseProperty: IrVersions.V60.ResponseProperty): IrVersions.V59.ResponseProperty {
    return {
        propertyPath: responseProperty.propertyPath?.map((item) => item.name),
        property: responseProperty.property
    };
}

function convertSdkRequest(sdkRequest: IrVersions.V60.SdkRequest | undefined): IrVersions.V59.SdkRequest | undefined {
    if (!sdkRequest) {
        return sdkRequest;
    }
    return {
        ...sdkRequest,
        streamParameter: convertRequestPropertyOrUndefined(sdkRequest.streamParameter)
    };
}
