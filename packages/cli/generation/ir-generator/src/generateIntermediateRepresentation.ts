import { entries, noop, visitObject } from "@fern-api/core-utils";
import { Workspace } from "@fern-api/workspace-loader";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { constructCasingsGenerator } from "./casings/CasingsGenerator";
import { convertApiAuth } from "./converters/convertApiAuth";
import { getAudiences } from "./converters/convertDeclaration";
import { convertEnvironments } from "./converters/convertEnvironments";
import { convertErrorDeclaration } from "./converters/convertErrorDeclaration";
import { convertHttpHeader, convertHttpService } from "./converters/services/convertHttpService";
import { convertWebsocketChannel } from "./converters/services/convertWebsocketChannel";
import { convertTypeDeclaration } from "./converters/type-declarations/convertTypeDeclaration";
import { FERN_CONSTANTS, generateFernConstantsV2 } from "./FernConstants";
import { constructFernFileContext, FernFileContext } from "./FernFileContext";
import { getFilteredIrBuilder } from "./FilteredIr";
import { Language } from "./language";
import { ErrorResolverImpl } from "./resolvers/ErrorResolver";
import { TypeResolverImpl } from "./resolvers/TypeResolver";

export async function generateIntermediateRepresentation({
    workspace,
    generationLanguage,
    audiences,
}: {
    workspace: Workspace;
    generationLanguage: Language | undefined;
    audiences: string[];
}): Promise<IntermediateRepresentation> {
    const casingsGenerator = constructCasingsGenerator(generationLanguage);

    const filteredIrBuilder = getFilteredIrBuilder(audiences);

    const rootApiFile = constructFernFileContext({
        relativeFilepath: undefined,
        serviceFile: workspace.rootApiFile,
        casingsGenerator,
    });

    const intermediateRepresentation: Omit<IntermediateRepresentation, "sdkConfig"> = {
        apiName: workspace.name,
        auth: convertApiAuth({
            rawApiFileSchema: workspace.rootApiFile,
            file: rootApiFile,
        }),
        headers:
            workspace.rootApiFile.headers != null
                ? Object.entries(workspace.rootApiFile.headers).map(([headerKey, header]) =>
                      convertHttpHeader({ headerKey, header, file: rootApiFile })
                  )
                : [],
        types: [],
        errors: [],
        services: {
            http: [],
            websocket: [],
        },
        constants: FERN_CONSTANTS,
        constantsV2: generateFernConstantsV2(casingsGenerator),
        defaultEnvironment: workspace.rootApiFile["default-environment"],
        environments: convertEnvironments({ casingsGenerator, rawApiFileSchema: workspace.rootApiFile }),
        errorDiscriminant:
            workspace.rootApiFile["error-discriminant"] != null
                ? casingsGenerator.generateName(workspace.rootApiFile["error-discriminant"])
                : undefined,
    };

    const typeResolver = new TypeResolverImpl(workspace);
    const errorResolver = new ErrorResolverImpl(workspace);

    const visitServiceFile = async ({ file, schema }: { file: FernFileContext; schema: ServiceFileSchema }) => {
        await visitObject(schema, {
            imports: noop,

            types: (types) => {
                if (types == null) {
                    return;
                }

                for (const [typeName, typeDeclaration] of Object.entries(types)) {
                    const convertedTypeDeclaration = convertTypeDeclaration({
                        typeName,
                        typeDeclaration,
                        file,
                        typeResolver,
                    });
                    intermediateRepresentation.types.push(convertedTypeDeclaration);

                    filteredIrBuilder.addType(convertedTypeDeclaration.name, convertedTypeDeclaration.referencedTypes);
                    filteredIrBuilder.markTypeForAudiences(
                        convertedTypeDeclaration.name,
                        getAudiences(typeDeclaration)
                    );
                }
            },

            errors: (errors) => {
                if (errors == null) {
                    return;
                }
                for (const [errorName, errorDeclaration] of Object.entries(errors)) {
                    const convertedErrorDeclaration = convertErrorDeclaration({
                        errorName,
                        errorDeclaration,
                        file,
                        typeResolver,
                    });
                    filteredIrBuilder.addError(convertedErrorDeclaration);
                    intermediateRepresentation.errors.push(convertedErrorDeclaration);
                }
            },

            services: (services) => {
                if (services == null) {
                    return;
                }

                if (services.http != null) {
                    for (const [serviceId, serviceDefinition] of Object.entries(services.http)) {
                        const convertedHttpService = convertHttpService({
                            serviceDefinition,
                            serviceId,
                            file,
                            errorResolver,
                        });
                        intermediateRepresentation.services.http.push(convertedHttpService);

                        const convertedEndpoints: Record<string, HttpEndpoint> = {};
                        convertedHttpService.endpoints.forEach((httpEndpoint) => {
                            filteredIrBuilder.addEndpoint(convertedHttpService.name, httpEndpoint);
                            convertedEndpoints[httpEndpoint.id] = httpEndpoint;
                        });
                        if (serviceDefinition.audiences != null) {
                            filteredIrBuilder.markEndpointForAudience(
                                convertedHttpService.name,
                                convertedHttpService.endpoints,
                                serviceDefinition.audiences
                            );
                        }
                        Object.entries(serviceDefinition.endpoints).map(([endpointId, endpoint]) => {
                            const convertedEndpoint = convertedEndpoints[endpointId];
                            if (convertedEndpoint != null && endpoint.audiences != null) {
                                filteredIrBuilder.markEndpointForAudience(
                                    convertedHttpService.name,
                                    [convertedEndpoint],
                                    endpoint.audiences
                                );
                            }
                        });
                    }
                }

                if (services.websocket != null) {
                    for (const [channelId, channelDefinition] of Object.entries(services.websocket)) {
                        intermediateRepresentation.services.websocket.push(
                            convertWebsocketChannel({
                                channelId,
                                channelDefinition,
                                file,
                            })
                        );
                    }
                }
            },
        });
    };

    for (const [filepath, schema] of entries(workspace.serviceFiles)) {
        await visitServiceFile({
            file: constructFernFileContext({ relativeFilepath: filepath, serviceFile: schema, casingsGenerator }),
            schema,
        });
    }

    const filteredIr = filteredIrBuilder.build();

    const filteredIntermediateReprsentation = {
        ...intermediateRepresentation,
        types: intermediateRepresentation.types.filter((type) => {
            return filteredIr.hasType(type);
        }),
        errors: intermediateRepresentation.errors.filter((error) => {
            return filteredIr.hasError(error);
        }),
        services: {
            websocket: intermediateRepresentation.services.websocket,
            http: intermediateRepresentation.services.http
                .filter((httpService) => {
                    return filteredIr.hasService(httpService);
                })
                .map((httpService) => {
                    return {
                        ...httpService,
                        endpoints: httpService.endpoints.filter((httpEndpoint) => {
                            return filteredIr.hasEndpoint(httpService, httpEndpoint);
                        }),
                    };
                }),
        },
    };

    const isAuthMandatory =
        workspace.rootApiFile.auth != null &&
        filteredIntermediateReprsentation.services.http.every((service) => {
            return service.endpoints.every((endpoint) => endpoint.auth);
        });

    return {
        ...filteredIntermediateReprsentation,
        sdkConfig: {
            isAuthMandatory,
        },
    };
}
