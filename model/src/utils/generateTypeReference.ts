import { ContainerType, PrimitiveType, TypeName, TypeReference } from "@fern/ir-generation";
import { SourceFile, ts } from "ts-morph";
import { getImportPathForType } from "./getImportPathForType";

export function generateTypeReference(reference: TypeReference, from: SourceFile): ts.TypeNode {
    return TypeReference.visit(reference, {
        named: (named) => generateTypeNameReference(named, from),
        primitive: (primitive) => {
            return PrimitiveType.visit<ts.TypeNode>(primitive, {
                boolean: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
                datetime: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                double: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                integer: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                long: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                string: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                unknown: (value) => {
                    throw new Error("Unexpected primitive type: " + value);
                },
            });
        },
        container: (container) => {
            return ContainerType.visit<ts.TypeNode>(container, {
                map: (map) =>
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                        generateTypeReference(map.keyType, from),
                        generateTypeReference(map.valueType, from),
                    ]),
                list: (list) => ts.factory.createArrayTypeNode(generateTypeReference(list, from)),
                set: (set) => ts.factory.createArrayTypeNode(generateTypeReference(set, from)),
                optional: (optional) =>
                    ts.factory.createUnionTypeNode([
                        generateTypeReference(optional, from),
                        ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                    ]),
                unknown: (value) => {
                    throw new Error("Unexpected container type: " + value.type);
                },
            });
        },
        void: () => {
            return ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
            ]);
        },
        unknown: (value) => {
            throw new Error("Unexpected type reference: " + value.type);
        },
    });
}

export function generateTypeNameReference(typeName: TypeName, from: SourceFile): ts.TypeReferenceNode {
    from.addImportDeclaration({
        moduleSpecifier: getImportPathForType(from, typeName),
        namedImports: [
            {
                name: typeName.name,
            },
        ],
    });

    return ts.factory.createTypeReferenceNode(typeName.name);
}
