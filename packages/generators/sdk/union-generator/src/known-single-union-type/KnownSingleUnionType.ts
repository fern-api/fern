import { WithBaseContextMixin } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { ParsedSingleUnionType } from "../parsed-single-union-type/ParsedSingleUnionType";

export interface KnownSingleUnionType<Context extends WithBaseContextMixin> extends ParsedSingleUnionType<Context> {
    getDiscriminantValue: () => string | number;
    getDiscriminantValueAsExpression: () => ts.Expression;
}
