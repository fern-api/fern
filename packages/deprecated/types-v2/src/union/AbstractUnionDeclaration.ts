import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { Reference, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ParsedSingleUnionType } from "./parsed-single-union-type/ParsedSingleUnionType";

export declare namespace AbstractUnionDeclaration {
    export interface Init {
        getReferenceToUnion: (file: SdkFile) => Reference;
        discriminant: WireStringWithAllCasings;
        docs: string | null | undefined;
        typeName: string;
        parsedSingleUnionTypes: ParsedSingleUnionType[];
    }
}

export abstract class AbstractUnionDeclaration {
    protected getReferenceToUnion: (file: SdkFile) => Reference;
    protected discriminant: WireStringWithAllCasings;
    protected docs: string | null | undefined;
    protected typeName: string;
    protected parsedSingleUnionTypes: ParsedSingleUnionType[];

    constructor(init: AbstractUnionDeclaration.Init) {
        this.getReferenceToUnion = init.getReferenceToUnion;
        this.discriminant = init.discriminant;
        this.docs = init.docs;
        this.typeName = init.typeName;
        this.parsedSingleUnionTypes = init.parsedSingleUnionTypes;
    }
}
