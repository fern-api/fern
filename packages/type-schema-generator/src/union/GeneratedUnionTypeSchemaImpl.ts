import { SingleUnionTypeProperties, UnionTypeDeclaration } from "@fern-fern/ir-model/types";
import { Zurg } from "@fern-typescript/commons-v2";
import {
    GeneratedUnionType,
    GeneratedUnionTypeSchema,
    TypeSchemaContext,
} from "@fern-typescript/sdk-declaration-handler";
import {
    GeneratedUnionSchema,
    RawNoPropertiesSingleUnionType,
    RawSingleUnionType,
} from "@fern-typescript/union-schema-generator";
import { ModuleDeclaration, ts } from "ts-morph";
import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema";
import { RawSamePropertiesAsObjectSingleUnionType } from "./RawSamePropertiesAsObjectSingleUnionType";
import { RawSinglePropertySingleUnionType } from "./RawSinglePropertySingleUnionType";

export class GeneratedUnionTypeSchemaImpl<Context extends TypeSchemaContext = TypeSchemaContext>
    extends AbstractGeneratedTypeSchema<UnionTypeDeclaration, Context>
    implements GeneratedUnionTypeSchema<Context>
{
    public readonly type = "union";

    private generatedUnionSchema: GeneratedUnionSchema<Context>;

    constructor(superInit: AbstractGeneratedTypeSchema.Init<UnionTypeDeclaration, Context>) {
        super(superInit);

        const discriminant = this.shape.discriminantV2;

        this.generatedUnionSchema = new GeneratedUnionSchema({
            discriminant,
            getParsedDiscriminant: () => this.getGeneratedUnionType().getGeneratedUnion().discriminant,
            getReferenceToParsedUnion: (context) =>
                this.getGeneratedUnionType().getGeneratedUnion().getReferenceTo(context),
            buildParsedUnion: ({ discriminantValueToBuild, existingValue, context }) =>
                this.getGeneratedUnionType().getGeneratedUnion().buildFromExistingValue({
                    discriminantValueToBuild,
                    existingValue,
                    context,
                }),
            getDefaultCaseForParseTransform: ({ context, parsedValue }) =>
                this.getDefaultCaseForParseTransform({ context, parsedValue }),
            singleUnionTypes: this.shape.types.map((singleUnionType) => {
                const discriminantValue = singleUnionType.discriminantValue;
                return SingleUnionTypeProperties._visit<RawSingleUnionType<Context>>(singleUnionType.shape, {
                    noProperties: () =>
                        new RawNoPropertiesSingleUnionType({
                            discriminant,
                            discriminantValue,
                        }),
                    samePropertiesAsObject: (extended) =>
                        new RawSamePropertiesAsObjectSingleUnionType({
                            extended,
                            discriminant,
                            discriminantValue,
                        }),
                    singleProperty: (singleProperty) =>
                        new RawSinglePropertySingleUnionType({
                            singleProperty,
                            discriminant,
                            discriminantValue,
                            getGeneratedType: this.getGeneratedType.bind(this),
                        }),
                    _unknown: () => {
                        throw new Error("Unknown SingleUnionTypeProperties type: " + singleUnionType.shape._type);
                    },
                });
            }),
            typeName: superInit.typeName,
        });
    }

    public override generateRawTypeDeclaration(context: Context, module: ModuleDeclaration): void {
        this.generatedUnionSchema.generateRawTypeDeclaration(context, module);
    }

    public override getSchema(context: Context): Zurg.Schema {
        return this.generatedUnionSchema.getSchema(context);
    }

    private getDefaultCaseForParseTransform({
        context,
        parsedValue,
    }: {
        context: Context;
        parsedValue: ts.Expression;
    }): ts.Statement[] {
        return [
            ts.factory.createReturnStatement(
                this.getGeneratedUnionType().addVistMethodToValue({
                    context,
                    parsedValue,
                })
            ),
        ];
    }

    private getGeneratedUnionType(): GeneratedUnionType<Context> {
        const generatedType = this.getGeneratedType();
        if (generatedType.type !== "union") {
            throw new Error("Type is not an union: " + this.typeName);
        }
        return generatedType;
    }
}
