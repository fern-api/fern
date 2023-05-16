import { GeneratorName } from "@fern-api/generators-configuration";
import { TaskResult } from "@fern-api/task-context";
import { IrVersions } from "../../ir-versions";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V9_TO_V8_MIGRATION: IrMigration<
    IrVersions.V9.ir.IntermediateRepresentation,
    IrVersions.V8.ir.IntermediateRepresentation
> = {
    laterVersion: "v9",
    earlierVersion: "v8",
    minGeneratorVersionsToExclude: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: "0.3.0-2-g85e8aa08",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.3.0-2-g85e8aa08",
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_MODEL]: "0.0.134-4-gef1ec4f",
        [GeneratorName.JAVA_SDK]: "0.0.134-4-gef1ec4f",
        [GeneratorName.JAVA_SPRING]: "0.0.134-4-gef1ec4f",
        [GeneratorName.PYTHON_FASTAPI]: "0.0.51-1-g977dd1f",
        [GeneratorName.PYTHON_PYDANTIC]: "0.0.51-1-g977dd1f",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.STOPLIGHT]: undefined,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
        [GeneratorName.PYTHON_SDK]: undefined,
        [GeneratorName.GO_MODEL]: undefined,
    },
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
            services: Object.values(v9.services),
        };
    },
};
