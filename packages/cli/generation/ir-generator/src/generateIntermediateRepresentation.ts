import { entries, noop, visitObject } from "@fern-api/core-utils";
import { Workspace } from "@fern-api/workspace-loader";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { convertApiAuth } from "./converters/convertApiAuth";
import { convertErrorDeclaration } from "./converters/convertErrorDeclaration";
import { convertHttpService } from "./converters/services/convertHttpService";
import { convertWebsocketChannel } from "./converters/services/convertWebsocketChannel";
import { convertTypeDeclaration } from "./converters/type-declarations/convertTypeDeclaration";
import { FERN_CONSTANTS } from "./FernConstants";
import { constructFernFileContext, FernFileContext } from "./FernFileContext";
import { ErrorResolverImpl } from "./resolvers/ErrorResolver";
import { TypeResolverImpl } from "./resolvers/TypeResolver";

export async function generateIntermediateRepresentation(workspace: Workspace): Promise<IntermediateRepresentation> {
    const rootApiFile = constructFernFileContext({
        relativeFilepath: undefined,
        serviceFile: workspace.rootApiFile,
    });

    const intermediateRepresentation: IntermediateRepresentation = {
        apiName: workspace.name,
        auth: convertApiAuth({
            rawApiFileSchema: workspace.rootApiFile,
            file: rootApiFile,
        }),
        types: [],
        errors: [],
        services: {
            http: [],
            websocket: [],
        },
        constants: FERN_CONSTANTS,
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
            file: constructFernFileContext({ relativeFilepath: filepath, serviceFile: schema }),
            schema,
        });
    }

    await visitServiceFile({ file: rootApiFile, schema: workspace.rootApiFile });

    return intermediateRepresentation;
}
