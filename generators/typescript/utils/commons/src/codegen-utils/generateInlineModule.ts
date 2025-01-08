import {
    ModuleDeclarationKind,
    ModuleDeclarationStructure,
    StatementStructures,
    StructureKind,
    TypeAliasDeclarationStructure,
    WriterFunction
} from "ts-morph";

import { assertNever } from "@fern-api/core-utils";

import { DeclaredTypeName, MapType, NamedType, TypeDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";

import { InlineConsts } from "./inlineConsts";

export function generateInlinePropertiesModule({
    generateStatements,
    getTypeDeclaration,
    parentTypeName,
    properties
}: InlinePropertiesParams): ModuleDeclarationStructure | undefined {
    const inlineProperties = getInlineProperties(properties, getTypeDeclaration);
    if (inlineProperties.length === 0) {
        return;
    }
    return {
        kind: StructureKind.Module,
        name: parentTypeName,
        isExported: true,
        hasDeclareKeyword: false,
        declarationKind: ModuleDeclarationKind.Namespace,
        statements: inlineProperties.flatMap(
            ([propertyName, typeReference, typeDeclaration]: [string, TypeReference, TypeDeclaration]) => {
                return generateTypeVisitor(typeReference, {
                    named: () => generateStatements(typeDeclaration.name, propertyName),
                    list: () => propertyListOrSetStatementGenerator(propertyName, typeDeclaration, generateStatements),
                    set: () => propertyListOrSetStatementGenerator(propertyName, typeDeclaration, generateStatements),
                    map: () => {
                        const statements: StatementStructures[] = [];
                        const mapModule: ModuleDeclarationStructure = {
                            kind: StructureKind.Module,
                            declarationKind: ModuleDeclarationKind.Namespace,
                            isExported: true,
                            hasDeclareKeyword: false,
                            name: propertyName,
                            statements: generateStatements(typeDeclaration.name, InlineConsts.MAP_VALUE_TYPE_NAME)
                        };

                        statements.push(mapModule);
                        return statements;
                    },
                    other: () => {
                        throw new Error(`Only named, list, map, and set properties can be inlined.
                              Property: ${JSON.stringify(propertyName)}`);
                    }
                });
            }
        )
    };
}

function propertyListOrSetStatementGenerator(
    propertyName: string,
    typeDeclaration: TypeDeclaration,
    generateStatements: GenerateStatements
) {
    const statements: StatementStructures[] = [];
    const listType: TypeAliasDeclarationStructure = {
        kind: StructureKind.TypeAlias,
        name: propertyName,
        type: `${propertyName}.${InlineConsts.LIST_ITEM_TYPE_NAME}[]`,
        isExported: true
    };
    statements.push(listType);

    const listModule: ModuleDeclarationStructure = {
        kind: StructureKind.Module,
        declarationKind: ModuleDeclarationKind.Namespace,
        isExported: true,
        hasDeclareKeyword: false,
        name: propertyName,
        statements: generateStatements(typeDeclaration.name, InlineConsts.LIST_ITEM_TYPE_NAME)
    };

    statements.push(listModule);
    return statements;
}

export function generateInlineAliasModule({
    generateStatements,
    getTypeDeclaration,
    aliasTypeName,
    typeReference
}: InlineAliasParams): ModuleDeclarationStructure | undefined {
    const inlineModuleStatements = generateTypeVisitor(typeReference, {
        list: (itemType) => aliasListOrSetStatementGenerator(itemType, generateStatements, getTypeDeclaration),
        set: (itemType) => aliasListOrSetStatementGenerator(itemType, generateStatements, getTypeDeclaration),
        map: (mapType: MapType) => {
            const namedType = getNamedType(mapType.valueType);
            if (!namedType) {
                return undefined;
            }
            const typeDeclaration = getTypeDeclaration(namedType);
            if (!typeDeclaration.inline) {
                return undefined;
            }

            return generateStatements(typeDeclaration.name, InlineConsts.MAP_VALUE_TYPE_NAME);
        },
        named: () => undefined,
        other: () => undefined
    });
    if (!inlineModuleStatements) {
        return undefined;
    }
    return {
        kind: StructureKind.Module,
        name: aliasTypeName,
        isExported: true,
        hasDeclareKeyword: false,
        declarationKind: ModuleDeclarationKind.Namespace,
        statements: inlineModuleStatements
    };
}

function aliasListOrSetStatementGenerator(
    listItemType: TypeReference,
    generateStatements: GenerateStatements,
    getTypeDeclaration: GetTypeDeclaration
): undefined | string | WriterFunction | (string | WriterFunction | StatementStructures)[] {
    const namedType = getNamedType(listItemType);
    if (!namedType) {
        return undefined;
    }
    const typeDeclaration = getTypeDeclaration(namedType);
    if (!typeDeclaration.inline) {
        return undefined;
    }

    return generateStatements(typeDeclaration.name, InlineConsts.LIST_ITEM_TYPE_NAME);
}

function getInlineProperties(
    properties: Property[],
    getTypeDeclaration: GetTypeDeclaration
): [string, TypeReference, TypeDeclaration][] {
    return properties
        .map(({ propertyName, typeReference }): [string, TypeReference, TypeDeclaration] | undefined => {
            const declaration = getInlineTypeDeclaration(typeReference, getTypeDeclaration);
            if (!declaration) {
                return undefined;
            }
            return [propertyName, typeReference, declaration];
        })
        .filter((x): x is [string, TypeReference, TypeDeclaration] => x !== undefined);
}

function getInlineTypeDeclaration(
    typeReference: TypeReference,
    getTypeDeclaration: GetTypeDeclaration
): TypeDeclaration | undefined {
    const namedType = getNamedType(typeReference);
    if (!namedType) {
        return undefined;
    }
    const typeDeclaration = getTypeDeclaration(namedType);
    if (!typeDeclaration.inline) {
        return undefined;
    }

    return typeDeclaration;
}

export interface InlinePropertiesParams {
    generateStatements: GenerateStatements;
    getTypeDeclaration: GetTypeDeclaration;
    parentTypeName: string;
    properties: Property[];
}

interface Property {
    typeReference: TypeReference;
    propertyName: string;
}

export interface InlineAliasParams {
    generateStatements: GenerateStatements;
    getTypeDeclaration: GetTypeDeclaration;
    typeReference: TypeReference;
    aliasTypeName: string;
}

type GenerateStatements = (
    typeName: DeclaredTypeName,
    typeNameOverride?: string
) => string | WriterFunction | (string | WriterFunction | StatementStructures)[];

type GetTypeDeclaration = (namedType: NamedType) => TypeDeclaration;

function generateTypeVisitor<TOut>(
    typeReference: TypeReference,
    visitor: {
        named: (namedType: NamedType) => TOut;
        list: (itemType: TypeReference) => TOut;
        map: (mapType: MapType) => TOut;
        set: (itemType: TypeReference) => TOut;
        other: () => TOut;
    }
): TOut {
    return typeReference._visit({
        named: visitor.named,
        primitive: visitor.other,
        unknown: visitor.other,
        container: (containerType) =>
            containerType._visit({
                list: visitor.list,
                literal: visitor.other,
                map: visitor.map,
                set: visitor.set,
                optional: (typeReference) => generateTypeVisitor(typeReference, visitor),
                _other: visitor.other
            }),
        _other: visitor.other
    });
}

function getNamedType(typeReference: TypeReference): NamedType | undefined {
    switch (typeReference.type) {
        case "named":
            return typeReference;
        case "container":
            switch (typeReference.container.type) {
                case "optional":
                    return getNamedType(typeReference.container.optional);
                case "list":
                    return getNamedType(typeReference.container.list);
                case "map":
                    return getNamedType(typeReference.container.valueType);
                case "set":
                    return getNamedType(typeReference.container.set);
                case "literal":
                    return undefined;
                default:
                    assertNever(typeReference.container);
            }
        // fallthrough
        case "primitive":
            return undefined;
        case "unknown":
            return undefined;
        default:
            assertNever(typeReference);
    }
}
