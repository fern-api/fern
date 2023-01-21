import { entries, noop, visitObject } from "@fern-api/core-utils";
import { Workspace } from "@fern-api/workspace-loader";
import { HttpEndpoint } from "@fern-fern/ir-model/http";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { constructCasingsGenerator } from "./casings/CasingsGenerator";
import { generateFernConstants } from "./converters/constants";
import { convertApiAuth } from "./converters/convertApiAuth";
import { getAudiences } from "./converters/convertDeclaration";
import { convertEnvironments } from "./converters/convertEnvironments";
import { convertErrorDeclaration } from "./converters/convertErrorDeclaration";
import { convertErrorDiscriminationStrategy } from "./converters/convertErrorDiscriminationStrategy";
import { convertHttpHeader, convertHttpService } from "./converters/services/convertHttpService";
import { convertTypeDeclaration } from "./converters/type-declarations/convertTypeDeclaration";
import { constructFernFileContext, FernFileContext } from "./FernFileContext";
import { AudienceIrGraph } from "./filtered-ir/AudienceIrGraph";
import { Language } from "./language";
import { ErrorResolverImpl } from "./resolvers/ErrorResolver";
import { ExampleResolverImpl } from "./resolvers/ExampleResolver";
import { TypeResolverImpl } from "./resolvers/TypeResolver";

export async function generateIntermediateRepresentation({
    workspace,
    generationLanguage,
    audiences,
}: {
    workspace: Workspace;
    generationLanguage: Language | undefined;
    audiences: string[] | undefined;
}): Promise<IntermediateRepresentation> {
    const casingsGenerator = constructCasingsGenerator(generationLanguage);

    const audienceIrGraph = audiences != null ? new AudienceIrGraph(audiences) : undefined;

    const rootApiFileContext = constructFernFileContext({
        relativeFilepath: ".",
        serviceFile: workspace.rootApiFile.contents,
        casingsGenerator,
    });

    const intermediateRepresentation: Omit<IntermediateRepresentation, "sdkConfig"> = {
        apiName: casingsGenerator.generateName(workspace.name),
        apiDisplayName: workspace.rootApiFile.contents["display-name"],
        apiDocs: workspace.rootApiFile.contents.docs,
        auth: convertApiAuth({
            rawApiFileSchema: workspace.rootApiFile.contents,
            file: rootApiFileContext,
        }),
        headers:
            workspace.rootApiFile.contents.headers != null
                ? Object.entries(workspace.rootApiFile.contents.headers).map(([headerKey, header]) =>
                      convertHttpHeader({ headerKey, header, file: rootApiFileContext })
                  )
                : [],
        types: [],
        errors: [],
        services: [],
        constants: generateFernConstants(casingsGenerator),
        environments: convertEnvironments({ casingsGenerator, rawApiFileSchema: workspace.rootApiFile.contents }),
        errorDiscriminationStrategy: convertErrorDiscriminationStrategy(
            workspace.rootApiFile.contents["error-discrimination"],
            rootApiFileContext
        ),
    };

    const typeResolver = new TypeResolverImpl(workspace);
    const errorResolver = new ErrorResolverImpl(workspace);
    const exampleResolver = new ExampleResolverImpl(typeResolver);

    const visitServiceFile = async (file: FernFileContext) => {
        await visitObject(file.serviceFile, {
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
                        exampleResolver,
                    });
                    intermediateRepresentation.types.push(convertedTypeDeclaration);

                    audienceIrGraph?.addType(convertedTypeDeclaration.name, convertedTypeDeclaration.referencedTypes);
                    audienceIrGraph?.markTypeForAudiences(convertedTypeDeclaration.name, getAudiences(typeDeclaration));
                }
            },

            errors: (errors) => {
                if (errors == null) {
                    return;
                }
                const errorDiscriminationSchema = workspace.rootApiFile.contents["error-discrimination"];
                if (errorDiscriminationSchema == null) {
                    throw new Error("error-discrimination is missing in api.yml but there are declared errors.");
                }
                for (const [errorName, errorDeclaration] of Object.entries(errors)) {
                    const convertedErrorDeclaration = convertErrorDeclaration({
                        errorName,
                        errorDeclaration,
                        file,
                    });
                    audienceIrGraph?.addError(convertedErrorDeclaration);
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
                            typeResolver,
                            exampleResolver,
                        });
                        intermediateRepresentation.services.push(convertedHttpService);

                        const convertedEndpoints: Record<string, HttpEndpoint> = {};
                        convertedHttpService.endpoints.forEach((httpEndpoint) => {
                            audienceIrGraph?.addEndpoint(convertedHttpService.name, httpEndpoint);
                            convertedEndpoints[httpEndpoint.name.originalName] = httpEndpoint;
                        });
                        if (serviceDefinition.audiences != null) {
                            audienceIrGraph?.markEndpointForAudience(
                                convertedHttpService.name,
                                convertedHttpService.endpoints,
                                serviceDefinition.audiences
                            );
                        }
                        Object.entries(serviceDefinition.endpoints).map(([endpointId, endpoint]) => {
                            const convertedEndpoint = convertedEndpoints[endpointId];
                            if (convertedEndpoint != null && endpoint.audiences != null) {
                                audienceIrGraph?.markEndpointForAudience(
                                    convertedHttpService.name,
                                    [convertedEndpoint],
                                    endpoint.audiences
                                );
                            }
                        });
                    }
                }
            },
        });
    };

    for (const [filepath, file] of entries(workspace.serviceFiles)) {
        await visitServiceFile(
            constructFernFileContext({
                relativeFilepath: filepath,
                serviceFile: file.contents,
                casingsGenerator,
            })
        );
    }

    for (const [filepath, file] of entries(workspace.packageMarkers)) {
        await visitServiceFile(
            constructFernFileContext({
                relativeFilepath: filepath,
                serviceFile: file.contents,
                casingsGenerator,
            })
        );
    }

    const intermediateRepresentationForAudiences =
        audienceIrGraph != null
            ? filterIntermediateRepresentationForAudiences(intermediateRepresentation, audienceIrGraph)
            : intermediateRepresentation;

    const isAuthMandatory =
        workspace.rootApiFile.contents.auth != null &&
        intermediateRepresentationForAudiences.services.every((service) => {
            return service.endpoints.every((endpoint) => endpoint.auth);
        });

    return {
        ...intermediateRepresentationForAudiences,
        sdkConfig: {
            isAuthMandatory,
        },
    };
}

function filterIntermediateRepresentationForAudiences(
    intermediateRepresentation: Omit<IntermediateRepresentation, "sdkConfig">,
    audienceIrGraph: AudienceIrGraph
): Omit<IntermediateRepresentation, "sdkConfig"> {
    const filteredIr = audienceIrGraph.build();
    return {
        ...intermediateRepresentation,
        types: intermediateRepresentation.types.filter((type) => {
            return filteredIr.hasType(type);
        }),
        errors: intermediateRepresentation.errors.filter((error) => {
            return filteredIr.hasError(error);
        }),
        services: intermediateRepresentation.services
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
    };
}
