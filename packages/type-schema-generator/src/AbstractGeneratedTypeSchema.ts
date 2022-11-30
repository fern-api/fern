import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { GeneratedType, Reference, WithBaseContextMixin } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";

export declare namespace AbstractGeneratedTypeSchema {
    export interface Init<Shape, Context> {
        typeName: string;
        shape: Shape;
        getGeneratedType: () => GeneratedType<Context>;
        getReferenceToGeneratedType: (context: Context) => Reference;
    }
}

export abstract class AbstractGeneratedTypeSchema<
    Shape,
    Context extends WithBaseContextMixin
> extends AbstractGeneratedSchema<Context> {
    protected shape: Shape;
    protected getGeneratedType: () => GeneratedType<Context>;
    protected getReferenceToGeneratedType: (context: Context) => Reference;

    constructor({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
    }: AbstractGeneratedTypeSchema.Init<Shape, Context>) {
        super({ typeName });
        this.shape = shape;
        this.getGeneratedType = getGeneratedType;
        this.getReferenceToGeneratedType = getReferenceToGeneratedType;
    }

    public writeToFile(context: Context): void {
        this.writeSchemaToFile(context);
    }

    protected override getReferenceToParsedShape(context: Context): ts.TypeNode {
        return this.getReferenceToGeneratedType(context).getTypeNode();
    }
}
