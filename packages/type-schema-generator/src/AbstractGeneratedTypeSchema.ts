import { TypeDeclaration } from "@fern-fern/ir-model/types";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { GeneratedTypeSchema, TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";

export declare namespace AbstractGeneratedTypeSchema {
    export interface Init<Shape> {
        typeName: string;
        typeDeclaration: TypeDeclaration;
        shape: Shape;
    }
}

export abstract class AbstractGeneratedTypeSchema<Shape>
    extends AbstractGeneratedSchema<TypeSchemaContext>
    implements GeneratedTypeSchema
{
    protected typeDeclaration: TypeDeclaration;
    protected shape: Shape;

    constructor({ typeName, typeDeclaration, shape }: AbstractGeneratedTypeSchema.Init<Shape>) {
        super({ typeName });
        this.typeDeclaration = typeDeclaration;
        this.shape = shape;
    }

    public writeToFile(context: TypeSchemaContext): void {
        this.writeSchemaToFile(context);
    }

    protected override getReferenceToParsedShape(context: TypeSchemaContext): ts.TypeNode {
        return context.getReferenceToNamedType(this.typeDeclaration.name).getTypeNode();
    }
}
