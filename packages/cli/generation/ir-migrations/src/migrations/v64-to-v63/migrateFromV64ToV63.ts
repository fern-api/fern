import { GeneratorName } from "@fern-api/configuration-loader";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V64_TO_V63_MIGRATION: IrMigration<
    IrVersions.V64.ir.IntermediateRepresentation,
    IrVersions.V63.ir.IntermediateRepresentation
> = {
    laterVersion: "v64",
    earlierVersion: "v63",
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
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V63.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        }),
    migrateBackwards: (
        v64: IrVersions.V64.IntermediateRepresentation
    ): IrVersions.V63.ir.IntermediateRepresentation => {
        // V64 added minItems/maxItems to ListType and SetType, and minProperties/maxProperties to MapType
        // These fields are dropped during serialization to v63 via skipValidation: true
        // The passthrough setting ensures other fields are preserved
        return v64 as unknown as IrVersions.V63.ir.IntermediateRepresentation;
    }
};
