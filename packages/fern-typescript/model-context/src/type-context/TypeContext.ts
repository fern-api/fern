import {
    ContainerType,
    DeclaredTypeName,
    IntermediateRepresentation,
    PrimitiveType,
    Type,
    TypeReference,
} from "@fern-fern/ir-model";
import { ImportStrategy } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { BaseModelContext } from "../base-model-context/BaseModelContext";
import { ResolvedType } from "./ResolvedType";
import { TypeResolver } from "./TypeResolver";

export declare namespace TypeContext {
    namespace getReferenceToType {
        interface Args {
            reference: TypeReference;
            referencedIn: SourceFile;
            importStrategy?: ImportStrategy;
        }
    }

    namespace getReferenceToTypeUtils {
        interface Args {
            typeName: DeclaredTypeName;
            referencedIn: SourceFile;
            importStrategy?: ImportStrategy;
        }
    }
}

export class TypeContext extends BaseModelContext {
    private typeResolver: TypeResolver;

    constructor({
        modelDirectory,
        intermediateRepresentation,
    }: {
        modelDirectory: Directory;
        intermediateRepresentation: IntermediateRepresentation;
    }) {
        super({
            modelDirectory,
            intermediateDirectories: ["types"],
        });
        this.typeResolver = new TypeResolver(intermediateRepresentation);
    }

    public addTypeDeclaration(typeName: DeclaredTypeName, withFile: (file: SourceFile) => void): void {
        this.addFile({
            item: {
                typeName: typeName.name,
                fernFilepath: typeName.fernFilepath,
            },
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
                return this.getReferenceToModelItemType({
                    item: {
                        typeName: typeName.name,
                        fernFilepath: typeName.fernFilepath,
                    },
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
                    uuid: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
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

    public getReferenceToTypeUtils({
        typeName,
        referencedIn,
        importStrategy,
    }: TypeContext.getReferenceToTypeUtils.Args): ts.Expression {
        return this.getReferenceToModelItemValue({
            item: {
                typeName: typeName.name,
                fernFilepath: typeName.fernFilepath,
            },
            referencedIn,
            importStrategy,
        });
    }

    public resolveTypeName(typeName: DeclaredTypeName): ResolvedType {
        return this.typeResolver.resolveTypeName(typeName);
    }

    public resolveTypeReference(typeReference: TypeReference): ResolvedType {
        return this.typeResolver.resolveTypeReference(typeReference);
    }

    public resolveTypeDeclaration(type: Type): ResolvedType {
        return this.typeResolver.resolveTypeDeclaration(type);
    }

    public getTypeDeclarationFromName(typeName: DeclaredTypeName): Type {
        return this.typeResolver.getTypeDeclarationFromName(typeName);
    }

    public doesTypeExist(typeName: DeclaredTypeName): boolean {
        return this.typeResolver.doesTypeExist(typeName);
    }
}
