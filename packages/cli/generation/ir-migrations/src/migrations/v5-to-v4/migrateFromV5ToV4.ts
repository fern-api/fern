import { IrVersions } from "../../ir-versions";
import { GeneratorName } from "../../types/GeneratorName";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V5_TO_V4_MIGRATION: IrMigration<
    IrVersions.V5.ir.IntermediateRepresentation,
    IrVersions.V4.ir.IntermediateRepresentation
> = {
    earlierVersion: "v4",
    minGeneratorVersionsToExclude: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: AlwaysRunMigration,
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_MODEL]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.PYTHON_FASTAPI]: AlwaysRunMigration,
        [GeneratorName.PYTHON_PYDANTIC]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
    },
    migrateBackwards: (v5): IrVersions.V4.ir.IntermediateRepresentation => {
        return v5;
    },
};
