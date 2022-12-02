import { WithBaseContextMixin } from "@fern-typescript/sdk-declaration-handler";
import { ParsedSingleUnionType } from "../parsed-single-union-type/ParsedSingleUnionType";

export interface KnownSingleUnionType<Context extends WithBaseContextMixin> extends ParsedSingleUnionType<Context> {
    getDiscriminantValue: () => string;
}
