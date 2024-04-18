import { GeneratorName } from "@fern-api/configuration";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V38_TO_V37_MIGRATION: IrMigration<
    IrVersions.V38.ir.IntermediateRepresentation,
    IrVersions.V37.ir.IntermediateRepresentation
> = {
    laterVersion: "v38",
    earlierVersion: "v37",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V37.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (V38, _context): IrVersions.V37.ir.IntermediateRepresentation => {
        const ir: IrVersions.V37.IntermediateRepresentation = {
            ...V38,
            services: Object.fromEntries(
                Object.entries(V38.services).map(([id, service]) => [
                    id,
                    {
                        ...service,
                        endpoints: service.endpoints.map((endpoint) => {
                            return {
                                ...endpoint,
                                response: endpoint.response?._visit<IrVersions.V37.HttpResponse | undefined>({
                                    fileDownload: (fileDownload) =>
                                        IrVersions.V37.HttpResponse.fileDownload(fileDownload),
                                    json: (json) => IrVersions.V37.HttpResponse.json(json),
                                    streaming: (streaming) =>
                                        streaming._visit<IrVersions.V37.HttpResponse | undefined>({
                                            json: (json) =>
                                                IrVersions.V37.HttpResponse.streaming({
                                                    dataEventType: IrVersions.V37.StreamingResponseChunkType.json(
                                                        json.payload
                                                    ),
                                                    docs: json.docs,
                                                    terminator: json.terminator
                                                }),
                                            sse: () => undefined,
                                            text: (text) =>
                                                IrVersions.V37.HttpResponse.streaming({
                                                    dataEventType: IrVersions.V37.StreamingResponseChunkType.text(),
                                                    docs: text.docs,
                                                    terminator: undefined
                                                }),
                                            _other: () => undefined
                                        }),
                                    text: (text) => IrVersions.V37.HttpResponse.text(text),
                                    _other: () => undefined
                                })
                            };
                        })
                    }
                ])
            )
        };
        return ir;
    }
};
