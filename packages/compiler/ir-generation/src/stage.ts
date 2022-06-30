import { CompilerStage, RelativeFilePath } from "@fern-api/compiler-commons";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { CustomWireMessageEncoding } from "@fern-fern/ir-model/services";
import { convertErrorDeclaration } from "./converters/convertErrorDeclaration";
import { convertId } from "./converters/convertId";
import { convertHttpService } from "./converters/services/convertHttpService";
import { convertWebsocketChannel } from "./converters/services/convertWebsocketChannel";
import { convertTypeDeclaration } from "./converters/type-declarations/convertTypeDeclaration";
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
            types: [],
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
                                    nonStandardEncodings,
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
