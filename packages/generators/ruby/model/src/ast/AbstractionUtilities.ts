import {
    AliasTypeDeclaration,
    EnumTypeDeclaration,
    ObjectTypeDeclaration,
    TypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { Enum } from "./abstractions/Enum";
import { SerializableObject } from "./abstractions/SerializableObject";
import { ClassReference } from "./ClassReference";
import { Expression } from "./Expression";
import { Variable, VariableType } from "./Variable";
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

    const yardoc = new Yardoc({ reference: { name: "typeReference", variable: enum_ } });

    return new Expression({
        leftSide: name,
        rightSide: enum_,
        isAssignment: true,
        documentation: typeDeclaration.docs,
        yardoc
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
            new Variable({
                name: property.name.name.snakeCase.safeName,
                type: ClassReference.fromTypeReference(property.valueType),
                variableType: VariableType.CLASS,
                documentation: property.docs
            })
    );

    const classReference = ClassReference.fromDeclaredTypeName(typeDeclaration.name);
    return new SerializableObject({
        classReference,
        extendedClasses,
        properties
    });
}
