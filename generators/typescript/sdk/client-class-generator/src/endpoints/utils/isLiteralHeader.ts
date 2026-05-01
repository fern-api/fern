import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { FileContext } from "@fern-typescript/contexts";

export function isLiteralHeader(header: FernIr.HttpHeader, context: FileContext): boolean {
    return getLiteralValueForHeader(header, context) != null;
}

export function getLiteralValueForHeader(
    header: FernIr.HttpHeader,
    context: FileContext
): string | boolean | undefined {
    const resolvedType = context.type.resolveTypeReference(header.valueType);
    if (resolvedType.type === "container" && resolvedType.container.type === "literal") {
        const literal = resolvedType.container.literal;
        switch (literal.type) {
            case "boolean":
                return literal.boolean;
            case "string":
                return literal.string;
            default:
                assertNever(literal);
        }
    } else {
        return undefined;
    }
}

/**
 * Extracts the client default value from a Literal union (string | boolean).
 * Used for headers, query parameters, and path parameters with `clientDefault`.
 */
export function getClientDefaultValue(clientDefault: FernIr.Literal | undefined): string | boolean | undefined {
    if (clientDefault == null) {
        return undefined;
    }
    switch (clientDefault.type) {
        case "boolean":
            return clientDefault.boolean;
        case "string":
            return clientDefault.string;
        default:
            assertNever(clientDefault);
    }
}
