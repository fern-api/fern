import { HttpHeader } from "@fern-fern/ir-sdk/api";
import { SdkContext } from "@fern-typescript/contexts";

export function isLiteralHeader(header: HttpHeader, context: SdkContext): boolean {
    return getLiteralValueForHeader(header, context) != null;
}

export function getLiteralValueForHeader(header: HttpHeader, context: SdkContext): string | undefined {
    const resolvedType = context.type.resolveTypeReference(header.valueType);
    if (resolvedType.type === "container" && resolvedType.container.type === "literal") {
        return resolvedType.container.literal.string;
    } else {
        return undefined;
    }
}
