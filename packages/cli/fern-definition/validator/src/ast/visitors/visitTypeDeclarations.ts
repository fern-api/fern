import { noop, visitObject } from "@fern-api/core-utils";
import { NodePath, RawSchemas, visitRawTypeDeclaration } from "@fern-api/fern-definition-schema";
import { DefinitionFileAstVisitor } from "../DefinitionFileAstVisitor";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { visitAllReferencesInExample } from "./utils/visitAllReferencesInExample";
import { createTypeReferenceVisitor } from "./utils/visitTypeReference";

export async function visitTypeDeclarations({
    typeDeclarations,
    visitor,
    nodePath
}: {
    typeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> | undefined;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    if (typeDeclarations == null) {
        return;
    }
    for (const [typeName, declaration] of Object.entries(typeDeclarations)) {
        const nodePathForType = [...nodePath, typeName];
        await visitor.typeName?.(typeName, nodePathForType);
        await visitTypeDeclaration({ typeName, declaration, visitor, nodePathForType });
    }
}

export async function visitTypeDeclaration({
    typeName,
    declaration,
    visitor,
    nodePathForType
}: {
    typeName: string;
    declaration: RawSchemas.TypeDeclarationSchema;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePathForType: NodePath;
}): Promise<void> {
    const visitTypeReference = createTypeReferenceVisitor(visitor);

    await visitor.typeDeclaration?.(
        { typeName: { isInlined: false, name: typeName }, declaration, nodePath: nodePathForType },
        nodePathForType
    );

    const visitExamples = async (examples: RawSchemas.ExampleTypeSchema[] | undefined) => {
        if (examples == null) {
            return;
        }
        for (const [arrayIndex, example] of examples.entries()) {
            const nodePathForExample = [...nodePathForType, { key: "examples", arrayIndex }];
            await visitor.exampleType?.({ typeName, typeDeclaration: declaration, example }, nodePathForExample);
            await visitAllReferencesInExample({
                example: example.value,
                nodePath: nodePathForExample,
                visitor
            });
        }
    };

    await visitRawTypeDeclaration(declaration, {
        alias: async (alias) => {
            if (typeof alias === "string") {
                await visitTypeReference(alias, nodePathForType);
            } else {
                await visitObject(alias, {
                    type: async (aliasOf) => {
                        await visitTypeReference(aliasOf, [...nodePathForType, "type"]);
                    },
                    docs: createDocsVisitor(visitor, nodePathForType),
                    availability: noop,
                    audiences: noop,
                    examples: visitExamples,
                    validation: noop,
                    encoding: noop,
                    source: noop
                });
            }
        },
        object: async (object) => {
            await visitObject(object, {
                docs: createDocsVisitor(visitor, nodePathForType),
                extends: async (_extends) => {
                    if (_extends == null) {
                        return;
                    }
                    const extendsList: string[] = typeof _extends === "string" ? [_extends] : _extends;
                    for (const extendedType of extendsList) {
                        const nodePathForExtension = [...nodePathForType, "extends", extendedType];
                        await visitor.extension?.(extendedType, nodePathForExtension);
                        await visitTypeReference(extendedType, nodePathForExtension);
                    }
                },
                properties: async (properties) => {
                    if (properties == null) {
                        return;
                    }
                    for (const [propertyKey, property] of Object.entries(properties)) {
                        const nodePathForProperty = [...nodePathForType, "properties", propertyKey];
                        if (typeof property === "string") {
                            await visitTypeReference(property, nodePathForProperty);
                        } else {
                            await visitObject(property, {
                                name: noop,
                                docs: createDocsVisitor(visitor, nodePathForProperty),
                                availability: noop,
                                type: async (type) => {
                                    if (typeof type === "string") {
                                        await visitTypeReference(type, [...nodePathForProperty, "type"], {
                                            _default: property.default,
                                            validation: property.validation
                                        });
                                    } // TOOD: handle else case
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
                examples: visitExamples
            });
        },
        discriminatedUnion: async (union) => {
            await visitObject(union, {
                docs: createDocsVisitor(visitor, nodePathForType),
                discriminant: noop,
                extends: async (_extends) => {
                    if (_extends == null) {
                        return;
                    }
                    const extendsList: string[] = typeof _extends === "string" ? [_extends] : _extends;
                    for (const extendedType of extendsList) {
                        const nodePathForExtension = [...nodePathForType, "extends", extendedType];
                        await visitor.extension?.(extendedType, nodePathForExtension);
                        await visitTypeReference(extendedType, nodePathForExtension);
                    }
                },
                union: async (unionTypes) => {
                    for (const [discriminantValue, unionType] of Object.entries(unionTypes)) {
                        const nodePathForUnionType = [...nodePathForType, "union", discriminantValue];
                        if (typeof unionType === "string") {
                            await visitTypeReference(unionType, nodePathForUnionType);
                        } else {
                            await visitObject(unionType, {
                                docs: createDocsVisitor(visitor, nodePathForUnionType),
                                name: noop,
                                key: noop,
                                type: async (type) => {
                                    if (typeof type === "string") {
                                        await visitTypeReference(type, [...nodePathForType, "type"]);
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
                examples: visitExamples
            });
        },
        undiscriminatedUnion: async (union) => {
            await visitObject(union, {
                docs: createDocsVisitor(visitor, nodePathForType),
                discriminated: noop,
                union: async (unionMembers) => {
                    for (const [index, unionMember] of unionMembers.entries()) {
                        const nodePathForUnionType = [...nodePathForType, `union[${index}]`];
                        if (typeof unionMember !== "string") {
                            await visitObject(unionMember, {
                                docs: createDocsVisitor(visitor, nodePathForUnionType),
                                type: async (type) => {
                                    await visitTypeReference(type, [...nodePathForType, "type"]);
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
                examples: visitExamples
            });
        },
        enum: async (_enum) => {
            await visitObject(_enum, {
                docs: createDocsVisitor(visitor, nodePathForType),
                enum: async (enumTypes) => {
                    for (const enumType of enumTypes) {
                        const nodePathForEnumType = [
                            ...nodePathForType,
                            typeof enumType === "string" ? enumType : enumType.name ?? enumType.value
                        ];

                        if (typeof enumType !== "string") {
                            await visitObject(enumType, {
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
                examples: visitExamples
            });
        }
    });
}
