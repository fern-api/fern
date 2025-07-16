import { GeneratorName } from "@fern-api/configuration-loader";

import { FernIrV33 } from "@fern-fern/ir-v33-sdk";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V34_TO_V33_MIGRATION: IrMigration<
    IrVersions.V34.ir.IntermediateRepresentation,
    IrVersions.V33.ir.IntermediateRepresentation
> = {
    laterVersion: "v34",
    earlierVersion: "v33",
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
        [GeneratorName.PYTHON_SDK]: "0.10.4",
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V33.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (V34, context): IrVersions.V33.ir.IntermediateRepresentation => {
        return {
            ...V34,
            services: Object.fromEntries(
                Object.entries(V34.services).map(([id, service]) => [
                    id,
                    {
                        ...service,
                        endpoints: service.endpoints.map((endpoint) => ({
                            ...endpoint,
                            requestBody: endpoint.requestBody?._visit<FernIrV33.HttpRequestBody | undefined>({
                                inlinedRequestBody: (value) => FernIrV33.HttpRequestBody.inlinedRequestBody(value),
                                reference: (value) => FernIrV33.HttpRequestBody.reference(value),
                                fileUpload: (fileUpload) =>
                                    FernIrV33.HttpRequestBody.fileUpload({
                                        ...fileUpload,
                                        properties: fileUpload.properties.map((property) => {
                                            if (property.type === "file" && property.value.type === "fileArray") {
                                                context.taskContext.logger.warn(
                                                    `${endpoint.method} ${endpoint.fullPath.head} accepts a list of files however the ${context.targetGenerator?.name}@${context.targetGenerator?.version} only supports accepting a single file. File an [issue](https://github.com/fern-api/fern/issues) to add request for file arrays in ${context.targetGenerator?.name}@${context.targetGenerator?.version}!`
                                                );
                                            }
                                            if (property.type === "file") {
                                                return FernIrV33.FileUploadRequestProperty.file({
                                                    ...property.value
                                                });
                                            } else {
                                                return property;
                                            }
                                        })
                                    }),
                                bytes: (value) => FernIrV33.HttpRequestBody.bytes(value),
                                _other: (_) => undefined
                            })
                        }))
                    }
                ])
            )
        };
    }
};
