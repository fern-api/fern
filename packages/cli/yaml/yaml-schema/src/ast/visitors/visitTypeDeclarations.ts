import { noop, visitObject } from "@fern-api/core-utils";
import { ExampleTypeSchema, TypeDeclarationSchema } from "../../schemas";
import { visitRawTypeDeclaration } from "../../utils/visitRawTypeDeclaration";
import { FernServiceFileAstVisitor } from "../FernServiceFileAstVisitor";
import { NodePath } from "../NodePath";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { visitAllReferencesInExample } from "./utils/visitAllReferencesInExample";

export async function visitTypeDeclarations({
    typeDeclarations,
    visitor,
    nodePath,
}: {
    typeDeclarations: Record<string, TypeDeclarationSchema> | undefined;
    visitor: Partial<FernServiceFileAstVisitor>;
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
    nodePathForType,
}: {
    typeName: string;
    declaration: TypeDeclarationSchema;
    visitor: Partial<FernServiceFileAstVisitor>;
    nodePathForType: NodePath;
}): Promise<void> {
    await visitor.typeDeclaration?.({ typeName: { isInlined: false, name: typeName }, declaration }, nodePathForType);

    const visitExamples = async (examples: ExampleTypeSchema[] | undefined) => {
        if (examples == null) {
            return;
        }
        for (const [arrayIndex, example] of examples.entries()) {
            const nodePathForExample = [...nodePathForType, { key: "examples", arrayIndex }];
            await visitor.exampleType?.({ typeName, typeDeclaration: declaration, example }, nodePathForExample);
            await visitAllReferencesInExample({
                example: example.value,
                nodePath: nodePathForExample,
                visitor,
            });
        }
    };

    await visitRawTypeDeclaration(declaration, {
        alias: async (alias) => {
            if (typeof alias === "string") {
                await visitor.typeReference?.(alias, nodePathForType);
            } else {
                await visitObject(alias, {
                    type: async (aliasOf) => {
                        await visitor.typeReference?.(aliasOf, [...nodePathForType, "type"]);
                    },
                    docs: createDocsVisitor(visitor, nodePathForType),
                    availability: noop,
                    audiences: noop,
                    examples: visitExamples,
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
                        await visitor.typeReference?.(extendedType, [...nodePathForType, "extends"]);
                    }
                },
                properties: async (properties) => {
                    if (properties == null) {
                        return;
                    }
                    for (const [propertyKey, property] of Object.entries(properties)) {
                        const nodePathForProperty = [...nodePathForType, "properties", propertyKey];
                        if (typeof property === "string") {
                            await visitor.typeReference?.(property, nodePathForProperty);
                        } else {
                            await visitObject(property, {
                                name: noop,
                                docs: createDocsVisitor(visitor, nodePathForProperty),
                                availability: noop,
                                type: async (type) => {
                                    await visitor.typeReference?.(type, [...nodePathForProperty, "type"]);
                                },
                                audiences: noop,
                            });
                        }
                    }
                },
                availability: noop,
                audiences: noop,
                examples: visitExamples,
            });
        },
        union: async (union) => {
            await visitObject(union, {
                docs: createDocsVisitor(visitor, nodePathForType),
                discriminant: noop,
                union: async (unionTypes) => {
                    for (const [discriminantValue, unionType] of Object.entries(unionTypes)) {
                        const nodePathForUnionType = [...nodePathForType, "union", discriminantValue];
                        if (typeof unionType === "string") {
                            await visitor.typeReference?.(unionType, nodePathForUnionType);
                        } else {
                            await visitObject(unionType, {
                                docs: createDocsVisitor(visitor, nodePathForUnionType),
                                name: noop,
                                key: noop,
                                type: async (type) => {
                                    if (typeof type === "string") {
                                        await visitor.typeReference?.(type, [...nodePathForType, "type"]);
                                    }
                                },
                            });
                        }
                    }
                },
                "base-properties": noop,
                availability: noop,
                audiences: noop,
                examples: visitExamples,
            });
        },
        enum: async (_enum) => {
            await visitObject(_enum, {
                docs: createDocsVisitor(visitor, nodePathForType),
                enum: async (enumTypes) => {
                    for (const enumType of enumTypes) {
                        const nodePathForEnumType = [
                            ...nodePathForType,
                            typeof enumType === "string" ? enumType : enumType.name ?? enumType.value,
                        ];

                        if (typeof enumType !== "string") {
                            await visitObject(enumType, {
                                docs: createDocsVisitor(visitor, nodePathForEnumType),
                                name: noop,
                                value: noop,
                            });
                        }
                    }
                },
                availability: noop,
                audiences: noop,
                examples: visitExamples,
            });
        },
    });
}
