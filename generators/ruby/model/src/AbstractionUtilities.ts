import {
    ClassReferenceFactory,
    DiscriminatedUnion,
    Enum,
    EnumReference,
    Expression,
    Property,
    SerializableObject,
    UndiscriminatedUnion,
    Yardoc
} from "@fern-api/ruby-codegen";
import {
    AliasTypeDeclaration,
    EnumTypeDeclaration,
    ObjectProperty,
    ObjectTypeDeclaration,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";

export function generateAliasDefinitionFromTypeDeclaration(
    classReferenceFactory: ClassReferenceFactory,
    aliasTypeDeclaration: AliasTypeDeclaration,
    typeDeclaration: TypeDeclaration
): Expression {
    // TODO: Make this screaming snake case
    // ideally we make a map of typeID to ClassReference and leverage that instead of generating them by type
    // declaration etc.
    const name = typeDeclaration.name.name.screamingSnakeCase.safeName;
    const rightSide = classReferenceFactory.fromTypeReference(aliasTypeDeclaration.aliasOf);
    return new Expression({ leftSide: name, rightSide, isAssignment: true, documentation: typeDeclaration.docs });
}

export function generateEnumDefinitionFromTypeDeclaration(
    enumTypeDeclaration: EnumTypeDeclaration,
    typeDeclaration: TypeDeclaration
): Expression {
    // TODO: Make this screaming snake case
    // ideally we make a map of typeID to ClassReference and leverage that instead of generating them by type
    // declaration etc.
    const name = typeDeclaration.name.name.screamingSnakeCase.safeName;
    const contents = new Map(
        enumTypeDeclaration.values.map((enumValue) => [
            enumValue.name.name.snakeCase.safeName,
            enumValue.name.wireValue
        ])
    );
    const enum_ = new Enum({ name, contents, documentation: typeDeclaration.docs });

    const yardoc = new Yardoc({
        reference: { name: "typeReference", type: new EnumReference({ name }) }
    });

    return new Expression({
        leftSide: name,
        rightSide: enum_,
        isAssignment: true,
        documentation: typeDeclaration.docs,
        yardoc
    });
}

function isTypeOptional(typeReference: TypeReference): boolean {
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
    propertyOverrides: Map<TypeId, ObjectProperty[]>,
    typeId: TypeId,
    objectTypeDeclaration: ObjectTypeDeclaration,
    typeDeclaration: TypeDeclaration
): SerializableObject {
    const properties = (propertyOverrides.get(typeId) ?? objectTypeDeclaration.properties).map(
        (property) =>
            new Property({
                name: property.name.name.snakeCase.safeName,
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
    propertyOverrides: Map<TypeId, ObjectProperty[]>,
    typeId: TypeId,
    unionTypeDeclaration: UnionTypeDeclaration,
    typeDeclaration: TypeDeclaration
): DiscriminatedUnion {
    const properties = (propertyOverrides.get(typeId) ?? unionTypeDeclaration.baseProperties).map(
        (property) =>
            new Property({
                name: property.name.name.snakeCase.safeName,
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
    unionTypeDeclaration: UndiscriminatedUnionTypeDeclaration,
    typeDeclaration: TypeDeclaration
): UndiscriminatedUnion {
    const memberClasses = unionTypeDeclaration.members.map((member) =>
        classReferenceFactory.fromTypeReference(member.type)
    );

    const classReference = classReferenceFactory.fromDeclaredTypeName(typeDeclaration.name);
    return new UndiscriminatedUnion({ memberClasses, classReference, documentation: typeDeclaration.docs });
}
