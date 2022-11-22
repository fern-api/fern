import { TypeDeclaration } from "@fern-fern/ir-model/types";
import { Reference, TypeContext } from "@fern-typescript/sdk-declaration-handler";

export declare namespace AbstractGeneratedType {
    export interface Init<Shape> {
        typeName: string;
        typeDeclaration: TypeDeclaration;
        shape: Shape;
    }
}

export abstract class AbstractGeneratedType<Shape> {
    protected typeName: string;
    protected typeDeclaration: TypeDeclaration;
    protected shape: Shape;

    constructor({ typeName, typeDeclaration, shape }: AbstractGeneratedType.Init<Shape>) {
        this.typeName = typeName;
        this.typeDeclaration = typeDeclaration;
        this.shape = shape;
    }

    protected getReferenceToSelf(context: TypeContext): Reference {
        return context.getReferenceToNamedType(this.typeDeclaration.name);
    }
}
