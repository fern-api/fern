import { ts } from "ts-morph";
import { getTextOfTsNode } from "./getTextOfTsNode";

export function isExpressionUndefined(expression: ts.Expression): boolean {
    return getTextOfTsNode(expression) === "undefined";
}
