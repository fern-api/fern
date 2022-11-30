import { SingleUnionTypeProperty, UnionTypeDeclaration } from "@fern-fern/ir-model/types";
import { GeneratedUnion, GeneratedUnionType, TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { AbstractParsedSingleUnionType, GeneratedUnionImpl } from "@fern-typescript/union-generator";
import { ts } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";
import { ParsedSingleUnionTypeForUnion } from "./ParsedSingleUnionTypeForUnion";

export class GeneratedUnionTypeImpl<Context extends TypeContext>
    extends AbstractGeneratedType<UnionTypeDeclaration, Context>
    implements GeneratedUnionType<Context>
{
    public readonly type = "union";

    private generatedUnion: GeneratedUnionImpl<Context>;

    constructor(superInit: AbstractGeneratedType.Init<UnionTypeDeclaration, Context>) {
        super(superInit);

        const parsedSingleUnionTypes = this.shape.types.map(
            (singleUnionType) =>
                new ParsedSingleUnionTypeForUnion({
                    singleUnionType,
                    union: this.shape,
                })
        );

        this.generatedUnion = new GeneratedUnionImpl({
            typeName: this.typeName,
            getReferenceToUnion: this.getReferenceToSelf.bind(this),
            docs: this.docs,
            discriminant: this.shape.discriminantV2,
            parsedSingleUnionTypes,
            unknownSingleUnionType: {
                discriminantType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
                getVisitorArgument: () =>
                    ts.factory.createTypeLiteralNode([
                        ts.factory.createPropertySignature(
                            undefined,
                            ts.factory.createIdentifier(
                                AbstractParsedSingleUnionType.getDiscriminantKey(this.shape.discriminantV2)
                            ),
                            undefined,
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                        ),
                    ]),
            },
        });
    }

    public writeToFile(context: Context): void {
        this.generatedUnion.writeToFile(context);
    }

    public getGeneratedUnion(): GeneratedUnion<Context> {
        return this.generatedUnion;
    }

    public getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string {
        return ParsedSingleUnionTypeForUnion.getSinglePropertyKey(singleProperty);
    }

    public addVistMethodToValue({
        context,
        parsedValue,
    }: {
        context: Context;
        parsedValue: ts.Expression;
    }): ts.Expression {
        return this.generatedUnion.addVistMethodToValue({ context, parsedValue });
    }
}
