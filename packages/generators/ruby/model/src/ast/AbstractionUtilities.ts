import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    AliasTypeDeclaration,
    DeclaredTypeName,
    EnumTypeDeclaration,
    ObjectTypeDeclaration,
    TypeDeclaration,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { TYPES_DIRECTORY } from "../utils/Constants";
import { GeneratedRubyFile } from "../utils/GeneratedRubyFile";
import { DiscriminatedUnion } from "./abstractions/DiscriminatedUnion";
import { Enum, EnumReference } from "./abstractions/Enum";
import { SerializableObject } from "./abstractions/SerializableObject";
import { UndiscriminatedUnion } from "./abstractions/UndiscriminatedUnion";
import { ClassReferenceFactory } from "./classes/ClassReference";
import { Expression } from "./expressions/Expression";
import { ExternalDependency } from "./ExternalDependency";
import { Gemspec } from "./gem/Gemspec";
import { Module_ } from "./Module_";
import { Property } from "./Property";
import { Yardoc } from "./Yardoc";

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
    objectTypeDeclaration: ObjectTypeDeclaration,
    typeDeclaration: TypeDeclaration
): SerializableObject {
    const extendedClasses = objectTypeDeclaration.extends.map((extendedType) =>
        classReferenceFactory.fromDeclaredTypeName(extendedType)
    );
    const properties = objectTypeDeclaration.properties.map(
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
        extendedClasses,
        properties,
        documentation: typeDeclaration.docs
    });
}

export function generateUnionFromTypeDeclaration(
    classReferenceFactory: ClassReferenceFactory,
    unionTypeDeclaration: UnionTypeDeclaration,
    typeDeclaration: TypeDeclaration
): DiscriminatedUnion {
    const extendedClasses = unionTypeDeclaration.extends.map((extendedType) =>
        classReferenceFactory.fromDeclaredTypeName(extendedType)
    );
    const properties = unionTypeDeclaration.baseProperties.map(
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
        extendedClasses,
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

export function getLocationForTypeDeclaration(declaredTypeName: DeclaredTypeName): string {
    return [
        ...declaredTypeName.fernFilepath.allParts.map((pathPart) => pathPart.snakeCase.safeName),
        TYPES_DIRECTORY
    ].join("/");
}

export function generateGemspec(
    clientName: string,
    gemName: string,
    extraDependencies: ExternalDependency[]
): GeneratedRubyFile {
    const gemspec = new Gemspec({ clientName, gemName, dependencies: extraDependencies });
    return new GeneratedRubyFile({
        rootNode: gemspec,
        directoryPrefix: RelativeFilePath.of("."),
        entityName: `${gemName}.gemspec`,
        isConfigurationFile: true
    });
}

// To ensure configuration may be managed independently from dependenies, we introduce a new config file that
// users are encouraged to fernignore and update, while allowing the traditional gemspec to remain generated
export function generateGemConfig(clientName: string): GeneratedRubyFile {
    const gemspec = new Module_({
        name: clientName,
        child: new Module_({
            name: "Gemconfig",
            child: [
                new Expression({ leftSide: "VERSION", rightSide: '""', isAssignment: true }),
                new Expression({ leftSide: "AUTHORS", rightSide: '[""].freeze', isAssignment: true }),
                new Expression({ leftSide: "EMAIL", rightSide: '""', isAssignment: true }),
                new Expression({ leftSide: "SUMMARY", rightSide: '""', isAssignment: true }),
                new Expression({ leftSide: "DESCRIPTION", rightSide: '""', isAssignment: true }),
                // Input some placeholders for installation to work
                new Expression({
                    leftSide: "HOMEPAGE",
                    rightSide: '"https://github.com/REPO/URL"',
                    isAssignment: true
                }),
                new Expression({
                    leftSide: "SOURCE_CODE_URI",
                    rightSide: '"https://github.com/REPO/URL"',
                    isAssignment: true
                }),
                new Expression({
                    leftSide: "CHANGELOG_URI",
                    rightSide: '"https://github.com/REPO/URL/blob/master/CHANGELOG.md"',
                    isAssignment: true
                })
            ]
        })
    });
    return new GeneratedRubyFile({
        rootNode: gemspec,
        directoryPrefix: RelativeFilePath.of("."),
        entityName: "gemconfig.rb"
    });
}
