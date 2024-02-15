import { ts } from "ts-morph";

export interface BaseCoreUtilities {
    addNonEnumerableProperty: (object: ts.Expression, key: ts.Expression, value: ts.Expression) => ts.Expression;
}
