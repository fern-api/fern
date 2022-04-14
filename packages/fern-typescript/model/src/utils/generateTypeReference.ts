import { ContainerType, PrimitiveType, TypeName, TypeReference } from "@fernapi/ir-generation";
import { Directory, SourceFile, ts } from "ts-morph";
import { getImportPathForType } from "./getImportPathForType";

export function generateTypeReference({
    reference,
    from,
    modelDirectory,
}: {
    reference: TypeReference;
    from: SourceFile;
    modelDirectory: Directory;
}): ts.TypeNode {
    return TypeReference.visit(reference, {
        named: (named) => generateTypeNameReference({ typeName: named, from, modelDirectory }),
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
                        generateTypeReference({ reference: map.keyType, from, modelDirectory }),
                        generateTypeReference({ reference: map.valueType, from, modelDirectory }),
                    ]),
                list: (list) =>
                    ts.factory.createArrayTypeNode(generateTypeReference({ reference: list, from, modelDirectory })),
                set: (set) =>
                    ts.factory.createArrayTypeNode(generateTypeReference({ reference: set, from, modelDirectory })),
                optional: (optional) =>
                    ts.factory.createUnionTypeNode([
                        generateTypeReference({ reference: optional, from, modelDirectory }),
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

export function generateTypeNameReference({
    typeName,
    from,
    modelDirectory,
}: {
    typeName: TypeName;
    from: SourceFile;
    modelDirectory: Directory;
}): ts.TypeReferenceNode {
    from.addImportDeclaration({
        moduleSpecifier: getImportPathForType({ from, typeName, modelDirectory }),
        namedImports: [
            {
                name: typeName.name,
            },
        ],
    });

    return ts.factory.createTypeReferenceNode(typeName.name);
}
