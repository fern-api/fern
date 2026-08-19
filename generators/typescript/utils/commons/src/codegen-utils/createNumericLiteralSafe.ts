import { ts } from "ts-morph";

/**
 * Creates a numeric literal expression that safely handles negative numbers.
 *
 * In newer versions of ts-morph/TypeScript, negative numbers must be created
 * using a prefix unary expression with a minus operator, not by passing
 * a negative string/number directly to createNumericLiteral.
 *
 * @param value - The numeric value (can be positive or negative)
 * @returns A TypeScript expression representing the numeric literal
 */
export function createNumericLiteralSafe(value: number | string): ts.NumericLiteral | ts.PrefixUnaryExpression {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (numValue < 0) {
        return ts.factory.createPrefixUnaryExpression(
            ts.SyntaxKind.MinusToken,
            ts.factory.createNumericLiteral(Math.abs(numValue))
        );
    }
    return ts.factory.createNumericLiteral(value);
}

export function createNumericLiteralSafeTypeNode(value: number | string): ts.TypeNode {
    return ts.factory.createLiteralTypeNode(createNumericLiteralSafe(value));
}
