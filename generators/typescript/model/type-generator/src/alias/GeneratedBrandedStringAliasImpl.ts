import {
    GetReferenceOpts,
    getTextOfTsKeyword,
    getTextOfTsNode,
    maybeAddDocsNode,
    maybeAddDocsStructure,
    writerToString
} from "@fern-typescript/commons";
import { BaseContext, BrandedGeneratedAliasType } from "@fern-typescript/contexts";
import {
    FunctionDeclarationStructure,
    ModuleDeclarationStructure,
    StatementStructures,
    StructureKind,
    TypeAliasDeclarationStructure,
    WriterFunction,
    ts
} from "ts-morph";

import { ExampleTypeShape, TypeReference } from "@fern-fern/ir-sdk/api";

import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedBrandedStringAliasImpl<Context extends BaseContext>
    extends AbstractGeneratedType<TypeReference, Context>
    implements BrandedGeneratedAliasType<Context>
{
    public readonly type = "alias";
    public readonly isBranded = true;

    public generateStatements(
        context: Context
    ): string | WriterFunction | (string | WriterFunction | StatementStructures)[] {
        return [this.generateTypeAliasStructure(context), this.generateBuilderFunction(context)];
    }

    public generateForInlineUnion(context: Context): ts.TypeNode {
        const type = writerToString(this.generateTypeAliasStructure(context).type);
        return ts.factory.createTypeReferenceNode(type);
    }

    public generateModule(): ModuleDeclarationStructure | undefined {
        return undefined;
    }

    public getReferenceToCreator(context: Context, opts?: GetReferenceOpts): ts.Expression {
        return this.getReferenceToSelf(context).getExpression(opts);
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "alias") {
            throw new Error("Example is not for an alias");
        }
        return ts.factory.createCallExpression(this.getReferenceToCreator(context, opts), undefined, [
            context.type.getGeneratedExample(example.value).build(context, opts)
        ]);
    }

    private generateTypeAliasStructure(context: Context): TypeAliasDeclarationStructure {
        const referenceToAliasedType = context.type.getReferenceToType(this.shape).typeNode;
        const typeAlias: TypeAliasDeclarationStructure = {
            name: this.typeName,
            kind: StructureKind.TypeAlias,
            type: getTextOfTsNode(
                ts.factory.createIntersectionTypeNode([
                    referenceToAliasedType,
                    ts.factory.createTypeLiteralNode([
                        ts.factory.createPropertySignature(
                            undefined,
                            this.getStringBrand(),
                            undefined,
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                        )
                    ])
                ])
            ),
            isExported: true
        };
        maybeAddDocsStructure(typeAlias, this.getDocs(context));
        return typeAlias;
    }

    private generateBuilderFunction(context: Context): FunctionDeclarationStructure {
        const VALUE_PARAMETER_NAME = "value";
        const builderFunction: FunctionDeclarationStructure = {
            kind: StructureKind.Function,
            name: this.typeName,
            parameters: [
                {
                    name: VALUE_PARAMETER_NAME,
                    type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword)
                }
            ],
            returnType: getTextOfTsNode(this.getReferenceToSelf(context).getTypeNode()),
            statements: [
                getTextOfTsNode(
                    ts.factory.createReturnStatement(
                        ts.factory.createAsExpression(
                            ts.factory.createAsExpression(
                                ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                            ),
                            this.getReferenceToSelf(context).getTypeNode()
                        )
                    )
                )
            ],
            isExported: true
        };
        return builderFunction;
    }

    private getStringBrand(): string {
        return [...this.fernFilepath.packagePath.map((part) => part.camelCase.unsafeName), this.typeName].join("_");
    }
}
