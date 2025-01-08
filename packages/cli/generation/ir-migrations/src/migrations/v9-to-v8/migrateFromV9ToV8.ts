import { GeneratorName } from "@fern-api/configuration-loader";
import { TaskResult } from "@fern-api/task-context";

import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V9_TO_V8_MIGRATION: IrMigration<
    IrVersions.V9.ir.IntermediateRepresentation,
    IrVersions.V8.ir.IntermediateRepresentation
> = {
    laterVersion: "v9",
    earlierVersion: "v8",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: "0.3.0-2-g85e8aa08",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.3.0-2-g85e8aa08",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: "0.0.134-4-gef1ec4f",
        [GeneratorName.JAVA_SDK]: "0.0.134-4-gef1ec4f",
        [GeneratorName.JAVA_SPRING]: "0.0.134-4-gef1ec4f",
        [GeneratorName.PYTHON_FASTAPI]: "0.0.51-1-g977dd1f",
        [GeneratorName.PYTHON_PYDANTIC]: "0.0.51-1-g977dd1f",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNotCreatedYet,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_FIBER]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) => ir,
    migrateBackwards: (v9, { taskContext, targetGenerator }): IrVersions.V8.ir.IntermediateRepresentation => {
        for (const [_, type] of Object.entries(v9.types)) {
            if (type.shape._type === "union" && type.shape.baseProperties.length > 0) {
                taskContext.failWithoutThrowing(
                    targetGenerator != null
                        ? `Type ${type.name.name.originalName} uses base-properties.` +
                              ` If you'd like to use this feature, please upgrade ${targetGenerator.name}` +
                              " to a compatible version."
                        : "Cannot backwards-migrate IR because this IR contains a union with base-properties."
                );
            }
        }
        if (taskContext.getResult() === TaskResult.Failure) {
            taskContext.failAndThrow();
        }

        return {
            ...v9,
            types: Object.values(v9.types),
            errors: Object.values(v9.errors),
            services: Object.values(v9.services)
        };
    }
};
