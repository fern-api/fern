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
        [GeneratorName.JAVA_MODEL]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.JAVA_SPRING]: AlwaysRunMigration,
        [GeneratorName.PYTHON_FASTAPI]: "0.0.51-1-g977dd1f",
        [GeneratorName.PYTHON_PYDANTIC]: "0.0.51-1-g977dd1f",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
    },
    migrateBackwards: (v9, { taskContext, targetGenerator }): IrVersions.V8.ir.IntermediateRepresentation => {
        for (const [_, type] of Object.entries(v9.types)) {
            if (type.shape._type === "union" && type.shape.baseProperties.length > 0) {
                taskContext.failWithoutThrowing(
                    `Type ${type.name.name.originalName} uses base-properties.` +
                        ` If you'd like to use this feature, please upgrade ${targetGenerator.name}` +
                        " to a compatible version."
                );
            }
        }
        if (taskContext.getResult() === TaskResult.Failure) {
            taskContext.failAndThrow();
        }

        return {
            apiName: v9.apiName,
            apiDisplayName: v9.apiDisplayName,
            apiDocs: v9.apiDocs,
            auth: v9.auth,
            headers: v9.headers,
            types: Object.values(v9.types),
            errors: Object.values(v9.errors),
            services: Object.values(v9.services),
            constants: v9.constants,
            environments: v9.environments,
            errorDiscriminationStrategy: v9.errorDiscriminationStrategy,
            sdkConfig: v9.sdkConfig,
        };
    },
};
