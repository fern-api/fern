import { ts } from "ts-morph";

export interface ExpressionReferenceNode {
    isNullable: boolean;
    expression: ts.Expression;
}
