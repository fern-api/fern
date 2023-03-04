import { noop, visitObject } from "@fern-api/core-utils";
import { GenerationLanguage, GeneratorAudiences } from "@fern-api/generators-configuration";
import { FernWorkspace, visitAllServiceFiles } from "@fern-api/workspace-loader";
import { HttpEndpoint, ResponseErrors } from "@fern-fern/ir-model/http";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { mapValues, pickBy } from "lodash-es";
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
import { generateRootPackage } from "./generateRootPackage";
import { IdGenerator } from "./IdGenerator";
import { ErrorResolverImpl } from "./resolvers/ErrorResolver";
import { ExampleResolverImpl } from "./resolvers/ExampleResolver";
import { TypeResolverImpl } from "./resolvers/TypeResolver";
import { parseErrorName } from "./utils/parseErrorName";

export async function generateIntermediateRepresentation({
    workspace,
    generationLanguage,
    audiences,
}: {
    workspace: FernWorkspace;
    generationLanguage: GenerationLanguage | undefined;
    audiences: GeneratorAudiences;
}): Promise<IntermediateRepresentation> {
    const casingsGenerator = constructCasingsGenerator(generationLanguage);

    const audienceIrGraph = audiences.type !== "all" ? new AudienceIrGraph(audiences.audiences) : undefined;

    const rootApiFileContext = constructFernFileContext({
        relativeFilepath: ".",
        serviceFile: {
            imports: workspace.definition.rootApiFile.contents.imports,
        },
        casingsGenerator,
    });
    const globalErrors: ResponseErrors = (workspace.definition.rootApiFile.contents.errors ?? []).map(
        (referenceToError) => {
            const errorName = parseErrorName({
                errorName: referenceToError,
                file: rootApiFileContext,
            });
            return { error: errorName, docs: undefined };
        }
    );

    const intermediateRepresentation: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage"> = {
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
        types: {},
        errors: {},
        services: {},
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
                    intermediateRepresentation.types[IdGenerator.generateTypeId(convertedTypeDeclaration.name)] =
                        convertedTypeDeclaration;

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
                    intermediateRepresentation.errors[IdGenerator.generateErrorId(convertedErrorDeclaration.name)] =
                        convertedErrorDeclaration;

                    audienceIrGraph?.addError(convertedErrorDeclaration);
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
                    globalErrors,
                });

                intermediateRepresentation.services[IdGenerator.generateServiceId(convertedHttpService.name)] =
                    convertedHttpService;

                const convertedEndpoints: Record<string, HttpEndpoint> = {};
                convertedHttpService.endpoints.forEach((httpEndpoint) => {
                    audienceIrGraph?.addEndpoint(convertedHttpService, httpEndpoint);
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

    await visitAllServiceFiles(workspace, async (relativeFilepath, file) => {
        await visitServiceFile(
            constructFernFileContext({
                relativeFilepath,
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
        Object.values(intermediateRepresentationForAudiences.services).every((service) => {
            return service.endpoints.every((endpoint) => endpoint.auth);
        });

    return {
        ...intermediateRepresentationForAudiences,
        ...generateRootPackage(intermediateRepresentationForAudiences),
        sdkConfig: {
            isAuthMandatory,
        },
    };
}

function filterIntermediateRepresentationForAudiences(
    intermediateRepresentation: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage">,
    audienceIrGraph: AudienceIrGraph
): Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage"> {
    const filteredIr = audienceIrGraph.build();
    return {
        ...intermediateRepresentation,
        types: pickBy(intermediateRepresentation.types, (type) => filteredIr.hasType(type)),
        errors: pickBy(intermediateRepresentation.errors, (error) => filteredIr.hasError(error)),
        services: mapValues(
            pickBy(intermediateRepresentation.services, (httpService) => filteredIr.hasService(httpService)),
            (httpService) => ({
                ...httpService,
                endpoints: httpService.endpoints.filter((httpEndpoint) =>
                    filteredIr.hasEndpoint(httpService, httpEndpoint)
                ),
            })
        ),
    };
}
