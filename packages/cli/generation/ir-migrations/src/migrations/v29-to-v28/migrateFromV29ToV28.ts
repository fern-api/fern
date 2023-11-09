import { GeneratorName } from "@fern-api/generators-configuration";
import { FernIr } from "@fern-fern/ir-sdk";
import { commons } from "@fern-fern/ir-sdk/api";
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
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
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
                    return [key, getV28TypeDeclarationFromId({ typeId: key, allTypes: v29.types })];
                })
            ),
        };
    },
};

function getV28TypeDeclarationFromId({
    typeId,
    allTypes,
}: {
    typeId: commons.TypeId;
    allTypes: Record<FernIr.TypeId, FernIr.TypeDeclaration>;
}): IrVersions.V28.types.TypeDeclaration {
    const typeDeclaration = getTypeDeclarationOrThrow({ typeId, allTypes });
    return {
        availability: typeDeclaration.availability,
        docs: typeDeclaration.docs,
        name: typeDeclaration.name,
        shape: typeDeclaration.shape,
        examples: typeDeclaration.examples,
        referencedTypes: Array.from(typeDeclaration.referencedTypes).map((referencedTypeId) => {
            const referencedTypeDeclaration = getTypeDeclarationOrThrow({ typeId: referencedTypeId, allTypes });
            return {
                typeId: referencedTypeId,
                fernFilepath: referencedTypeDeclaration.name.fernFilepath,
                name: referencedTypeDeclaration.name.name,
            };
        }),
    };
}

function getTypeDeclarationOrThrow({
    typeId,
    allTypes,
}: {
    typeId: commons.TypeId;
    allTypes: Record<FernIr.TypeId, FernIr.TypeDeclaration>;
}): FernIr.TypeDeclaration {
    const typeDeclaration = allTypes[typeId];
    if (typeDeclaration == null) {
        throw new Error(`Type definition for type id ${typeId} is undefined`);
    }
    return typeDeclaration;
}
