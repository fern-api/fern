import { noop, visitObject } from "@fern-api/core-utils";
import { dirname } from "@fern-api/fs-utils";
import { visitAllServiceFiles, Workspace } from "@fern-api/workspace-loader";
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
        serviceFile: workspace.definition.rootApiFile.contents,
        casingsGenerator,
    });

    const intermediateRepresentation: Omit<IntermediateRepresentation, "sdkConfig"> = {
        apiName: casingsGenerator.generateName(workspace.name),
        apiDisplayName: workspace.definition.rootApiFile.contents["display-name"],
        apiDocs: workspace.definition.rootApiFile.contents.docs,
        auth: convertApiAuth({
            rawApiFileSchema: workspace.definition.rootApiFile.contents,
            file: rootApiFileContext,
        }),
        headers:
            workspace.definition.rootApiFile.contents.headers != null
                ? Object.entries(workspace.definition.rootApiFile.contents.headers).map(([headerKey, header]) =>
                      convertHttpHeader({ headerKey, header, file: rootApiFileContext })
                  )
                : [],
        types: [],
        errors: [],
        services: [],
        constants: generateFernConstants(casingsGenerator),
        environments: convertEnvironments({
            casingsGenerator,
            rawApiFileSchema: workspace.definition.rootApiFile.contents,
        }),
        errorDiscriminationStrategy: convertErrorDiscriminationStrategy(
            workspace.definition.rootApiFile.contents["error-discrimination"],
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
                const errorDiscriminationSchema = workspace.definition.rootApiFile.contents["error-discrimination"];
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

            service: (service) => {
                if (service == null) {
                    return;
                }

                const convertedHttpService = convertHttpService({
                    serviceDefinition: service,
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
                if (service.audiences != null) {
                    audienceIrGraph?.markEndpointForAudience(
                        convertedHttpService.name,
                        convertedHttpService.endpoints,
                        service.audiences
                    );
                }
                Object.entries(service.endpoints).map(([endpointId, endpoint]) => {
                    const convertedEndpoint = convertedEndpoints[endpointId];
                    if (convertedEndpoint != null && endpoint.audiences != null) {
                        audienceIrGraph?.markEndpointForAudience(
                            convertedHttpService.name,
                            [convertedEndpoint],
                            endpoint.audiences
                        );
                    }
                });
            },
        });
    };

    await visitAllServiceFiles(workspace, async (relativeFilepath, file, { isPackageMarker }) => {
        await visitServiceFile(
            constructFernFileContext({
                relativeFilepath: isPackageMarker ? dirname(relativeFilepath) : relativeFilepath,
                serviceFile: file,
                casingsGenerator,
            })
        );
    });

    const intermediateRepresentationForAudiences =
        audienceIrGraph != null
            ? filterIntermediateRepresentationForAudiences(intermediateRepresentation, audienceIrGraph)
            : intermediateRepresentation;

    const isAuthMandatory =
        workspace.definition.rootApiFile.contents.auth != null &&
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
