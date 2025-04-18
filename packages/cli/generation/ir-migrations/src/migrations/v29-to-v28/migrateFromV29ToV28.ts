import { GeneratorName } from "@fern-api/configuration-loader";
import { commons } from "@fern-api/ir-sdk";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V29_TO_V28_MIGRATION: IrMigration<
    IrVersions.V29.ir.IntermediateRepresentation,
    IrVersions.V28.ir.IntermediateRepresentation
> = {
    laterVersion: "v29",
    earlierVersion: "v28",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "0.8.6-1-g3d8d8591",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "0.8.6-1-g3d8d8591",
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.8.6-1-g3d8d8591",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: "0.5.14-1-ge4bcd98",
        [GeneratorName.JAVA_SDK]: "0.5.14-1-ge4bcd98",
        [GeneratorName.JAVA_SPRING]: "0.5.14-1-ge4bcd98",
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
        [GeneratorName.RUBY_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V28.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v29): IrVersions.V28.ir.IntermediateRepresentation => {
        return {
            ...v29,
            types: Object.fromEntries(
                Object.keys(v29.types).map((key) => {
                    return [key, getV28TypeDeclarationFromId({ typeId: key, allTypes: v29.types })];
                })
            )
        };
    }
};

function getV28TypeDeclarationFromId({
    typeId,
    allTypes
}: {
    typeId: commons.TypeId;
    allTypes: Record<IrVersions.V29.TypeId, IrVersions.V29.TypeDeclaration>;
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
                name: referencedTypeDeclaration.name.name
            };
        })
    };
}

function getTypeDeclarationOrThrow({
    typeId,
    allTypes
}: {
    typeId: commons.TypeId;
    allTypes: Record<IrVersions.V29.TypeId, IrVersions.V29.TypeDeclaration>;
}): IrVersions.V29.TypeDeclaration {
    const typeDeclaration = allTypes[typeId];
    if (typeDeclaration == null) {
        throw new Error(`Type definition for type id ${typeId} is undefined`);
    }
    return typeDeclaration;
}
