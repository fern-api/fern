import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { Reference } from "@fern-typescript/commons";
import { BaseContext, GeneratedType } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export declare namespace AbstractGeneratedTypeSchema {
    export interface Init<Shape, Context> {
        typeName: string;
        shape: Shape;
        getGeneratedType: () => GeneratedType<Context>;
        getReferenceToGeneratedType: (context: Context) => ts.TypeNode;
        getReferenceToGeneratedTypeSchema: (context: Context) => Reference;
        noOptionalProperties: boolean;
    }
}

export abstract class AbstractGeneratedTypeSchema<
    Shape,
    Context extends BaseContext
> extends AbstractGeneratedSchema<Context> {
    protected shape: Shape;
    protected getGeneratedType: () => GeneratedType<Context>;
    protected getReferenceToSchema: (context: Context) => Reference;
    protected noOptionalProperties: boolean;
    private getReferenceToGeneratedType: (context: Context) => ts.TypeNode;

    constructor({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
        getReferenceToGeneratedTypeSchema,
        noOptionalProperties
    }: AbstractGeneratedTypeSchema.Init<Shape, Context>) {
        super({ typeName });
        this.shape = shape;
        this.getGeneratedType = getGeneratedType;
        this.getReferenceToGeneratedType = getReferenceToGeneratedType;
        this.getReferenceToSchema = getReferenceToGeneratedTypeSchema;
        this.noOptionalProperties = noOptionalProperties;
    }

    public writeToFile(context: Context): void {
        this.writeSchemaToFile(context);
    }

    protected override getReferenceToParsedShape(context: Context): ts.TypeNode {
        return this.getReferenceToGeneratedType(context);
    }
}
