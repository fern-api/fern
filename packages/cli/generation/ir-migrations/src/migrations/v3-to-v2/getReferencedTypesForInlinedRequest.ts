import { noop } from "@fern-api/core-utils";

import { IrVersions } from "../../ir-versions";

type StringifiedTypeId = string;

export function getReferencedTypesForInlinedRequest({
    inlinedRequest,
    allTypes
}: {
    inlinedRequest: IrVersions.V3.services.http.InlinedRequestBody;
    allTypes: IrVersions.V2.types.TypeDeclaration[];
}): IrVersions.V2.types.DeclaredTypeName[] {
    const referencedTypes = new Set<StringifiedTypeId>();
    const typeNameToDeclaration: Record<StringifiedTypeId, IrVersions.V2.types.TypeDeclaration> = allTypes.reduce(
        (acc, type) => ({
            ...acc,
            [stringifyTypeName(type.name)]: type
        }),
        {}
    );

    for (const extension of inlinedRequest.extends) {
        getReferencedTypesFromTypeName({ typeName: extension, typeNameToDeclaration, referencedTypes });
    }

    for (const property of inlinedRequest.properties) {
        getReferencedTypesFromReference({
            reference: property.valueType,
            typeNameToDeclaration,
            referencedTypes
        });
    }

    return [...referencedTypes].reduce<IrVersions.V2.types.DeclaredTypeName[]>((names, id) => {
        const declaration = typeNameToDeclaration[id];
        if (declaration == null) {
            throw new Error("Cannot find declaration for ID: " + id);
        }
        return [...names, declaration.name];
    }, []);
}

function getReferencedTypesFromReference({
    reference,
    typeNameToDeclaration,
    referencedTypes
}: {
    reference: IrVersions.V2.types.TypeReference;
    typeNameToDeclaration: Record<StringifiedTypeId, IrVersions.V2.types.TypeDeclaration>;
    referencedTypes: Set<StringifiedTypeId>;
}): void {
    IrVersions.V2.types.TypeReference._visit(reference, {
        primitive: noop,
        container: (container) => {
            getReferencedTypesFromContainer({ container, typeNameToDeclaration, referencedTypes });
        },
        named: (typeName) => {
            getReferencedTypesFromTypeName({ typeName, typeNameToDeclaration, referencedTypes });
        },
        unknown: noop,
        void: noop,
        _unknown: () => {
            throw new Error("Unknown TypeRefrence: " + reference._type);
        }
    });
}

function getReferencedTypesFromContainer({
    container,
    typeNameToDeclaration,
    referencedTypes
}: {
    container: IrVersions.V2.types.ContainerType;
    typeNameToDeclaration: Record<StringifiedTypeId, IrVersions.V2.types.TypeDeclaration>;
    referencedTypes: Set<StringifiedTypeId>;
}): void {
    IrVersions.V2.types.ContainerType._visit(container, {
        list: (itemType) => {
            getReferencedTypesFromReference({ reference: itemType, typeNameToDeclaration, referencedTypes });
        },
        set: (itemType) => {
            getReferencedTypesFromReference({ reference: itemType, typeNameToDeclaration, referencedTypes });
        },
        optional: (itemType) => {
            getReferencedTypesFromReference({ reference: itemType, typeNameToDeclaration, referencedTypes });
        },
        map: ({ keyType, valueType }) => {
            getReferencedTypesFromReference({ reference: keyType, typeNameToDeclaration, referencedTypes });
            getReferencedTypesFromReference({ reference: valueType, typeNameToDeclaration, referencedTypes });
        },
        literal: noop,
        _unknown: () => {
            throw new Error("Unknown ContainerType: " + container._type);
        }
    });
}

function getReferencedTypesFromTypeName({
    typeName,
    typeNameToDeclaration,
    referencedTypes
}: {
    typeName: IrVersions.V2.types.DeclaredTypeName;
    typeNameToDeclaration: Record<StringifiedTypeId, IrVersions.V2.types.TypeDeclaration>;
    referencedTypes: Set<StringifiedTypeId>;
}) {
    const typeId = stringifyTypeName(typeName);
    referencedTypes.add(typeId);
    const declaration = typeNameToDeclaration[typeId];
    if (declaration == null) {
        throw new Error("Cannot locate type: " + typeId);
    }
    for (const referencedType of declaration.referencedTypes) {
        referencedTypes.add(stringifyTypeName(referencedType));
    }
}

function stringifyTypeName(typeName: IrVersions.V2.types.DeclaredTypeName): string {
    return [
        ...typeName.fernFilepathV2.map((part) => part.unsafeName.originalValue),
        typeName.nameV3.unsafeName.originalValue
    ].join(".");
}
