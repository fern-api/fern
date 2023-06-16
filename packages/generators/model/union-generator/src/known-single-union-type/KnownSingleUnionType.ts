import { ModelContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { ParsedSingleUnionType } from "../parsed-single-union-type/ParsedSingleUnionType";

export interface KnownSingleUnionType<Context extends ModelContext> extends ParsedSingleUnionType<Context> {
    getDiscriminantValue: () => string | number;
    getDiscriminantValueAsExpression: () => ts.Expression;
}
