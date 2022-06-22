import { ContainerType, PrimitiveType, TypeName, TypeReference } from "@fern-api/api";
import { SourceFile, ts } from "ts-morph";
import { BaseModelContext } from "./BaseModelContext";
import { ImportStrategy } from "./utils/ImportStrategy";

export declare namespace TypeContext {
    namespace getReferenceToType {
        interface Args {
            reference: TypeReference;
            referencedIn: SourceFile;
            importStrategy?: ImportStrategy;
        }
    }
}

export class TypeContext extends BaseModelContext {
    public addTypeDefinition(typeName: TypeName, withFile: (file: SourceFile) => void): void {
        this.addFile({
            fileNameWithoutExtension: typeName.name,
            fernFilepath: typeName.fernFilepath,
            intermediateDirectories: ["types"],
            withFile,
        });
    }

    public getReferenceToType({
        reference,
        referencedIn,
        importStrategy,
    }: TypeContext.getReferenceToType.Args): ts.TypeNode {
        return TypeReference._visit<ts.TypeNode>(reference, {
            named: (typeName) => {
                return this.getReferenceToTypeInModel({
                    exportedType: typeName.name,
                    fernFilepath: typeName.fernFilepath,
                    importStrategy,
                    referencedIn,
                });
            },

            primitive: (primitive) => {
                return PrimitiveType._visit<ts.TypeNode>(primitive, {
                    boolean: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
                    double: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                    integer: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                    long: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                    string: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    dateTime: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    _unknown: () => {
                        throw new Error("Unexpected primitive type: " + primitive);
                    },
                });
            },

            container: (container) => {
                return ContainerType._visit<ts.TypeNode>(container, {
                    map: (map) =>
                        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                            this.getReferenceToType({
                                reference: map.keyType,
                                referencedIn,
                                importStrategy,
                            }),
                            this.getReferenceToType({
                                reference: map.valueType,
                                referencedIn,
                                importStrategy,
                            }),
                        ]),
                    list: (list) =>
                        ts.factory.createArrayTypeNode(
                            this.getReferenceToType({ reference: list, referencedIn, importStrategy })
                        ),
                    set: (set) =>
                        ts.factory.createArrayTypeNode(
                            this.getReferenceToType({ reference: set, referencedIn, importStrategy })
                        ),
                    optional: (optional) =>
                        ts.factory.createUnionTypeNode([
                            this.getReferenceToType({
                                reference: optional,
                                referencedIn,
                                importStrategy,
                            }),
                            ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                        ]),
                    _unknown: () => {
                        throw new Error("Unexpected container type: " + container._type);
                    },
                });
            },

            unknown: () => {
                return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
            },

            void: () => {
                return ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
                ]);
            },

            _unknown: () => {
                throw new Error("Unexpected type reference: " + reference._type);
            },
        });
    }
}
