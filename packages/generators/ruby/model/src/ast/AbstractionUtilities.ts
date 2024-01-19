import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    AliasTypeDeclaration,
    DeclaredTypeName,
    EnumTypeDeclaration,
    ObjectTypeDeclaration,
    TypeDeclaration,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { TYPES_DIRECTORY } from "../utils/Constants";
import { GeneratedRubyFile } from "../utils/GeneratedRubyFile";
import { Enum, EnumReference } from "./abstractions/Enum";
import { SerializableObject } from "./abstractions/SerializableObject";
import { ClassReference } from "./classes/ClassReference";
import { Expression } from "./expressions/Expression";
import { ExternalDependency } from "./ExternalDependency";
import { Gemspec } from "./gem/Gemspec";
import { Module_ } from "./Module_";
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
        properties
    });
}

export function getLocationForTypeDeclaration(declaredTypeName: DeclaredTypeName): string {
    return [
        ...declaredTypeName.fernFilepath.allParts.map((pathPart) => pathPart.snakeCase.safeName),
        TYPES_DIRECTORY
    ].join("/");
}

export function generateGemspec(gemName: string, extraDependencies: ExternalDependency[]): GeneratedRubyFile {
    const gemspec = new Gemspec({ moduleName: gemName, dependencies: extraDependencies });
    return new GeneratedRubyFile({
        rootNode: gemspec,
        directoryPrefix: RelativeFilePath.of("."),
        entityName: `${gemName}.gemspec`
    });
}

// To ensure configuration may be managed independently from dependenies, we introduce a new config file that
// users are encouraged to fernignore and update, while allowing the traditional gemspec to remain generated
export function generateGemConfig(gemName: string): GeneratedRubyFile {
    const gemspec = new Module_({
        name: gemName,
        child: new Module_({
            name: "Gem",
            child: [
                new Expression({ leftSide: "NAME", rightSide: `"${gemName}"` }),
                new Expression({ leftSide: "VERSION", rightSide: '""' }),
                new Expression({ leftSide: "AUTHORS", rightSide: '[""]' }),
                new Expression({ leftSide: "EMAIL", rightSide: '""' }),
                new Expression({ leftSide: "SUMMARY", rightSide: '""' }),
                new Expression({ leftSide: "DESCRIPTION", rightSide: '""' }),
                new Expression({ leftSide: "HOMEPAGE", rightSide: '""' }),
                new Expression({ leftSide: "SOURCE_CODE_URI", rightSide: '""' }),
                new Expression({ leftSide: "CHANGELOG_URI", rightSide: '""' })
            ]
        })
    });
    return new GeneratedRubyFile({
        rootNode: gemspec,
        directoryPrefix: RelativeFilePath.of("."),
        entityName: "gemconfig.rb"
    });
}
