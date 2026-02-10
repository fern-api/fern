import { FernIrV39 as FernIr } from "@fern-fern/ir-sdk";
import {
    Class_,
    ClassReferenceFactory,
    DiscriminatedUnion,
    Enum,
    Expression,
    Property,
    SerializableObject,
    UndiscriminatedUnion
} from "@fern-api/ruby-codegen";

export function generateAliasDefinitionFromTypeDeclaration(
    classReferenceFactory: ClassReferenceFactory,
    aliasTypeDeclaration: FernIr.AliasTypeDeclaration,
    typeDeclaration: FernIr.TypeDeclaration
): Expression {
    const name = typeDeclaration.name.name.screamingSnakeCase.safeName;
    const rightSide = classReferenceFactory.fromTypeReference(aliasTypeDeclaration.aliasOf);
    return new Expression({ leftSide: name, rightSide, isAssignment: true, documentation: typeDeclaration.docs });
}

export function generateEnumDefinitionFromTypeDeclaration(
    classReferenceFactory: ClassReferenceFactory,
    enumTypeDeclaration: FernIr.EnumTypeDeclaration,
    typeDeclaration: FernIr.TypeDeclaration
): Class_ {
    const classReference = classReferenceFactory.fromTypeDeclaration(typeDeclaration);
    return new Enum({ enumTypeDeclaration, classReference, documentation: typeDeclaration.docs });
}

function isTypeOptional(typeReference: FernIr.TypeReference): boolean {
    return typeReference._visit<boolean>({
        container: (ct) => {
            return ct._visit<boolean>({
                list: () => false,
                map: () => false,
                optional: () => true,
                set: () => false,
                literal: () => false,
                _other: () => false
            });
        },
        named: () => false,
        primitive: () => false,
        _other: () => false,
        unknown: () => false
    });
}

export function generateSerializableObjectFromTypeDeclaration(
    classReferenceFactory: ClassReferenceFactory,
    propertyOverrides: Map<FernIr.TypeId, FernIr.ObjectProperty[]>,
    typeId: FernIr.TypeId,
    objectTypeDeclaration: FernIr.ObjectTypeDeclaration,
    typeDeclaration: FernIr.TypeDeclaration
): SerializableObject {
    const properties = (propertyOverrides.get(typeId) ?? objectTypeDeclaration.properties).map(
        (property) =>
            new Property({
                name: Property.getNameFromIr(property.name.name),
                type: classReferenceFactory.fromTypeReference(property.valueType),
                documentation: property.docs,
                wireValue: property.name.wireValue,
                isOptional: isTypeOptional(property.valueType)
            })
    );

    const classReference = classReferenceFactory.fromDeclaredTypeName(typeDeclaration.name);
    return new SerializableObject({
        classReference,
        properties,
        documentation: typeDeclaration.docs
    });
}

export function generateUnionFromTypeDeclaration(
    classReferenceFactory: ClassReferenceFactory,
    propertyOverrides: Map<FernIr.TypeId, FernIr.ObjectProperty[]>,
    typeId: FernIr.TypeId,
    unionTypeDeclaration: FernIr.UnionTypeDeclaration,
    typeDeclaration: FernIr.TypeDeclaration
): DiscriminatedUnion {
    const properties = (propertyOverrides.get(typeId) ?? unionTypeDeclaration.baseProperties).map(
        (property) =>
            new Property({
                name: Property.getNameFromIr(property.name.name),
                type: classReferenceFactory.fromTypeReference(property.valueType),
                documentation: property.docs,
                wireValue: property.name.wireValue,
                isOptional: isTypeOptional(property.valueType)
            })
    );
    const namedSubclasses = unionTypeDeclaration.types.map((t) => {
        return {
            discriminantValue: t.discriminantValue,
            classReference: classReferenceFactory.classReferenceFromUnionType(t.shape),
            unionPropertiesType: t.shape
        };
    });

    const classReference = classReferenceFactory.fromDeclaredTypeName(typeDeclaration.name);
    return new DiscriminatedUnion({
        classReference,
        discriminantField: unionTypeDeclaration.discriminant.wireValue,
        namedSubclasses,
        defaultSubclassReference: namedSubclasses[0]?.classReference,
        documentation: typeDeclaration.docs,
        properties
    });
}

export function generateUndiscriminatedUnionFromTypeDeclaration(
    classReferenceFactory: ClassReferenceFactory,
    unionTypeDeclaration: FernIr.UndiscriminatedUnionTypeDeclaration,
    typeDeclaration: FernIr.TypeDeclaration
): UndiscriminatedUnion {
    const memberClasses = unionTypeDeclaration.members.map((member) =>
        classReferenceFactory.fromTypeReference(member.type)
    );

    const classReference = classReferenceFactory.fromDeclaredTypeName(typeDeclaration.name);
    return new UndiscriminatedUnion({ memberClasses, classReference, documentation: typeDeclaration.docs });
}
