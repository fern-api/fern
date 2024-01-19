import {
    AliasTypeDeclaration,
    DeclaredTypeName,
    EnumTypeDeclaration,
    ObjectTypeDeclaration,
    SingleUnionTypeProperties,
    SingleUnionTypeProperty,
    TypeDeclaration,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { TYPES_DIRECTORY } from "../utils/Constants";
import { DiscriminatedUnion } from "./abstractions/DiscriminatedUnion";
import { Enum, EnumReference } from "./abstractions/Enum";
import { SerializableObject } from "./abstractions/SerializableObject";
import { UndiscriminatedUnion } from "./abstractions/UndiscriminatedUnion";
import { ClassReference } from "./classes/ClassReference";
import { Expression } from "./expressions/Expression";
import { Property } from "./Property";
import { Yardoc } from "./Yardoc";

export function generateAliasDefinitionFromTypeDeclaration(
    aliasTypeDeclaration: AliasTypeDeclaration,
    typeDeclaration: TypeDeclaration
): Expression {
    const name = typeDeclaration.name.name.pascalCase.safeName;
    const rightSide = ClassReference.fromTypeReference(aliasTypeDeclaration.aliasOf);
    return new Expression({ leftSide: name, rightSide, isAssignment: true, documentation: typeDeclaration.docs });
}

export function generateEnumDefinitionFromTypeDeclaration(
    enumTypeDeclaration: EnumTypeDeclaration,
    typeDeclaration: TypeDeclaration
): Expression {
    const name = typeDeclaration.name.name.pascalCase.safeName;
    const contents = new Map(
        enumTypeDeclaration.values.map((enumValue) => [
            enumValue.name.name.snakeCase.safeName,
            enumValue.name.wireValue
        ])
    );
    const enum_ = new Enum({ contents, documentation: typeDeclaration.docs });

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
    objectTypeDeclaration: ObjectTypeDeclaration,
    typeDeclaration: TypeDeclaration
): SerializableObject {
    const extendedClasses = objectTypeDeclaration.extends.map((extendedType) =>
        ClassReference.fromDeclaredTypeName(extendedType)
    );
    const properties = objectTypeDeclaration.properties.map(
        (property) =>
            new Property({
                name: property.name.name.snakeCase.safeName,
                type: ClassReference.fromTypeReference(property.valueType),
                documentation: property.docs,
                wireValue: property.name.wireValue,
                isOptional: isTypeOptional(property.valueType)
            })
    );

    const classReference = ClassReference.fromDeclaredTypeName(typeDeclaration.name);
    return new SerializableObject({
        classReference,
        extendedClasses,
        properties,
        documentation: typeDeclaration.docs
    });
}

function visitUnionType(unionShape: SingleUnionTypeProperties) {
    return unionShape._visit({
        samePropertiesAsObject: (value: DeclaredTypeName) => ,
        singleProperty: (value: SingleUnionTypeProperty),
        noProperties: () => ,
        _other: () => {
            throw new Error(
                "Unknown SingleUnionTypeProperties type: " + unionShape.propertiesType
            );
        }
    })
}

export function generateUnionFromTypeDeclaration(
    unionTypeDeclaration: UnionTypeDeclaration,
    typeDeclaration: TypeDeclaration
): DiscriminatedUnion {
    const extendedClasses = unionTypeDeclaration.extends.map((extendedType) =>
        ClassReference.fromDeclaredTypeName(extendedType)
    );
    const properties = unionTypeDeclaration.baseProperties.map(
        (property) =>
            new Property({
                name: property.name.name.snakeCase.safeName,
                type: ClassReference.fromTypeReference(property.valueType),
                documentation: property.docs,
                wireValue: property.name.wireValue,
                isOptional: isTypeOptional(property.valueType)
            })
    );
    const namedSubclasses = unionTypeDeclaration.types.map(
        (t) => [t.discriminantValue.name.snakeCase.safeName, new ClassReference()]
            
    );

    const classReference = ClassReference.fromDeclaredTypeName(typeDeclaration.name);
    return new DiscriminatedUnion({
        classReference,
        extendedClasses,
        discriminatingField: unionTypeDeclaration.discriminant.name.snakeCase.safeName,
        namedSubclasses,
        defaultSubclassReference: namedSubclasses[0],
        documentation: typeDeclaration.docs,
        properties
    });
}

export function generateUndiscriminatedUnionFromTypeDeclaration(
    unionTypeDeclaration: UndiscriminatedUnionTypeDeclaration,
    typeDeclaration: TypeDeclaration
): UndiscriminatedUnion {
    const memberClasses = unionTypeDeclaration.members.map((member) =>
        ClassReference.fromTypeReference(member.type)
    );

    const classReference = ClassReference.fromDeclaredTypeName(typeDeclaration.name);
    return new UndiscriminatedUnion({memberClasses, classReference, documentation: typeDeclaration.docs});
}

export function getLocationForTypeDeclaration(declaredTypeName: DeclaredTypeName): string {
    return [
        ...declaredTypeName.fernFilepath.allParts.map((pathPart) => pathPart.snakeCase.safeName),
        TYPES_DIRECTORY
    ].join("/");
}
