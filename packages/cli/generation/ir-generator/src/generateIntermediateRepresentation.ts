import { entries, noop, visitObject } from "@fern-api/core-utils";
import { Workspace } from "@fern-api/workspace-loader";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { constructCasingsGenerator } from "./casings/CasingsGenerator";
import { convertApiAuth } from "./converters/convertApiAuth";
import { convertEnvironments } from "./converters/convertEnvironments";
import { convertErrorDeclaration } from "./converters/convertErrorDeclaration";
import { convertHttpHeader, convertHttpService } from "./converters/services/convertHttpService";
import { convertWebsocketChannel } from "./converters/services/convertWebsocketChannel";
import { convertTypeDeclaration } from "./converters/type-declarations/convertTypeDeclaration";
import { FERN_CONSTANTS, generateFernConstantsV2 } from "./FernConstants";
import { constructFernFileContext, FernFileContext } from "./FernFileContext";
import { Language } from "./language";
import { ErrorResolverImpl } from "./resolvers/ErrorResolver";
import { TypeResolverImpl } from "./resolvers/TypeResolver";

export async function generateIntermediateRepresentation({
    workspace,
    generationLanguage,
}: {
    workspace: Workspace;
    generationLanguage: Language | undefined;
}): Promise<IntermediateRepresentation> {
    const casingsGenerator = constructCasingsGenerator(generationLanguage);

    const rootApiFile = constructFernFileContext({
        relativeFilepath: undefined,
        serviceFile: workspace.rootApiFile,
        casingsGenerator,
    });

    const intermediateRepresentation: IntermediateRepresentation = {
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
                    intermediateRepresentation.types.push(
                        convertTypeDeclaration({
                            typeName,
                            typeDeclaration,
                            file,
                            typeResolver,
                        })
                    );
                }
            },

            errors: (errors) => {
                if (errors == null) {
                    return;
                }

                for (const [errorName, errorDeclaration] of Object.entries(errors)) {
                    intermediateRepresentation.errors.push(
                        convertErrorDeclaration({
                            errorName,
                            errorDeclaration,
                            file,
                            typeResolver,
                        })
                    );
                }
            },

            services: (services) => {
                if (services == null) {
                    return;
                }

                if (services.http != null) {
                    for (const [serviceId, serviceDefinition] of Object.entries(services.http)) {
                        intermediateRepresentation.services.http.push(
                            convertHttpService({ serviceDefinition, serviceId, file, errorResolver })
                        );
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

    return intermediateRepresentation;
}
