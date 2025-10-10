import { GeneratorName } from "@fern-api/configuration-loader";
import { expandName } from "@fern-api/core-utils";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V62_TO_V61_MIGRATION: IrMigration<
    IrVersions.V62.ir.IntermediateRepresentation,
    IrVersions.V61.ir.IntermediateRepresentation
> = {
    laterVersion: "v62",
    earlierVersion: "v61",
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
        [GeneratorName.RUST_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V61.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (
        v62: IrVersions.V62.IntermediateRepresentation
    ): IrVersions.V61.ir.IntermediateRepresentation => {
        // NOTE(tjb9dc): Since the Name breaking change is so pervasive, it would be a massive pain to code explicitly.
        // Instead, we'll monkey patch the Name serializer to call expandName.
        // There may be a nicer way to do this via a transformer, but I couldn't get the Name transformer to be respected.
        const originalNameSchema = IrSerialization.V61.commons.Name;
        const originalJsonMethod = originalNameSchema.json.bind(originalNameSchema);

        try {
            // Override the json method to use expandName
            originalNameSchema.json = (
                name: Parameters<typeof originalJsonMethod>[0],
                opts?: Parameters<typeof originalJsonMethod>[1]
            ) => {
                const expandedName = expandName(name as IrVersions.V62.Name);
                return originalJsonMethod(expandedName, opts);
            };

            // Serialize using V62 schema with patched Name transformation
            const raw = IrSerialization.V62.IntermediateRepresentation.jsonOrThrow(v62, {
                unrecognizedObjectKeys: "strip",
                skipValidation: true
            });

            // Deserialize as V61
            return IrSerialization.V61.IntermediateRepresentation.parseOrThrow(raw, {
                unrecognizedObjectKeys: "strip",
                skipValidation: true
            });
        } finally {
            originalNameSchema.json = originalJsonMethod;
        }
    }
};
