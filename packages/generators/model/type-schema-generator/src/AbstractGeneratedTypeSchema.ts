import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { Reference } from "@fern-typescript/commons";
import { GeneratedType, WithBaseContextMixin } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export declare namespace AbstractGeneratedTypeSchema {
    export interface Init<Shape, Context> {
        typeName: string;
        shape: Shape;
        getGeneratedType: () => GeneratedType<Context>;
        getReferenceToGeneratedType: (context: Context) => ts.TypeNode;
        getReferenceToGeneratedTypeSchema: (context: Context) => Reference;
    }
}

export abstract class AbstractGeneratedTypeSchema<
    Shape,
    Context extends WithBaseContextMixin
> extends AbstractGeneratedSchema<Context> {
    protected shape: Shape;
    protected getGeneratedType: () => GeneratedType<Context>;
    protected getReferenceToGeneratedType: (context: Context) => ts.TypeNode;
    protected getReferenceToSchema: (context: Context) => Reference;

    constructor({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
        getReferenceToGeneratedTypeSchema,
    }: AbstractGeneratedTypeSchema.Init<Shape, Context>) {
        super({ typeName });
        this.shape = shape;
        this.getGeneratedType = getGeneratedType;
        this.getReferenceToGeneratedType = getReferenceToGeneratedType;
        this.getReferenceToSchema = getReferenceToGeneratedTypeSchema;
    }

    public writeToFile(context: Context): void {
        this.writeSchemaToFile(context);
    }

    protected override getReferenceToParsedShape(context: Context): ts.TypeNode {
        return this.getReferenceToGeneratedType(context);
    }
}
