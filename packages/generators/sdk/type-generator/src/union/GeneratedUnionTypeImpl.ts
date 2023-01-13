import {
    ExampleSingleUnionTypeProperties,
    ExampleTypeShape,
    SingleUnionTypeProperty,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import { GeneratedUnion, GeneratedUnionType, GetReferenceOpts, TypeContext } from "@fern-typescript/contexts";
import { GeneratedUnionImpl } from "@fern-typescript/union-generator";
import { ts } from "ts-morph";
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
            getDocs: (context: Context) => this.getDocs(context),
            discriminant: this.shape.discriminant.name.camelCase.unsafeName,
            parsedSingleUnionTypes,
            unknownSingleUnionType: new UnknownSingleUnionType({
                singleUnionType: unknownSingleUnionTypeGenerator,
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

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "union") {
            throw new Error("Example is not for an enum");
        }

        return this.generatedUnion.build({
            discriminantValueToBuild: example.wireDiscriminantValue,
            builderArgument: ExampleSingleUnionTypeProperties._visit<ts.Expression | undefined>(example.properties, {
                singleProperty: (property) => context.type.getGeneratedExample(property).build(context, opts),
                samePropertiesAsObject: (exampleNamedType) =>
                    context.type
                        .getGeneratedType(exampleNamedType.typeName)
                        .buildExample(exampleNamedType.shape, context, opts),
                noProperties: () => undefined,
                _unknown: () => {
                    throw new Error("Unknown ExampleSingleUnionTypeProperties: " + example.properties.type);
                },
            }),
            context,
        });
    }
}
