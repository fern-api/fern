import * as V2 from "@fern-fern/ir-model";
import * as V1 from "@fern-fern/ir-v1-model";
import { GeneratorName } from "../../types/GeneratorName";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V2_TO_V1_MIGRATION: IrMigration<V2.ir.IntermediateRepresentation, V1.ir.IntermediateRepresentation> = {
    requiredForGeneratorVersions: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: "0.0.245",
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.PYTHON]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
    },
    migrateBackwards: (v2) => {
        return {
            ...v2,
            errors: v2.errors.map(
                (error): V1.errors.ErrorDeclaration => ({
                    ...error,
                    discriminantValue: {
                        wireValue: error.discriminantValueV4.wireValue,
                        ...error.discriminantValueV4.name.unsafeName,
                    },
                })
            ),
        };
    },
};
