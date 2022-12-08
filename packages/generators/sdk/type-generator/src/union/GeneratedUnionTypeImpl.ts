import { SingleUnionTypeProperty, UnionTypeDeclaration } from "@fern-fern/ir-model/types";
import { GeneratedUnion, GeneratedUnionType, TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedUnionImpl } from "@fern-typescript/union-generator";
import { AbstractGeneratedType } from "../AbstractGeneratedType";
import { ParsedSingleUnionTypeForUnion } from "./ParsedSingleUnionTypeForUnion";
import { UnknownSingleUnionType } from "./UnknownSingleUnionType";
import { UnknownSingleUnionTypeGenerator } from "./UnknownSingleUnionTypeGenerator";

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

        const unknownSingleUnionTypeGenerator = new UnknownSingleUnionTypeGenerator();

        this.generatedUnion = new GeneratedUnionImpl({
            typeName: this.typeName,
            getReferenceToUnion: this.getReferenceToSelf.bind(this),
            docs: this.docs,
            discriminant: this.shape.discriminantV2.camelCase,
            parsedSingleUnionTypes,
            unknownSingleUnionType: new UnknownSingleUnionType({
                singleUnionType: unknownSingleUnionTypeGenerator,
                builderParameterName: unknownSingleUnionTypeGenerator.getBuilderParameterName(),
            }),
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
}
