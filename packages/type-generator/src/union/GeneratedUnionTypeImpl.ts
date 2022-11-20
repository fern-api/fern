import { SingleUnionTypeProperty, UnionTypeDeclaration } from "@fern-fern/ir-model/types";
import {
    GeneratedUnion,
    GeneratedUnionType,
    TypeContext,
    TypeSchemaContext,
} from "@fern-typescript/sdk-declaration-handler";
import { AbstractParsedSingleUnionType, GeneratedUnionImpl } from "@fern-typescript/union-generator";
import { ts } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";
import { ParsedSingleUnionTypeForUnion } from "./ParsedSingleUnionTypeForUnion";
import { SinglePropertySingleUnionTypeGenerator } from "./single-union-type-generators/SinglePropertySingleUnionTypeGenerator";

export class GeneratedUnionTypeImpl extends AbstractGeneratedType<UnionTypeDeclaration> implements GeneratedUnionType {
    private generatedUnion: GeneratedUnionImpl<TypeContext>;

    constructor(superInit: AbstractGeneratedType.Init<UnionTypeDeclaration>) {
        super(superInit);

        const parsedSingleUnionTypes = this.shape.types.map(
            (singleUnionType) => new ParsedSingleUnionTypeForUnion({ singleUnionType, union: this.shape })
        );

        this.generatedUnion = new GeneratedUnionImpl({
            typeName: this.typeName,
            getReferenceToUnion: this.getReferenceToSelf.bind(this),
            docs: this.typeDeclaration.docs,
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

    public writeToFile(context: TypeContext): void {
        this.generatedUnion.writeToFile(context);
    }

    public getGeneratedUnion(): GeneratedUnion<TypeContext> {
        return this.generatedUnion;
    }

    public getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string {
        return SinglePropertySingleUnionTypeGenerator.getSinglePropertyKey(singleProperty);
    }

    public addVistMethodToValue({
        context,
        parsedValue,
    }: {
        context: TypeSchemaContext;
        parsedValue: ts.Expression;
    }): ts.Expression {
        return this.generatedUnion.addVistMethodToValue({ context, parsedValue });
    }
}
