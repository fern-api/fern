import { GeneratorName } from "@fern-api/generators-configuration";
import { FernIr } from "@fern-fern/ir-sdk";
import { commons } from "@fern-fern/ir-sdk/api";
import { FernIrV28 } from "@fern-fern/ir-v28-sdk";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V29_TO_V28_MIGRATION: IrMigration<
    IrVersions.V29.ir.IntermediateRepresentation,
    IrVersions.V28.ir.IntermediateRepresentation
> = {
    laterVersion: "v29",
    earlierVersion: "v28",
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
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: "0.9.0-2-g6b0be0e",
        [GeneratorName.GO_MODEL]: "0.9.0-2-g6b0be0e",
        [GeneratorName.GO_SDK]: "0.9.0-2-g6b0be0e",
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V28.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
        }),
    migrateBackwards: (v29): IrVersions.V28.ir.IntermediateRepresentation => {
        return {
            ...v29,
            types: Object.fromEntries(
                Object.keys(v29.types).map((key) => {
                    return [key, getTypeDeclarationFromTypeId(key, v29.types)];
                })
            ),
        };
    },
};

function getTypeDeclarationFromTypeId(
    typeId: commons.TypeId,
    allTypes: Record<FernIr.TypeId, FernIr.TypeDeclaration>
): FernIrV28.TypeDeclaration {
    // Eliminate possibility of undefined
    const typeDefinition = allTypes[typeId];
    if (typeDefinition === undefined) {
        throw new Error();
    }

    // Build referencedTypes
    const newReferencedTypes: FernIrV28.DeclaredTypeName[] = [];
    allTypes[typeId]?.referencedTypes.forEach((currentTypeId) => {
        const currentTypeDefinition = allTypes[currentTypeId];
        if (currentTypeDefinition === undefined) {
            return;
        }
        newReferencedTypes.push({
            typeId: currentTypeId,
            fernFilepath: currentTypeDefinition.name.fernFilepath,
            name: currentTypeDefinition.name.name,
        });
    });

    // Return type declaration
    return {
        ...typeDefinition,
        referencedTypes: newReferencedTypes,
    };
}
