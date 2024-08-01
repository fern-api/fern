import { Audiences, FERN_PACKAGE_MARKER_FILENAME, generatorsYml } from "@fern-api/configuration";
import { noop, visitObject } from "@fern-api/core-utils";
import { dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import {
    ExampleType,
    HttpEndpoint,
    IntermediateRepresentation,
    PathParameterLocation,
    ResponseErrors,
    ServiceId,
    ServiceTypeReferenceInfo,
    Type,
    TypeId,
    Webhook
} from "@fern-api/ir-sdk";
import { FernWorkspace, visitAllDefinitionFiles, visitAllPackageMarkers } from "@fern-api/workspace-loader";
import { mapValues, pickBy } from "lodash-es";
import { constructCasingsGenerator } from "./casings/CasingsGenerator";
import { generateFernConstants } from "./converters/constants";
import { convertApiAuth } from "./converters/convertApiAuth";
import { convertApiVersionScheme } from "./converters/convertApiVersionScheme";
import { convertChannel } from "./converters/convertChannel";
import { getAudiences } from "./converters/convertDeclaration";
import { convertEnvironments } from "./converters/convertEnvironments";
import { convertErrorDeclaration } from "./converters/convertErrorDeclaration";
import { convertErrorDiscriminationStrategy } from "./converters/convertErrorDiscriminationStrategy";
import { convertReadmeConfig } from "./converters/convertReadmeConfig";
import { convertWebhookGroup } from "./converters/convertWebhookGroup";
import { constructHttpPath } from "./converters/services/constructHttpPath";
import { convertHttpHeader, convertHttpService, convertPathParameters } from "./converters/services/convertHttpService";
import { convertTypeDeclaration } from "./converters/type-declarations/convertTypeDeclaration";
import { ExampleGenerator } from "./examples/ExampleGenerator";
import { addExtendedPropertiesToIr } from "./extended-properties/addExtendedPropertiesToIr";
import { constructFernFileContext, constructRootApiFileContext, FernFileContext } from "./FernFileContext";
import { FilteredIr } from "./filtered-ir/FilteredIr";
import { IrGraph } from "./filtered-ir/IrGraph";
import { filterEndpointExample, filterExampleType } from "./filterExamples";
import { formatDocs } from "./formatDocs";
import { IdGenerator } from "./IdGenerator";
import { PackageTreeGenerator } from "./PackageTreeGenerator";
import { EndpointResolverImpl } from "./resolvers/EndpointResolver";
import { ErrorResolverImpl } from "./resolvers/ErrorResolver";
import { ExampleResolverImpl } from "./resolvers/ExampleResolver";
import { PropertyResolverImpl } from "./resolvers/PropertyResolver";
import { TypeResolverImpl } from "./resolvers/TypeResolver";
import { VariableResolverImpl } from "./resolvers/VariableResolver";
import { convertToFernFilepath } from "./utils/convertToFernFilepath";
import { parseErrorName } from "./utils/parseErrorName";

export async function generateIntermediateRepresentation({
    fdrApiDefinitionId,
    workspace,
    generationLanguage,
    keywords,
    smartCasing,
    disableExamples,
    audiences,
    readme
}: {
    fdrApiDefinitionId?: string;
    workspace: FernWorkspace;
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
    keywords: string[] | undefined;
    smartCasing: boolean;
    disableExamples: boolean;
    audiences: Audiences;
    readme: generatorsYml.ReadmeSchema | undefined;
}): Promise<IntermediateRepresentation> {
    const casingsGenerator = constructCasingsGenerator({ generationLanguage, keywords, smartCasing });

    const irGraph = new IrGraph(audiences);

    const rootApiFileContext = constructRootApiFileContext({
        casingsGenerator,
        rootApiFile: workspace.definition.rootApiFile.contents
    });
    const globalErrors: ResponseErrors = (workspace.definition.rootApiFile.contents.errors ?? []).map(
        (referenceToError) => {
            const errorName = parseErrorName({
                errorName: referenceToError,
                file: rootApiFileContext
            });
            return { error: errorName, docs: undefined };
        }
    );

    const typeResolver = new TypeResolverImpl(workspace);
    const endpointResolver = new EndpointResolverImpl(workspace);
    const propertyResolver = new PropertyResolverImpl(typeResolver, endpointResolver);
    const errorResolver = new ErrorResolverImpl(workspace);
    const exampleResolver = new ExampleResolverImpl(typeResolver);
    const variableResolver = new VariableResolverImpl();

    const intermediateRepresentation: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage"> = {
        fdrApiDefinitionId,
        apiVersion: await convertApiVersionScheme({
            file: rootApiFileContext,
            rawApiFileSchema: workspace.definition.rootApiFile.contents
        }),
        apiName: casingsGenerator.generateName(workspace.definition.rootApiFile.contents.name),
        apiDisplayName: workspace.definition.rootApiFile.contents["display-name"],
        apiDocs: await formatDocs(workspace.definition.rootApiFile.contents.docs),
        auth: await convertApiAuth({
            rawApiFileSchema: workspace.definition.rootApiFile.contents,
            file: rootApiFileContext,
            propertyResolver,
            endpointResolver
        }),
        headers:
            workspace.definition.rootApiFile.contents.headers != null
                ? await Promise.all(
                      Object.entries(workspace.definition.rootApiFile.contents.headers).map(([headerKey, header]) =>
                          convertHttpHeader({ headerKey, header, file: rootApiFileContext })
                      )
                  )
                : [],
        idempotencyHeaders:
            workspace.definition.rootApiFile.contents["idempotency-headers"] != null
                ? await Promise.all(
                      Object.entries(workspace.definition.rootApiFile.contents["idempotency-headers"]).map(
                          ([headerKey, header]) => convertHttpHeader({ headerKey, header, file: rootApiFileContext })
                      )
                  )
                : [],
        types: {},
        errors: {},
        services: {},
        constants: generateFernConstants(casingsGenerator),
        environments: convertEnvironments({
            casingsGenerator,
            rawApiFileSchema: workspace.definition.rootApiFile.contents
        }),
        errorDiscriminationStrategy: convertErrorDiscriminationStrategy(
            workspace.definition.rootApiFile.contents["error-discrimination"],
            rootApiFileContext
        ),
        basePath:
            workspace.definition.rootApiFile.contents["base-path"] != null
                ? constructHttpPath(workspace.definition.rootApiFile.contents["base-path"])
                : undefined,
        pathParameters: await convertPathParameters({
            pathParameters: workspace.definition.rootApiFile.contents["path-parameters"],
            file: rootApiFileContext,
            location: PathParameterLocation.Root,
            variableResolver
        }),
        variables:
            workspace.definition.rootApiFile.contents.variables != null
                ? Object.entries(workspace.definition.rootApiFile.contents.variables).map(([key, variable]) => ({
                      docs: typeof variable !== "string" ? variable.docs : undefined,
                      id: key,
                      name: rootApiFileContext.casingsGenerator.generateName(key),
                      type: rootApiFileContext.parseTypeReference(variable)
                  }))
                : [],
        serviceTypeReferenceInfo: {
            typesReferencedOnlyByService: {},
            sharedTypes: []
        },
        webhookGroups: {},
        websocketChannels: {},
        readmeConfig: undefined
    };

    const packageTreeGenerator = new PackageTreeGenerator();

    const visitDefinitionFile = async (file: FernFileContext) => {
        packageTreeGenerator.addSubpackage(file.fernFilepath);

        await visitObject(file.definitionFile, {
            imports: noop,
            docs: (docs) => {
                if (docs != null) {
                    packageTreeGenerator.addDocs(file.fernFilepath, docs);
                }
            },

            types: async (types) => {
                if (types == null) {
                    return;
                }

                for (const [typeName, typeDeclaration] of Object.entries(types)) {
                    const convertedTypeDeclarationWithFilepaths = await convertTypeDeclaration({
                        typeName,
                        typeDeclaration,
                        file,
                        typeResolver,
                        exampleResolver,
                        workspace
                    });
                    const convertedTypeDeclaration = convertedTypeDeclarationWithFilepaths.typeDeclaration;
                    if (disableExamples) {
                        convertedTypeDeclaration.userProvidedExamples = [];
                        convertedTypeDeclaration.autogeneratedExamples = [];
                    }
                    const subpackageFilepaths = convertedTypeDeclarationWithFilepaths.descendantFilepaths;

                    const typeId = IdGenerator.generateTypeId(convertedTypeDeclaration.name);
                    intermediateRepresentation.types[typeId] = convertedTypeDeclaration;
                    packageTreeGenerator.addType(typeId, convertedTypeDeclaration);

                    irGraph.addType({
                        declaredTypeName: convertedTypeDeclaration.name,
                        descendantTypeIds: convertedTypeDeclaration.referencedTypes,
                        descendantTypeIdsByAudience: {},
                        propertiesByAudience: convertedTypeDeclarationWithFilepaths.propertiesByAudience,
                        descendantFilepaths: subpackageFilepaths
                    });
                    irGraph.markTypeForAudiences(convertedTypeDeclaration.name, getAudiences(typeDeclaration));
                }
            },

            errors: (errors) => {
                if (errors == null) {
                    return;
                }
                const errorDiscriminationSchema = workspace.definition.rootApiFile.contents["error-discrimination"];
                if (errorDiscriminationSchema == null) {
                    throw new Error("error-discrimination is missing in api.yml but there are declared errors.");
                }
                for (const [errorName, errorDeclaration] of Object.entries(errors)) {
                    const convertedErrorDeclaration = convertErrorDeclaration({
                        errorName,
                        errorDeclaration,
                        file,
                        typeResolver,
                        exampleResolver,
                        workspace
                    });

                    const errorId = IdGenerator.generateErrorId(convertedErrorDeclaration.name);
                    intermediateRepresentation.errors[errorId] = convertedErrorDeclaration;
                    packageTreeGenerator.addError(errorId, convertedErrorDeclaration);

                    irGraph.addError(convertedErrorDeclaration);
                }
            },

            service: async (service) => {
                if (service == null) {
                    return;
                }

                const convertedHttpService = await convertHttpService({
                    rootDefaultUrl: file.defaultUrl ?? workspace.definition.rootApiFile.contents["default-url"],
                    rootPathParameters: intermediateRepresentation.pathParameters,
                    serviceDefinition: service,
                    file,
                    errorResolver,
                    typeResolver,
                    propertyResolver,
                    exampleResolver,
                    globalErrors,
                    variableResolver,
                    workspace
                });

                const serviceId = IdGenerator.generateServiceId(convertedHttpService.name);
                intermediateRepresentation.services[serviceId] = convertedHttpService;
                packageTreeGenerator.addService(serviceId, convertedHttpService);

                const convertedEndpoints: Record<string, HttpEndpoint> = {};
                convertedHttpService.endpoints.forEach((httpEndpoint) => {
                    if (disableExamples) {
                        httpEndpoint.autogeneratedExamples = [];
                        httpEndpoint.userSpecifiedExamples = [];
                    }
                    const rawEndpointSchema = service.endpoints[httpEndpoint.name.originalName];
                    irGraph.addEndpoint(convertedHttpService, httpEndpoint, rawEndpointSchema);
                    convertedEndpoints[httpEndpoint.name.originalName] = httpEndpoint;
                });
                if (service.audiences != null) {
                    irGraph.markEndpointForAudience(
                        convertedHttpService.name,
                        convertedHttpService.endpoints,
                        service.audiences
                    );
                }
                Object.entries(service.endpoints).map(([endpointId, endpoint]) => {
                    const convertedEndpoint = convertedEndpoints[endpointId];
                    if (convertedEndpoint != null && endpoint.audiences != null) {
                        irGraph.markEndpointForAudience(
                            convertedHttpService.name,
                            [convertedEndpoint],
                            endpoint.audiences
                        );
                    }
                });
            },
            webhooks: async (webhooks) => {
                if (webhooks == null) {
                    return;
                }
                const webhookGroupId = IdGenerator.generateWebhookGroupId(file.fernFilepath);
                const convertedWebhookGroup = await convertWebhookGroup({
                    webhooks,
                    file,
                    typeResolver,
                    exampleResolver,
                    workspace
                });

                const webhooksByOriginalName: Record<string, Webhook> = {};
                for (const convertedWebhook of convertedWebhookGroup) {
                    webhooksByOriginalName[convertedWebhook.name.originalName] = convertedWebhook;
                }

                Object.entries(webhooks).forEach(([key, webhook]) => {
                    const irWebhook = webhooksByOriginalName[key];
                    if (irWebhook != null) {
                        irGraph.addWebhook(file, irWebhook, webhook);
                        if (webhook.audiences != null) {
                            irGraph.markWebhookForAudiences(file, irWebhook, webhook.audiences);
                        }
                    }
                });

                intermediateRepresentation.webhookGroups[webhookGroupId] = convertedWebhookGroup;
                packageTreeGenerator.addWebhookGroup(webhookGroupId, file.fernFilepath);
            },
            channel: async (channel) => {
                if (channel == null) {
                    return;
                }
                const websocketChannelId = IdGenerator.generateWebSocketChannelId(file.fernFilepath);
                const websocketChannel = await convertChannel({
                    channel,
                    file,
                    variableResolver,
                    typeResolver,
                    exampleResolver,
                    workspace
                });
                if (intermediateRepresentation.websocketChannels != null) {
                    intermediateRepresentation.websocketChannels[websocketChannelId] = websocketChannel;
                    packageTreeGenerator.addWebSocketChannel(websocketChannelId, file.fernFilepath);
                }
            }
        });
    };

    await visitAllDefinitionFiles(workspace, async (relativeFilepath, file, metadata) => {
        await visitDefinitionFile(
            constructFernFileContext({
                relativeFilepath,
                definitionFile: file,
                casingsGenerator,
                rootApiFile: workspace.definition.rootApiFile.contents,
                defaultUrl: metadata.defaultUrl
            })
        );
    });

    await visitAllPackageMarkers(workspace, async (relativeFilepath, packageMarker) => {
        if (packageMarker.navigation == null) {
            return;
        }

        if (typeof packageMarker.navigation === "string") {
            packageTreeGenerator.addPackageRedirection({
                from: convertToFernFilepath({ relativeFilepath, casingsGenerator }),
                to: convertToFernFilepath({
                    relativeFilepath: join(dirname(relativeFilepath), RelativeFilePath.of(packageMarker.navigation)),
                    casingsGenerator
                })
            });
        } else {
            const childrenInOrder = packageMarker.navigation.map((childFilepath) => {
                return IdGenerator.generateSubpackageId(
                    convertToFernFilepath({
                        relativeFilepath: join(dirname(relativeFilepath), RelativeFilePath.of(childFilepath)),
                        casingsGenerator
                    })
                );
            });

            if (relativeFilepath === FERN_PACKAGE_MARKER_FILENAME) {
                packageTreeGenerator.sortRootPackage(childrenInOrder);
            } else {
                packageTreeGenerator.sortSubpackage(
                    IdGenerator.generateSubpackageId(
                        convertToFernFilepath({
                            relativeFilepath,
                            casingsGenerator
                        })
                    ),
                    childrenInOrder
                );
            }
        }
    });

    intermediateRepresentation.serviceTypeReferenceInfo = computeServiceTypeReferenceInfo(irGraph);

    const intermediateRepresentationWithGeneratedExamples = new ExampleGenerator(
        intermediateRepresentation
    ).enrichWithAutogeneratedExamples();

    const filteredIr = !irGraph.hasNoAudiences() ? irGraph.build() : undefined;
    const intermediateRepresentationForAudiences = filterIntermediateRepresentationForAudiences(
        intermediateRepresentationWithGeneratedExamples,
        filteredIr
    );

    const isAuthMandatory =
        workspace.definition.rootApiFile.contents.auth != null &&
        Object.values(intermediateRepresentationForAudiences.services).every((service) => {
            return service.endpoints.every((endpoint) => endpoint.auth);
        });

    const hasStreamingEndpoints = Object.values(intermediateRepresentationForAudiences.services).some((service) => {
        return service.endpoints.some((endpoint) => endpoint.response?.body?.type === "streaming");
    });

    const hasPaginatedEndpoints = Object.values(intermediateRepresentationForAudiences.services).some((service) => {
        return service.endpoints.some((endpoint) => endpoint.pagination != null);
    });

    const hasFileDownloadEndpoints = Object.values(intermediateRepresentationForAudiences.services).some((service) => {
        return service.endpoints.some((endpoint) => endpoint.response?.body?.type === "fileDownload");
    });

    const readmeConfig =
        readme != null ? convertReadmeConfig({ readme, services: intermediateRepresentation.services }) : undefined;

    const { types, services } = addExtendedPropertiesToIr(intermediateRepresentationForAudiences);

    return {
        ...intermediateRepresentationForAudiences,
        ...packageTreeGenerator.build(filteredIr),
        types,
        services,
        sdkConfig: {
            isAuthMandatory,
            hasStreamingEndpoints,
            hasPaginatedEndpoints,
            hasFileDownloadEndpoints,
            platformHeaders: {
                language: "X-Fern-Language",
                sdkName: "X-Fern-SDK-Name",
                sdkVersion: "X-Fern-SDK-Version"
            }
        },
        readmeConfig
    };
}

function computeServiceTypeReferenceInfo(irGraph: IrGraph): ServiceTypeReferenceInfo {
    const typesReferencedOnlyByService: Record<ServiceId, TypeId[]> = {};
    const sharedTypes: TypeId[] = [];
    const typesReferencedByService = irGraph.getTypesReferencedByService();
    for (const [typeId, serviceIds] of Object.entries(typesReferencedByService)) {
        if (serviceIds.size === 1) {
            const serviceId = serviceIds.values().next().value;
            if (typesReferencedOnlyByService[serviceId] === undefined) {
                typesReferencedOnlyByService[serviceId] = [];
            }
            typesReferencedOnlyByService[serviceId]?.push(typeId);
            continue;
        }
        sharedTypes.push(typeId);
    }
    return {
        typesReferencedOnlyByService,
        sharedTypes
    };
}

function filterIntermediateRepresentationForAudiences(
    intermediateRepresentation: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage">,
    filteredIr: FilteredIr | undefined
): Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage"> {
    if (filteredIr == null) {
        return intermediateRepresentation;
    }
    const filteredTypes = pickBy(intermediateRepresentation.types, (type) => filteredIr.hasType(type));
    const filteredTypesAndProperties = Object.fromEntries(
        Object.entries(filteredTypes).map(([typeId, typeDeclaration]) => {
            const filteredProperties = [];
            typeDeclaration.userProvidedExamples = typeDeclaration.userProvidedExamples
                .map((example) => filterExampleType({ filteredIr, exampleType: example }))
                .filter((ex) => ex !== undefined) as ExampleType[];
            if (typeDeclaration.shape.type === "object") {
                for (const property of typeDeclaration.shape.properties) {
                    const hasProperty = filteredIr.hasProperty(typeId, property.name.wireValue);
                    if (hasProperty) {
                        filteredProperties.push(property);
                    }
                }

                return [
                    typeId,
                    {
                        ...typeDeclaration,
                        shape: Type.object({
                            ...typeDeclaration.shape,
                            properties: filteredProperties
                        })
                    }
                ];
            }
            return [typeId, typeDeclaration];
        })
    );

    const filteredWebhookGroups = Object.fromEntries(
        Object.entries(intermediateRepresentation.webhookGroups).map(([webhookGroupId, webhookGroup]) => {
            const filteredWebhooks = webhookGroup
                .filter((webhook) => filteredIr.hasWebhook(webhook))
                .map((webhook) => {
                    const webhookId = webhook.id;
                    if (webhook.payload.type === "inlinedPayload" && webhookId != null) {
                        webhook.payload = {
                            ...webhook.payload,
                            properties: webhook.payload.properties.filter((property) => {
                                return filteredIr.hasWebhookPayloadProperty(webhookId, property.name.wireValue);
                            })
                        };
                    }
                    return webhook;
                });
            return [webhookGroupId, filteredWebhooks];
        })
    );

    return {
        ...intermediateRepresentation,
        types: filteredTypesAndProperties,
        errors: pickBy(intermediateRepresentation.errors, (error) => filteredIr.hasError(error)),
        services: mapValues(
            pickBy(intermediateRepresentation.services, (httpService) => filteredIr.hasService(httpService)),
            (httpService) => ({
                ...httpService,
                endpoints: httpService.endpoints
                    .filter((httpEndpoint) => filteredIr.hasEndpoint(httpEndpoint))
                    .map((httpEndpoint) => {
                        httpEndpoint.autogeneratedExamples = httpEndpoint.autogeneratedExamples.map((autogenerated) => {
                            return {
                                ...autogenerated,
                                example: filterEndpointExample({ filteredIr, example: autogenerated.example })
                            };
                        });
                        httpEndpoint.userSpecifiedExamples = httpEndpoint.userSpecifiedExamples.map((userSpecified) => {
                            return {
                                ...userSpecified,
                                example:
                                    userSpecified.example != null
                                        ? filterEndpointExample({ filteredIr, example: userSpecified.example })
                                        : undefined
                            };
                        });
                        if (httpEndpoint.queryParameters.length > 0) {
                            httpEndpoint.queryParameters = httpEndpoint.queryParameters.filter((queryParameter) => {
                                return filteredIr.hasQueryParameter(httpEndpoint.id, queryParameter.name.wireValue);
                            });
                        }
                        if (httpEndpoint.requestBody?.type === "inlinedRequestBody") {
                            return {
                                ...httpEndpoint,
                                requestBody: {
                                    ...httpEndpoint.requestBody,
                                    properties: httpEndpoint.requestBody.properties.filter((property) => {
                                        return filteredIr.hasRequestProperty(httpEndpoint.id, property.name.wireValue);
                                    })
                                }
                            };
                        }
                        return httpEndpoint;
                    })
            })
        ),
        webhookGroups: filteredWebhookGroups,
        serviceTypeReferenceInfo: filterServiceTypeReferenceInfoForAudiences(
            intermediateRepresentation.serviceTypeReferenceInfo,
            filteredIr
        )
    };
}

function filterServiceTypeReferenceInfoForAudiences(
    serviceTypeReferenceInfo: ServiceTypeReferenceInfo,
    filteredIr: FilteredIr | undefined
): ServiceTypeReferenceInfo {
    if (filteredIr == null) {
        return serviceTypeReferenceInfo;
    }
    const filteredTypesReferencedOnlyByService: Record<ServiceId, TypeId[]> = {};
    Object.entries(serviceTypeReferenceInfo.typesReferencedOnlyByService).forEach(([key, values]) => {
        if (filteredIr.hasServiceId(key)) {
            filteredTypesReferencedOnlyByService[key] = values.filter((value) => filteredIr.hasTypeId(value));
        }
    });

    return {
        sharedTypes: serviceTypeReferenceInfo.sharedTypes.filter((typeId) => filteredIr.hasTypeId(typeId)),
        typesReferencedOnlyByService: filteredTypesReferencedOnlyByService
    };
}
