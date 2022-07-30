import { ObjectExtendsSchema, ObjectPropertySchema, TypeDeclarationSchema } from "../../schemas";
import { visitRawTypeDeclaration } from "../../utils/visitRawTypeDeclaration";
import { FernAstVisitor } from "../FernAstVisitor";
import { NodePath } from "../NodePath";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { noop } from "./utils/noop";
import { visitObject } from "./utils/ObjectPropertiesVisitor";

export async function visitTypeDeclarations({
    typeDeclarations,
    visitor,
    nodePath,
}: {
    typeDeclarations: Record<string, TypeDeclarationSchema> | undefined;
    visitor: Partial<FernAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    if (typeDeclarations == null) {
        return;
    }
    for (const [typeName, declaration] of Object.entries(typeDeclarations)) {
        const nodePathForType = [...nodePath, typeName];
        await visitor.typeName?.(typeName, nodePathForType);
        await visitor.typeDeclaration?.({ typeName, declaration }, nodePathForType);
        await visitTypeDeclaration({ declaration, visitor, nodePathForType });
    }
}

export async function visitTypeDeclaration({
    declaration,
    visitor,
    nodePathForType,
}: {
    declaration: TypeDeclarationSchema;
    visitor: Partial<FernAstVisitor>;
    nodePathForType: NodePath;
}): Promise<void> {
    await visitRawTypeDeclaration(declaration, {
        alias: async (alias) => {
            if (typeof alias === "string") {
                await visitor.typeReference?.(alias, nodePathForType);
            } else {
                await visitObject(alias, {
                    alias: async (aliasOf) => {
                        await visitor.typeReference?.(aliasOf, [...nodePathForType, "alias"]);
                    },
                    docs: createDocsVisitor(visitor, nodePathForType),
                });
            }
        },
        object: async (object) => {
            await visitObject(object, {
                docs: createDocsVisitor(visitor, nodePathForType),
                extends: (_extends) => visitExtends({ _extends, visitor, nodePath: nodePathForType }),
                properties: (objectProperties) =>
                    visitObjectProperties({ objectProperties, visitor, nodePath: nodePathForType }),
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
                                type: async (type) => {
                                    if (type != null) {
                                        await visitor.typeReference?.(type, [...nodePathForType, "type"]);
                                    }
                                },
                            });
                        }
                    }
                },
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
            });
        },
    });
}

export async function visitExtends({
    _extends,
    visitor,
    nodePath,
}: {
    _extends: ObjectExtendsSchema | undefined;
    visitor: Partial<FernAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    if (_extends == null) {
        return;
    }
    const extendsList: string[] = typeof _extends === "string" ? [_extends] : _extends;
    for (const extendedType of extendsList) {
        await visitor.typeReference?.(extendedType, [...nodePath, "extends"]);
    }
}

export async function visitObjectProperties({
    objectProperties,
    visitor,
    nodePath,
}: {
    objectProperties: Record<string, ObjectPropertySchema> | undefined;
    visitor: Partial<FernAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    if (objectProperties == null) {
        return;
    }
    for (const [propertyKey, property] of Object.entries(objectProperties)) {
        const nodePathForProperty = [...nodePath, "properties", propertyKey];
        if (typeof property === "string") {
            await visitor.typeReference?.(property, nodePathForProperty);
        } else {
            await visitObject(property, {
                docs: createDocsVisitor(visitor, nodePathForProperty),
                type: async (type) => {
                    await visitor.typeReference?.(type, [...nodePathForProperty, "type"]);
                },
            });
        }
    }
}
