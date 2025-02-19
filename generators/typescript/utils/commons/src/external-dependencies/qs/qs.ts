import { ts } from "ts-morph";

export interface qs {
    stringify: (reference: ts.Expression) => ts.CallExpression;
}
