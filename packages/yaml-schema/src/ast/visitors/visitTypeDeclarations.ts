import { TypeDeclarationSchema } from "../../schemas";
import { visitRawTypeDeclaration } from "../../utils/visitRawTypeDeclaration";
import { FernAstVisitor } from "../FernAstVisitor";
import { NodePath } from "../NodePath";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { noop } from "./utils/noop";
import { visitObject } from "./utils/ObjectPropertiesVisitor";

export function visitTypeDeclarations({
    typeDeclarations,
    visitor,
    nodePath,
}: {
    typeDeclarations: Record<string, TypeDeclarationSchema> | undefined;
    visitor: Partial<FernAstVisitor>;
    nodePath: NodePath;
}): void {
    if (typeDeclarations == null) {
        return;
    }
    for (const [typeName, declaration] of Object.entries(typeDeclarations)) {
        const nodePathForType = [...nodePath, typeName];
        visitor.typeName?.(typeName, nodePathForType);
        visitor.typeDeclaration?.({ typeName, declaration }, nodePathForType);
        visitTypeDeclaration({ declaration, visitor, nodePathForType });
    }
}

export function visitTypeDeclaration({
    declaration,
    visitor,
    nodePathForType,
}: {
    declaration: TypeDeclarationSchema;
    visitor: Partial<FernAstVisitor>;
    nodePathForType: NodePath;
}): void {
    visitRawTypeDeclaration(declaration, {
        alias: (alias) => {
            if (typeof alias === "string") {
                visitor.typeReference?.(alias, nodePathForType);
            } else {
                visitObject(alias, {
                    alias: (aliasOf) => {
                        visitor.typeReference?.(aliasOf, [...nodePathForType, "alias"]);
                    },
                    docs: createDocsVisitor(visitor, nodePathForType),
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
                        visitor.typeReference?.(extendedType, [...nodePathForType, "extends"]);
                    }
                },
                properties: (properties) => {
                    if (properties == null) {
                        return;
                    }
                    for (const [propertyKey, property] of Object.entries(properties)) {
                        const nodePathForProperty = [...nodePathForType, "properties", propertyKey];
                        if (typeof property === "string") {
                            visitor.typeReference?.(property, nodePathForProperty);
                        } else {
                            visitObject(property, {
                                docs: createDocsVisitor(visitor, nodePathForProperty),
                                type: (type) => {
                                    visitor.typeReference?.(type, [...nodePathForProperty, "type"]);
                                },
                            });
                        }
                    }
                },
            });
        },
        union: (union) => {
            visitObject(union, {
                docs: createDocsVisitor(visitor, nodePathForType),
                discriminant: noop,
                union: (unionTypes) => {
                    for (const [discriminantValue, unionType] of Object.entries(unionTypes)) {
                        const nodePathForUnionType = [...nodePathForType, "union", discriminantValue];
                        if (typeof unionType === "string") {
                            visitor.typeReference?.(unionType, nodePathForUnionType);
                        } else {
                            visitObject(unionType, {
                                docs: createDocsVisitor(visitor, nodePathForUnionType),
                                type: (type) => {
                                    if (type != null) {
                                        visitor.typeReference?.(type, [...nodePathForType, "type"]);
                                    }
                                },
                            });
                        }
                    }
                },
            });
        },
        enum: (_enum) => {
            visitObject(_enum, {
                docs: createDocsVisitor(visitor, nodePathForType),
                enum: (enumTypes) => {
                    for (const enumType of enumTypes) {
                        const nodePathForEnumType = [
                            ...nodePathForType,
                            typeof enumType === "string" ? enumType : enumType.name ?? enumType.value,
                        ];

                        if (typeof enumType !== "string") {
                            visitObject(enumType, {
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
