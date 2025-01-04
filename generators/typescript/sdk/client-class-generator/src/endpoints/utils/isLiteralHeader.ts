import { SdkContext } from "@fern-typescript/contexts";

import { assertNever } from "@fern-api/core-utils";

import { HttpHeader } from "@fern-fern/ir-sdk/api";

export function isLiteralHeader(header: HttpHeader, context: SdkContext): boolean {
    return getLiteralValueForHeader(header, context) != null;
}

export function getLiteralValueForHeader(header: HttpHeader, context: SdkContext): string | boolean | undefined {
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
