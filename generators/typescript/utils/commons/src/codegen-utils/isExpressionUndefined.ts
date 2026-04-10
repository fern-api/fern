import { ts } from "ts-morph";
import { getTextOfTsNode } from "./getTextOfTsNode.js";

export function isExpressionUndefined(expression: ts.Expression): boolean {
    return getTextOfTsNode(expression) === "undefined";
}
