import { noop, visitObject } from "@fern-api/core-utils";
import { NodePath, RawSchemas, visitRawTypeDeclaration } from "@fern-api/fern-definition-schema";

import { DefinitionFileAstVisitor } from "../DefinitionFileAstVisitor";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { visitAllReferencesInExample } from "./utils/visitAllReferencesInExample";
import { createTypeReferenceVisitor } from "./utils/visitTypeReference";

export function visitTypeDeclarations({
    typeDeclarations,
    visitor,
    nodePath
}: {
    typeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> | undefined;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePath: NodePath;
}): void {
    if (typeDeclarations == null) {
        return;
    }
    for (const [typeName, declaration] of Object.entries(typeDeclarations)) {
        const nodePathForType = [...nodePath, typeName];
        visitor.typeName?.(typeName, nodePathForType);
        visitTypeDeclaration({ typeName, declaration, visitor, nodePathForType });
    }
}

export function visitTypeDeclaration({
    typeName,
    declaration,
    visitor,
    nodePathForType
}: {
    typeName: string;
    declaration: RawSchemas.TypeDeclarationSchema;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePathForType: NodePath;
}): void {
    const visitTypeReference = createTypeReferenceVisitor(visitor);

    visitor.typeDeclaration?.(
        { typeName: { isInlined: false, name: typeName }, declaration, nodePath: nodePathForType },
        nodePathForType
    );

    const visitExamples = (examples: RawSchemas.ExampleTypeSchema[] | undefined) => {
        if (examples == null) {
            return;
        }
        for (const [arrayIndex, example] of examples.entries()) {
            const nodePathForExample = [...nodePathForType, { key: "examples", arrayIndex }];
            visitor.exampleType?.({ typeName, typeDeclaration: declaration, example }, nodePathForExample);
            visitAllReferencesInExample({
                example: example.value,
                nodePath: nodePathForExample,
                visitor
            });
        }
    };

    visitRawTypeDeclaration(declaration, {
        alias: (alias) => {
            if (typeof alias === "string") {
                visitTypeReference(alias, nodePathForType);
            } else {
                visitObject(alias, {
                    type: (aliasOf) => {
                        visitTypeReference(aliasOf, [...nodePathForType, "type"]);
                    },
                    docs: createDocsVisitor(visitor, nodePathForType),
                    availability: noop,
                    audiences: noop,
                    examples: visitExamples,
                    validation: noop,
                    encoding: noop,
                    source: noop,
                    inline: noop
                });
            }
        },
        object: (object) => {
            visitObject(object, {
                docs: createDocsVisitor(visitor, nodePathForType),
                extends: (_extends) => {
                    if (_extends == null) {
                        return;
                    }
                    const extendsList: string[] = typeof _extends === "string" ? [_extends] : _extends;
                    for (const extendedType of extendsList) {
                        const nodePathForExtension = [...nodePathForType, "extends", extendedType];
                        visitor.extension?.(extendedType, nodePathForExtension);
                        visitTypeReference(extendedType, nodePathForExtension);
                    }
                },
                properties: (properties) => {
                    if (properties == null) {
                        return;
                    }
                    for (const [propertyKey, property] of Object.entries(properties)) {
                        const nodePathForProperty = [...nodePathForType, "properties", propertyKey];
                        if (typeof property === "string") {
                            visitTypeReference(property, nodePathForProperty);
                        } else {
                            visitObject(property, {
                                name: noop,
                                docs: createDocsVisitor(visitor, nodePathForProperty),
                                availability: noop,
                                type: (type) => {
                                    visitTypeReference(type, [...nodePathForProperty, "type"], {
                                        _default: property.default,
                                        validation: property.validation
                                    });
                                },
                                audiences: noop,
                                encoding: noop,
                                default: noop,
                                validation: noop
                            });
                        }
                    }
                },
                ["extra-properties"]: noop,
                availability: noop,
                audiences: noop,
                encoding: noop,
                source: noop,
                examples: visitExamples,
                inline: noop
            });
        },
        discriminatedUnion: (union) => {
            visitObject(union, {
                docs: createDocsVisitor(visitor, nodePathForType),
                discriminant: noop,
                extends: (_extends) => {
                    if (_extends == null) {
                        return;
                    }
                    const extendsList: string[] = typeof _extends === "string" ? [_extends] : _extends;
                    for (const extendedType of extendsList) {
                        const nodePathForExtension = [...nodePathForType, "extends", extendedType];
                        visitor.extension?.(extendedType, nodePathForExtension);
                        visitTypeReference(extendedType, nodePathForExtension);
                    }
                },
                union: (unionTypes) => {
                    for (const [discriminantValue, unionType] of Object.entries(unionTypes)) {
                        const nodePathForUnionType = [...nodePathForType, "union", discriminantValue];
                        if (typeof unionType === "string") {
                            visitTypeReference(unionType, nodePathForUnionType);
                        } else {
                            visitObject(unionType, {
                                docs: createDocsVisitor(visitor, nodePathForUnionType),
                                name: noop,
                                key: noop,
                                type: (type) => {
                                    if (typeof type === "string") {
                                        visitTypeReference(type, [...nodePathForType, "type"]);
                                    }
                                },
                                ["display-name"]: noop,
                                availability: noop
                            });
                        }
                    }
                },
                "base-properties": noop,
                availability: noop,
                audiences: noop,
                encoding: noop,
                source: noop,
                examples: visitExamples,
                inline: noop
            });
        },
        undiscriminatedUnion: (union) => {
            visitObject(union, {
                docs: createDocsVisitor(visitor, nodePathForType),
                discriminated: noop,
                union: (unionMembers) => {
                    for (const [index, unionMember] of unionMembers.entries()) {
                        const nodePathForUnionType = [...nodePathForType, `union[${index}]`];
                        if (typeof unionMember !== "string") {
                            visitObject(unionMember, {
                                docs: createDocsVisitor(visitor, nodePathForUnionType),
                                type: (type) => {
                                    visitTypeReference(type, [...nodePathForType, "type"]);
                                },
                                "display-name": noop
                            });
                        }
                    }
                },
                availability: noop,
                audiences: noop,
                encoding: noop,
                source: noop,
                examples: visitExamples,
                inline: noop
            });
        },
        enum: (_enum) => {
            visitObject(_enum, {
                docs: createDocsVisitor(visitor, nodePathForType),
                enum: (enumTypes) => {
                    for (const enumType of enumTypes) {
                        const nodePathForEnumType = [
                            ...nodePathForType,
                            typeof enumType === "string" ? enumType : (enumType.name ?? enumType.value)
                        ];

                        if (typeof enumType !== "string") {
                            visitObject(enumType, {
                                docs: createDocsVisitor(visitor, nodePathForEnumType),
                                name: noop,
                                value: noop,
                                casing: noop
                            });
                        }
                    }
                },
                availability: noop,
                audiences: noop,
                default: noop,
                encoding: noop,
                source: noop,
                examples: visitExamples,
                inline: noop
            });
        }
    });
}
