import { noop } from "@fern-api/core-utils";
import { IrVersions } from "../../ir-versions";

type StringifiedTypeId = string;

export function getReferencedTypesForInlinedRequest({
    inlinedRequest,
    allTypes,
}: {
    inlinedRequest: IrVersions.V3.services.http.InlinedRequestBody;
    allTypes: IrVersions.V2.types.TypeDeclaration[];
}): IrVersions.V2.types.DeclaredTypeName[] {
    const typeIdToDeclaredTypeName: Record<StringifiedTypeId, IrVersions.V2.types.DeclaredTypeName> = {};
    const typeNameToDeclaration: Record<StringifiedTypeId, IrVersions.V2.types.TypeDeclaration> = allTypes.reduce(
        (acc, type) => ({
            ...acc,
            [stringifyTypeName(type.name)]: type,
        }),
        {}
    );

    for (const extension of inlinedRequest.extends) {
        getReferencedTypesFromTypeName({ typeName: extension, typeNameToDeclaration, typeIdToDeclaredTypeName });
    }

    for (const property of inlinedRequest.properties) {
        getReferencedTypesFromReference({
            reference: property.valueType,
            typeNameToDeclaration,
            typeIdToDeclaredTypeName,
        });
    }

    return Object.values(typeIdToDeclaredTypeName);
}

function getReferencedTypesFromReference({
    reference,
    typeNameToDeclaration,
    typeIdToDeclaredTypeName,
}: {
    reference: IrVersions.V2.types.TypeReference;
    typeNameToDeclaration: Record<StringifiedTypeId, IrVersions.V2.types.TypeDeclaration>;
    typeIdToDeclaredTypeName: Record<StringifiedTypeId, IrVersions.V2.types.DeclaredTypeName>;
}): void {
    IrVersions.V2.types.TypeReference._visit(reference, {
        primitive: noop,
        container: (container) => {
            getReferencedTypesFromContainer({ container, typeNameToDeclaration, typeIdToDeclaredTypeName });
        },
        named: (typeName) => {
            getReferencedTypesFromTypeName({ typeName, typeNameToDeclaration, typeIdToDeclaredTypeName });
        },
        unknown: noop,
        void: noop,
        _unknown: () => {
            throw new Error("Unknown TypeRefrence: " + reference._type);
        },
    });
}

function getReferencedTypesFromContainer({
    container,
    typeNameToDeclaration,
    typeIdToDeclaredTypeName,
}: {
    container: IrVersions.V2.types.ContainerType;
    typeNameToDeclaration: Record<StringifiedTypeId, IrVersions.V2.types.TypeDeclaration>;
    typeIdToDeclaredTypeName: Record<StringifiedTypeId, IrVersions.V2.types.DeclaredTypeName>;
}): void {
    IrVersions.V2.types.ContainerType._visit(container, {
        list: (itemType) => {
            getReferencedTypesFromReference({ reference: itemType, typeNameToDeclaration, typeIdToDeclaredTypeName });
        },
        set: (itemType) => {
            getReferencedTypesFromReference({ reference: itemType, typeNameToDeclaration, typeIdToDeclaredTypeName });
        },
        optional: (itemType) => {
            getReferencedTypesFromReference({ reference: itemType, typeNameToDeclaration, typeIdToDeclaredTypeName });
        },
        map: ({ keyType, valueType }) => {
            getReferencedTypesFromReference({ reference: keyType, typeNameToDeclaration, typeIdToDeclaredTypeName });
            getReferencedTypesFromReference({ reference: valueType, typeNameToDeclaration, typeIdToDeclaredTypeName });
        },
        literal: noop,
        _unknown: () => {
            throw new Error("Unknown ContainerType: " + container._type);
        },
    });
}

function getReferencedTypesFromTypeName({
    typeName,
    typeNameToDeclaration,
    typeIdToDeclaredTypeName,
}: {
    typeName: IrVersions.V2.types.DeclaredTypeName;
    typeNameToDeclaration: Record<StringifiedTypeId, IrVersions.V2.types.TypeDeclaration>;
    typeIdToDeclaredTypeName: Record<StringifiedTypeId, IrVersions.V2.types.DeclaredTypeName>;
}) {
    const typeId = stringifyTypeName(typeName);
    typeIdToDeclaredTypeName[typeId] = typeName;
    const declaration = typeNameToDeclaration[typeId];
    if (declaration == null) {
        throw new Error("Cannot locate type: " + typeId);
    }
    for (const referencedType of declaration.referencedTypes) {
        typeIdToDeclaredTypeName[stringifyTypeName(referencedType)] = referencedType;
    }
}

function stringifyTypeName(typeName: IrVersions.V2.types.DeclaredTypeName): string {
    return [
        ...typeName.fernFilepathV2.map((part) => part.unsafeName.originalValue),
        typeName.nameV3.unsafeName.originalValue,
    ].join(".");
}
