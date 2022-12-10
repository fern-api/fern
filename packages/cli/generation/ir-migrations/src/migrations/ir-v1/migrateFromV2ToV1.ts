import * as V2 from "@fern-fern/ir-model";
import * as V1 from "@fern-fern/ir-v1-model";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V2_TO_V1_MIGRATION: IrMigration<V2.ir.IntermediateRepresentation, V1.ir.IntermediateRepresentation> = {
    minGeneratorVersionsToExclude: {
        "fernapi/fern-typescript": AlwaysRunMigration,
        "fernapi/fern-typescript-sdk": "0.0.245",
        "fernapi/fern-python": AlwaysRunMigration,
        "fernapi/fern-java": AlwaysRunMigration,
        "fernapi/fern-openapi": AlwaysRunMigration,
        "fernapi/fern-postman": AlwaysRunMigration,
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
