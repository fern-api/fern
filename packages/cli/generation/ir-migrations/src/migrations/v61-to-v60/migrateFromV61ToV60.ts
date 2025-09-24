import { GeneratorName } from "@fern-api/configuration-loader";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";
import { expandName } from "@fern-api/ir-utils";

// NOTE(tjb9dc): Since the Name breaking change is so pervasive, it would be a massive pain to code explicitly.
// Instead, we hook into custom serialization to write out a backwards compatible version, and then just deserialize it.
const V61SerializerWithV60Names = {
    ...IrSerialization.V61,
    // Override the Name serializer
    commons: {
        ...IrSerialization.V61.commons,
        Name: IrSerialization.V61.commons.Name.transform({
            transform: (name) => {
                if (typeof name === "string") {
                    // Expand the name using the shared library function
                    return expandName(name);
                }
                // Return the deconflicted name which is already back-compat
                return name;
            },
            untransform: (deconflictedName) => deconflictedName // Leave a deconflicted name as-is
        })
    }
};

export const V61_TO_V60_MIGRATION: IrMigration<
    IrVersions.V61.ir.IntermediateRepresentation,
    IrVersions.V60.ir.IntermediateRepresentation
> = {
    laterVersion: "v61",
    earlierVersion: "v60",
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
        IrSerialization.V60.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (
        v61: IrVersions.V61.IntermediateRepresentation
    ): IrVersions.V60.ir.IntermediateRepresentation => {
        const raw = V61SerializerWithV60Names.IntermediateRepresentation.jsonOrThrow(v61, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        });
        return IrSerialization.V60.IntermediateRepresentation.parseOrThrow(raw, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        });
    }
};
