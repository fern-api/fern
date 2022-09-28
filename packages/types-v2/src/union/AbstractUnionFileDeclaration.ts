import { TypeDeclaration, UnionTypeDeclaration } from "@fern-fern/ir-model/types";
import { ParsedSingleUnionType } from "./parsed-single-union-type/AbstractParsedSingleUnionType";

export declare namespace AbstractUnionFileDeclaration {
    export interface Init {
        union: UnionTypeDeclaration;
        typeDeclaration: TypeDeclaration;
        typeName: string;
        parsedSingleUnionTypes: ParsedSingleUnionType[];
    }
}

export abstract class AbstractUnionFileDeclaration {
    protected union: UnionTypeDeclaration;
    protected typeDeclaration: TypeDeclaration;
    protected typeName: string;
    protected parsedSingleUnionTypes: ParsedSingleUnionType[];

    constructor(init: AbstractUnionFileDeclaration.Init) {
        this.union = init.union;
        this.typeDeclaration = init.typeDeclaration;
        this.typeName = init.typeName;
        this.parsedSingleUnionTypes = init.parsedSingleUnionTypes;
    }
}
