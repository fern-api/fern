import { ts } from "ts-morph";

export function generateJoinPathsCall(a: ts.Expression, b: ts.Expression): ts.Expression {
    return ts.factory.createBinaryExpression(a, ts.factory.createToken(ts.SyntaxKind.PlusToken), b);
}
