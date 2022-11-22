import { AliasTypeDeclaration, PrimitiveType, TypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsKeyword, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";
import { AbstractSchemaGenerator } from "../AbstractSchemaGenerator";
import { AbstractTypeSchemaGenerator } from "../AbstractTypeSchemaGenerator";

export declare namespace AliasTypeGenerator {
    export interface Init {
        typeDeclaration: TypeDeclaration;
        shape: AliasTypeDeclaration;
        typeName: string;
        shouldUseBrandedStringAliases: boolean;
    }
}

export class AliasTypeGenerator extends AbstractTypeSchemaGenerator {
    private typeDeclaration: TypeDeclaration;
    private shape: AliasTypeDeclaration;
    private shouldUseBrandedStringAliases: boolean;

    constructor({ typeDeclaration, shape, typeName, shouldUseBrandedStringAliases }: AliasTypeGenerator.Init) {
        super({ typeName });
        this.typeDeclaration = typeDeclaration;
        this.shape = shape;
        this.shouldUseBrandedStringAliases = shouldUseBrandedStringAliases;
    }

    public generate({ typeFile, schemaFile }: { typeFile: SdkFile; schemaFile: SdkFile }): void {
        this.writeTypeAlias(typeFile);
        this.writeConst(typeFile);
        this.writeSchemaToFile(schemaFile);
    }

    private writeConst(typeFile: SdkFile) {
        const VALUE_PARAMETER_NAME = "value";
        typeFile.sourceFile.addFunction({
            name: this.typeName,
            parameters: [
                {
                    name: VALUE_PARAMETER_NAME,
                    type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
                },
            ],
            returnType: getTextOfTsNode(this.getReferenceToParsedShape(typeFile)),
            statements: [
                getTextOfTsNode(
                    ts.factory.createReturnStatement(
                        ts.factory.createAsExpression(
                            ts.factory.createAsExpression(
                                ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                            ),
                            this.getReferenceToParsedShape(typeFile)
                        )
                    )
                ),
            ],
            isExported: true,
        });
    }

    private writeTypeAlias(typeFile: SdkFile) {
        const referenceToAliasedType = typeFile.getReferenceToType(this.shape.aliasOf).typeNode;
        const typeAlias = typeFile.sourceFile.addTypeAlias({
            name: this.typeName,
            type: getTextOfTsNode(
                this.isBrandedString()
                    ? ts.factory.createIntersectionTypeNode([
                          referenceToAliasedType,
                          ts.factory.createTypeLiteralNode([
                              ts.factory.createPropertySignature(
                                  undefined,
                                  this.getStringBrand(),
                                  undefined,
                                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                              ),
                          ]),
                      ])
                    : referenceToAliasedType
            ),
            isExported: true,
        });
        maybeAddDocs(typeAlias, this.typeDeclaration.docs);
    }

    protected override getReferenceToParsedShape(file: SdkFile): ts.TypeNode {
        return file.getReferenceToNamedType(this.typeDeclaration.name).getTypeNode();
    }

    protected override generateRawTypeDeclaration(file: SdkFile, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractSchemaGenerator.RAW_TYPE_NAME,
            type: getTextOfTsNode(file.getReferenceToRawType(this.shape.aliasOf).typeNode),
        });
    }

    protected override getSchema(file: SdkFile): Zurg.Schema {
        const schemaOfAlias = file.getSchemaOfTypeReference(this.shape.aliasOf);
        if (!this.isBrandedString()) {
            return schemaOfAlias;
        }

        const VALUE_PARAMETER_NAME = "value";
        return schemaOfAlias.transform({
            newShape: undefined,
            parse: this.getAliasCreator(file),
            json: ts.factory.createArrowFunction(
                undefined,
                undefined,
                [
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        VALUE_PARAMETER_NAME,
                        undefined,
                        undefined
                    ),
                ],
                undefined,
                undefined,
                ts.factory.createIdentifier(VALUE_PARAMETER_NAME)
            ),
        });
    }

    private getAliasCreator(file: SdkFile): ts.Expression {
        return file.getReferenceToNamedType(this.typeDeclaration.name).getExpression();
    }

    private isBrandedString(): boolean {
        return (
            this.shouldUseBrandedStringAliases &&
            this.shape.aliasOf._type === "primitive" &&
            this.shape.aliasOf.primitive === PrimitiveType.String
        );
    }

    private getStringBrand(): string {
        return [
            ...this.typeDeclaration.name.fernFilepathV2.slice(0, -1).map((part) => part.unsafeName.camelCase),
            this.typeName,
        ].join("_");
    }
}
