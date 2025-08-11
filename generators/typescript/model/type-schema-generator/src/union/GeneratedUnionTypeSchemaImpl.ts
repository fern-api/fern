import { Zurg } from "@fern-typescript/commons";
import { GeneratedUnionType, GeneratedUnionTypeSchema, ModelContext } from "@fern-typescript/contexts";
import {
    GeneratedUnionSchema,
    RawNoPropertiesSingleUnionType,
    RawSingleUnionType
} from "@fern-typescript/union-schema-generator";
import { ModuleDeclaration, ts } from "ts-morph";

import { SingleUnionTypeProperties, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema";
import { RawSamePropertiesAsObjectSingleUnionType } from "./RawSamePropertiesAsObjectSingleUnionType";
import { RawSinglePropertySingleUnionType } from "./RawSinglePropertySingleUnionType";

export declare namespace GeneratedUnionTypeSchemaImpl {
    export interface Init<Context extends ModelContext>
        extends AbstractGeneratedTypeSchema.Init<UnionTypeDeclaration, Context> {
        includeUtilsOnUnionMembers: boolean;
    }
}

export class GeneratedUnionTypeSchemaImpl<Context extends ModelContext>
    extends AbstractGeneratedTypeSchema<UnionTypeDeclaration, Context>
    implements GeneratedUnionTypeSchema<Context>
{
    public readonly type = "union";

    private generatedUnionSchema: GeneratedUnionSchema<Context>;

    constructor({ includeUtilsOnUnionMembers, ...superInit }: GeneratedUnionTypeSchemaImpl.Init<Context>) {
        super(superInit);
        const discriminant = this.shape.discriminant;

        this.generatedUnionSchema = new GeneratedUnionSchema({
            typeName: superInit.typeName,
            discriminant,
            shouldIncludeDefaultCaseInTransform: true,
            includeUtilsOnUnionMembers,
            getReferenceToSchema: this.getReferenceToSchema,
            getGeneratedUnion: () => this.getGeneratedUnionType().getGeneratedUnion(),
            baseProperties: this.shape.baseProperties,
            singleUnionTypes: this.shape.types.map((singleUnionType) => {
                const discriminantValue = singleUnionType.discriminantValue;
                return SingleUnionTypeProperties._visit<RawSingleUnionType<Context>>(singleUnionType.shape, {
                    noProperties: () =>
                        new RawNoPropertiesSingleUnionType({
                            discriminant,
                            discriminantValue
                        }),
                    samePropertiesAsObject: (extended) =>
                        new RawSamePropertiesAsObjectSingleUnionType({
                            extended,
                            discriminant,
                            discriminantValue
                        }),
                    singleProperty: (singleProperty) =>
                        new RawSinglePropertySingleUnionType({
                            singleProperty,
                            discriminant,
                            discriminantValue,
                            getGeneratedType: this.getGeneratedType.bind(this)
                        }),
                    _other: () => {
                        throw new Error(
                            "Unknown SingleUnionTypeProperties type: " + singleUnionType.shape.propertiesType
                        );
                    }
                });
            })
        });
    }

    public override generateRawTypeDeclaration(context: Context, module: ModuleDeclaration): void {
        this.generatedUnionSchema.generateRawTypeDeclaration(context, module);
    }

    public override buildSchema(context: Context): Zurg.Schema {
        return this.generatedUnionSchema.buildSchema(context);
    }

    public override writeSchemaToFile(context: Context): void {
        this.generatedUnionSchema.writeSchemaToFile(context);
    }

    private getGeneratedUnionType(): GeneratedUnionType<Context> {
        const generatedType = this.getGeneratedType();
        if (generatedType.type !== "union") {
            throw new Error("Type is not an union: " + this.typeName);
        }
        return generatedType;
    }

    protected override getReferenceToParsedShape(context: Context): ts.TypeNode {
        return this.generatedUnionSchema.getReferenceToParsedShape(context);
    }
}
