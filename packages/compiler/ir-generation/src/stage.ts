import { CustomWireMessageEncoding, IntermediateRepresentation } from "@fern-api/api";
import { CompilerStage, RelativeFilePath } from "@fern-api/compiler-commons";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { convertErrorDefinition } from "./converters/convertErrorDefinition";
import { convertId } from "./converters/convertId";
import { convertHttpService } from "./converters/services/convertHttpService";
import { convertWebsocketChannel } from "./converters/services/convertWebsocketChannel";
import { convertTypeDefinition } from "./converters/type-definitions/convertTypeDefinition";
import { convertToFernFilepath } from "./utils/convertToFernFilepath";
import { noop } from "./utils/noop";
import { visit } from "./utils/visit";

export declare namespace IntermediateRepresentationGenerationStage {
    export interface Success {
        intermediateRepresentation: IntermediateRepresentation;
        nonStandardEncodings: CustomWireMessageEncoding[];
    }

    export interface Args {
        rawFernConfigurationSchemas: Record<RelativeFilePath, RawSchemas.FernConfigurationSchema>;
        workspaceName: string | undefined;
    }
}

export const IntermediateRepresentationGenerationStage: CompilerStage<
    IntermediateRepresentationGenerationStage.Args,
    IntermediateRepresentationGenerationStage.Success,
    void
> = {
    run: (args) => {
        const intermediateRepresentation: IntermediateRepresentation = {
            workspaceName: args.workspaceName,
            modelTypes: [],
            inlinedServiceTypes: [],
            inlinedOperationTypes: [],
            errors: [],
            services: {
                http: [],
                websocket: [],
            },
        };

        const nonStandardEncodings: CustomWireMessageEncoding[] = [];

        for (const [filepath, schema] of Object.entries(args.rawFernConfigurationSchemas)) {
            const fernFilepath = convertToFernFilepath(filepath);

            const { imports = {} } = schema;

            visit(schema, {
                imports: noop,
                ids: (ids) => {
                    if (ids == null) {
                        return;
                    }

                    for (const id of ids) {
                        intermediateRepresentation.modelTypes.push(convertId({ id, fernFilepath, imports }));
                    }
                },
                types: (types) => {
                    if (types == null) {
                        return;
                    }

                    for (const [typeName, typeDefinition] of Object.entries(types)) {
                        intermediateRepresentation.modelTypes.push(
                            convertTypeDefinition({
                                typeName,
                                typeDefinition,
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

                    for (const [errorName, errorDefinition] of Object.entries(errors)) {
                        intermediateRepresentation.errors.push(
                            convertErrorDefinition({ errorName, fernFilepath, errorDefinition, imports })
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
                                    nonStandardEncodings,
                                    addInlinedServiceType: (inlinedServiceType) => {
                                        intermediateRepresentation.inlinedServiceTypes.push(inlinedServiceType);
                                    },
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
                                    nonStandardEncodings,
                                    addInlinedOperationType: (inlinedOperationType) => {
                                        intermediateRepresentation.inlinedOperationTypes.push(inlinedOperationType);
                                    },
                                })
                            );
                        }
                    }
                },
            });
        }

        return {
            didSucceed: true,
            result: {
                intermediateRepresentation,
                nonStandardEncodings,
            },
        };
    },
};
