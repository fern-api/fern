import { SingleUnionTypeProperties, UnionTypeDeclaration } from "@fern-fern/ir-model/types";
import { Zurg } from "@fern-typescript/commons-v2";
import {
    GeneratedUnionType,
    GeneratedUnionTypeSchema,
    TypeSchemaContext,
} from "@fern-typescript/sdk-declaration-handler";
import { GeneratedUnionSchema, RawSingleUnionType } from "@fern-typescript/union-schema-generator";
import { ModuleDeclaration, ts } from "ts-morph";
import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema";
import { RawNoPropertiesSingleUnionType } from "./RawNoPropertiesSingleUnionType";
import { RawSamePropertiesAsObjectSingleUnionType } from "./RawSamePropertiesAsObjectSingleUnionType";
import { RawSinglePropertySingleUnionType } from "./RawSinglePropertySingleUnionType";

export class GeneratedUnionTypeSchemaImpl
    extends AbstractGeneratedTypeSchema<UnionTypeDeclaration>
    implements GeneratedUnionTypeSchema
{
    public readonly type = "union";

    private generatedUnionSchema: GeneratedUnionSchema<TypeSchemaContext>;

    constructor(superInit: AbstractGeneratedTypeSchema.Init<UnionTypeDeclaration>) {
        super(superInit);

        const discriminant = this.shape.discriminantV2;

        this.generatedUnionSchema = new GeneratedUnionSchema({
            discriminant,
            getGeneratedUnion: (context) => this.getGeneratedUnionType(context).getGeneratedUnion(),
            getDefaultCaseForParseTransform: ({ context, parsedValue }) =>
                this.getDefaultCaseForParseTransform({ context, parsedValue }),
            singleUnionTypes: this.shape.types.map((singleUnionType) => {
                const discriminantValue = singleUnionType.discriminantValue;
                return SingleUnionTypeProperties._visit<RawSingleUnionType<TypeSchemaContext>>(singleUnionType.shape, {
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
                            unionTypeName: this.typeDeclaration.name,
                            discriminant,
                            discriminantValue,
                        }),
                    _unknown: () => {
                        throw new Error("Unknown SingleUnionTypeProperties type: " + singleUnionType.shape._type);
                    },
                });
            }),
            typeName: superInit.typeName,
        });
    }

    public override generateRawTypeDeclaration(context: TypeSchemaContext, module: ModuleDeclaration): void {
        this.generatedUnionSchema.generateRawTypeDeclaration(context, module);
    }

    public override getSchema(context: TypeSchemaContext): Zurg.Schema {
        return this.generatedUnionSchema.getSchema(context);
    }

    private getDefaultCaseForParseTransform({
        context,
        parsedValue,
    }: {
        context: TypeSchemaContext;
        parsedValue: ts.Expression;
    }): ts.Statement[] {
        return [
            ts.factory.createReturnStatement(
                this.getGeneratedUnionType(context).addVistMethodToValue({
                    context,
                    parsedValue,
                })
            ),
        ];
    }

    private getGeneratedUnionType(context: TypeSchemaContext): GeneratedUnionType {
        const generatedType = context.getTypeBeingGenerated();
        if (generatedType.type !== "union") {
            throw new Error("Type is not an union: " + this.typeName);
        }
        return generatedType;
    }
}
