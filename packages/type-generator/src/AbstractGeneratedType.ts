import { FernFilepathV2 } from "@fern-fern/ir-model/commons";
import { Reference, TypeContext } from "@fern-typescript/sdk-declaration-handler";

export declare namespace AbstractGeneratedType {
    export interface Init<Shape, Context extends TypeContext = TypeContext> {
        typeName: string;
        shape: Shape;
        docs: string | undefined;
        fernFilepath: FernFilepathV2;
        getReferenceToSelf: (context: Context) => Reference;
    }
}

export abstract class AbstractGeneratedType<Shape, Context extends TypeContext = TypeContext> {
    protected typeName: string;
    protected shape: Shape;
    protected docs: string | undefined;
    protected fernFilepath: FernFilepathV2;
    protected getReferenceToSelf: (context: Context) => Reference;

    constructor({
        getReferenceToSelf,
        typeName,
        shape,
        docs,
        fernFilepath,
    }: AbstractGeneratedType.Init<Shape, Context>) {
        this.typeName = typeName;
        this.shape = shape;
        this.getReferenceToSelf = getReferenceToSelf;
        this.docs = docs;
        this.fernFilepath = fernFilepath;
    }
}
