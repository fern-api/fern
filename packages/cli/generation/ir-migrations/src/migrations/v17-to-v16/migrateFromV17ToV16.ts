import { GeneratorName } from "@fern-api/generators-configuration";
import { IrVersions } from "../../ir-versions";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V17_TO_V16_MIGRATION: IrMigration<
    IrVersions.V17.ir.IntermediateRepresentation,
    IrVersions.V16.ir.IntermediateRepresentation
> = {
    laterVersion: "v17",
    earlierVersion: "v16",
    minGeneratorVersionsToExclude: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_EXPRESS]: AlwaysRunMigration,
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_MODEL]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.JAVA_SPRING]: AlwaysRunMigration,
        [GeneratorName.PYTHON_FASTAPI]: AlwaysRunMigration,
        [GeneratorName.PYTHON_PYDANTIC]: AlwaysRunMigration,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.STOPLIGHT]: AlwaysRunMigration,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
        [GeneratorName.PYTHON_SDK]: AlwaysRunMigration,
        [GeneratorName.GO]: AlwaysRunMigration,
    },
    migrateBackwards: (v17, { taskContext, targetGenerator }): IrVersions.V16.ir.IntermediateRepresentation => {
        for (const [typeName, typeDeclaration] of Object.entries(v17.types)) {
            if (typeDeclaration.shape._type === "union" && typeDeclaration.shape.extends.length > 0) {
                return taskContext.failAndThrow(
                    targetGenerator != null
                        ? `Generator ${targetGenerator.name}@${targetGenerator.version}` +
                              ` does not support union types with extensions. See ${typeName} in file ${typeDeclaration.name.fernFilepath.allParts.join(
                                  "/"
                              )}.` +
                              ` If you'd like to use this feature, please upgrade ${targetGenerator.name}` +
                              " to a compatible version."
                        : "Cannot backwards-migrate IR because this IR contains union types with extensions."
                );
            }
        }
        return {
            ...v17,
        };
    },
};
