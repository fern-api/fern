import { ts } from "ts-morph";

export function createPropertyAssignment(
    key: string | ts.PropertyName,
    value: ts.Expression
): ts.ObjectLiteralElementLike {
    const keyAsString = typeof key === "string" ? key : ts.isIdentifier(key) ? key.escapedText : undefined;
    const valueAsString = ts.isIdentifier(value) ? value.escapedText : undefined;
    if (keyAsString == null || valueAsString == null || keyAsString !== valueAsString) {
        return ts.factory.createPropertyAssignment(key, value);
    }
    return ts.factory.createShorthandPropertyAssignment(keyAsString);
}
