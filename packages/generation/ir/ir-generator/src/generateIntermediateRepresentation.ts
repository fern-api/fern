import { noop, visitObject } from "@fern-api/core-utils";
import { Workspace } from "@fern-api/workspace-loader";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import { FernFilepath, IntermediateRepresentation } from "@fern-fern/ir-model";
import { convertApiAuth } from "./converters/convertApiAuth";
import { convertErrorDeclaration } from "./converters/convertErrorDeclaration";
import { convertId } from "./converters/convertId";
import { convertHttpService } from "./converters/services/convertHttpService";
import { convertWebsocketChannel } from "./converters/services/convertWebsocketChannel";
import { convertTypeDeclaration } from "./converters/type-declarations/convertTypeDeclaration";
import { convertToFernFilepath } from "./utils/convertToFernFilepath";

const ROOT_API_FILE_FERN_FILEPATH: FernFilepath = [];

export async function generateIntermediateRepresentation(workspace: Workspace): Promise<IntermediateRepresentation> {
    const intermediateRepresentation: IntermediateRepresentation = {
        apiName: workspace.name,
        auth: convertApiAuth({
            rawApiFileSchema: workspace.rootApiFile,
            fernFilepath: ROOT_API_FILE_FERN_FILEPATH,
            imports: workspace.rootApiFile.imports ?? {},
        }),
        types: [],
        errors: [],
        services: {
            http: [],
            websocket: [],
            nonStandardEncodings: [],
        },
        constants: {
            errorDiscriminant: "_error",
            errorInstanceIdKey: "_errorInstanceId",
            unknownErrorDiscriminantValue: "_unknown",
        },
    };

    const visitServiceFile = async (fernFilepath: FernFilepath, schema: ServiceFileSchema) => {
        const { imports = {} } = schema;

        await visitObject(schema, {
            imports: noop,

            ids: (ids) => {
                if (ids == null) {
                    return;
                }

                for (const id of ids) {
                    intermediateRepresentation.types.push(convertId({ id, fernFilepath, imports }));
                }
            },

            types: (types) => {
                if (types == null) {
                    return;
                }

                for (const [typeName, typeDeclaration] of Object.entries(types)) {
                    intermediateRepresentation.types.push(
                        convertTypeDeclaration({
                            typeName,
                            typeDeclaration,
                            fernFilepath,
                            imports,
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
                        convertErrorDeclaration({ errorName, fernFilepath, errorDeclaration, imports })
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
                            convertHttpService({
                                serviceDefinition,
                                serviceId,
                                fernFilepath,
                                imports,
                                nonStandardEncodings: intermediateRepresentation.services.nonStandardEncodings,
                            })
                        );
                    }
                }

                if (services.websocket != null) {
                    for (const [channelId, channelDefinition] of Object.entries(services.websocket)) {
                        intermediateRepresentation.services.websocket.push(
                            convertWebsocketChannel({
                                channelId,
                                channelDefinition,
                                fernFilepath,
                                imports,
                                nonStandardEncodings: intermediateRepresentation.services.nonStandardEncodings,
                            })
                        );
                    }
                }
            },
        });
    };

    for (const [filepath, schema] of Object.entries(workspace.serviceFiles)) {
        await visitServiceFile(convertToFernFilepath(filepath), schema);
    }

    await visitServiceFile(ROOT_API_FILE_FERN_FILEPATH, workspace.rootApiFile);

    return intermediateRepresentation;
}
